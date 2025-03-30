#include <ArduinoBLE.h>
#include <Arduino_LSM9DS1.h>
//Besseres Netz, welches sehr gut vorhersagt, aber sobald BLE dazukommt gibt es Probleme, für vorführungszwecke deswegen das andere #include <Alfred_eigene_Daten_v2_inferencing.h> 
#include <Alfred3.0_v1_inferencing.h> // Eigenes Header-File für Inferenz, dieses Netz ist aber das schlechtere, arbeitet aber besser mit BLE

// BLE Service und Characteristic Definition
BLEService stateService("c38a205a-5dc3-4126-86d1-487028603576");          // Erstellt einen BLE-Service mit eindeutiger UUID
BLEIntCharacteristic stateCharacteristic("c38a205a-5dc3-4126-86d1-487028603576", BLERead | BLENotify); // Characteristic für Statusübertragung (lesbar und benachrichtigt Clients)

// Globale Zustände
int currentStateIndex = 0;          // Aktueller Zustand des Systems
volatile bool newStateAvailable = false;  // Flag für neuen verfügbaren Zustand
volatile int nextStateValue = 0;    // Wert des nächsten Zustands
bool isConnected = false;           // Verbindungsstatus mit BLE-Client

// Edge Impulse spezifische Variablen
static bool debug_nn = false;       // Debug-Modus für neuronales Netzwerk
static uint32_t run_inference_every_ms = 200; // Intervall für Inferenz in Millisekunden
static rtos::Thread inference_thread(osPriorityLow); // Thread für Hintergrund-Inferenz
static float buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE] = { 0 }; // Puffer für Sensordaten
static float inference_buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE]; // Puffer für Inferenzdaten
#define CONVERT_G_TO_MS2    9.80665f    // Umrechnungsfaktor von g zu m/s²
#define MAX_ACCEPTED_RANGE  2.0f        // Maximal akzeptierter Bereich für Beschleunigung

void run_inference_background();    // Deklaration der Hintergrund-Inferenz-Funktion

volatile bool buffer_ready = false; // Flag für bereitgestellten Puffer

// Funktion zum Mappen von String-Labels auf Integer-Werte
int labelToState(const char* label) {
    if (strcmp(label, "idle") == 0) return 1;      // "Ruhezustand" -> 1
    if (strcmp(label, "falling") == 0) return 4;   // "Fallen" -> 4
    if (strcmp(label, "walking") == 0) return 3;   // "Gehen" -> 3
    if (strcmp(label, "uncertain") == 0) return -1; // "Unsicher" -> -1
    return -1;                                     // Standardwert bei unbekanntem Label
}

// Hilfsfunktion zur Bestimmung des Vorzeichens einer Zahl
float ei_get_sign(float number) {
    return (number >= 0.0) ? 1.0 : -1.0;
}

void setup() {
    Serial.begin(9600);         // Startet serielle Kommunikation mit 9600 Baud
    while (!Serial);            // Wartet auf serielle Verbindung

    // BLE Initialisierung
    if (!BLE.begin()) {
        Serial.println("Fehler beim Starten von BLE!");
        while (1);              // Endlosschleife bei Fehler
    }

    BLE.setLocalName("Alfred");        // Setzt den BLE-Gerätenamen
    BLE.setAdvertisedService(stateService); // Definiert den beworbenen Service
    stateService.addCharacteristic(stateCharacteristic); // Fügt Characteristic zum Service hinzu
    BLE.addService(stateService);      // Fügt Service zu BLE hinzu
    stateCharacteristic.writeValue(0); // Initialwert der Characteristic
    BLE.advertise();                  // Startet BLE-Broadcast
    Serial.println("BLE-Gerät ist bereit und sendet Zustände...");

    // IMU Initialisierung
    if (!IMU.begin()) {
        ei_printf("Failed to initialize IMU!\r\n");
    } else {
        ei_printf("IMU initialized\r\n");
    }

    // Überprüft Modellkompatibilität
    if (EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME != 3) {
        ei_printf("ERR: EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME should be equal to 3\n");
        return;
    }

    inference_thread.start(mbed::callback(&run_inference_background)); // Startet Inferenz-Thread
}

// Hintergrundfunktion für kontinuierliche Inferenz
void run_inference_background() {
    delay((EI_CLASSIFIER_INTERVAL_MS * EI_CLASSIFIER_RAW_SAMPLE_COUNT) + 100); // Wartezeit vor Start

    ei_classifier_smooth_t smooth;    // Struktur für Glättung der Klassifikation
    ei_classifier_smooth_init(&smooth, 10, 7, 0.7, 0.3); // Initialisiert Glättungsparameter

    while (1) {
        if (buffer_ready) { //versuch missing values zu vermeiden, nicht mehr mit Arduino vertestet, aber sollte evtl. helfen
            memcpy(inference_buffer, buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE * sizeof(float));
            buffer_ready = false;
            
            memcpy(inference_buffer, buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE * sizeof(float)); // Kopiert Daten für Inferenz

            signal_t signal;
            int err = numpy::signal_from_buffer(inference_buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal); // Erstellt Signal aus Puffer
            if (err != 0) {
                ei_printf("Failed to create signal from buffer (%d)\n", err);
                continue;
            }

            ei_impulse_result_t result = { 0 };
            err = run_classifier(&signal, &result, debug_nn); // Führt Klassifikation durch
            if (err != EI_IMPULSE_OK) {
                ei_printf("ERR: Failed to run classifier (%d)\n", err);
                continue;
            }

            const char *prediction = ei_classifier_smooth_update(&smooth, &result); // Aktualisiert Vorhersage mit Glättung
            ei_printf("Prediction: %s\n", prediction);

            int newState = labelToState(prediction); // Mappt Vorhersage auf Zustandswert

            if (newState != -1 && newState != currentStateIndex) { // Wenn neuer Zustand gültig und anders
                nextStateValue = newState;
                newStateAvailable = true;   // Setzt Flag für neuen Zustand
            }

        }
        delay(run_inference_every_ms); // Wartet bis zur nächsten Inferenz
    }

    ei_classifier_smooth_free(&smooth); // Gibt Glättungsstruktur frei (wird hier nie erreicht)
}

void loop() {
    BLEDevice central = BLE.central(); // Prüft auf verbundene Zentraleinheit

    // Verbindungsstatus überwachen
    if (central) {
        if (central.connected()) {
            if (!isConnected) {
                Serial.println("Verbunden mit Zentraleinheit.");
                isConnected = true;
            }
        } else {
            if (isConnected) {
                Serial.println("Verbindung verloren.");
                isConnected = false;
            }
        }
    }

    // Sendet neuen Zustand, wenn verfügbar und verbunden
    if (newStateAvailable && isConnected) {
        stateCharacteristic.writeValue(nextStateValue); // Sendet neuen Zustand über BLE
        currentStateIndex = nextStateValue;             // Aktualisiert aktuellen Zustand
        newStateAvailable = false;                      // Setzt Flag zurück
        Serial.print("Gesendet (aus loop): ");
        Serial.println(currentStateIndex);
    }

    // Zeitsteuerung für Datenakquisition
    uint64_t next_tick = micros() + (EI_CLASSIFIER_INTERVAL_MS * 1000);

    numpy::roll(buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, -3); // Verschiebt Puffer um 3 Elemente
    IMU.readAcceleration(    // Liest neue Beschleunigungsdaten
        buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 3],
        buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 2],
        buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 1]
    );

    // Begrenzt Beschleunigungswerte
    for (int i = 0; i < 3; i++) {
        if (fabs(buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 3 + i]) > MAX_ACCEPTED_RANGE) {
            buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 3 + i] = ei_get_sign(buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 3 + i]) * MAX_ACCEPTED_RANGE;
        }
    }

    // Konvertiert g zu m/s²
    buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 3] *= CONVERT_G_TO_MS2;
    buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 2] *= CONVERT_G_TO_MS2;
    buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE - 1] *= CONVERT_G_TO_MS2;

    // Setzt Puffer bereit-Flag
    buffer_ready = true;

    // Zeitliche Synchronisation
    uint64_t time_to_wait = next_tick - micros();
    delay((int)floor((float)time_to_wait / 1000.0f));
    delayMicroseconds(time_to_wait % 1000);
}

// Überprüft Sensorkompatibilität mit Modell
#if !defined(EI_CLASSIFIER_SENSOR) || EI_CLASSIFIER_SENSOR != EI_CLASSIFIER_SENSOR_ACCELEROMETER
#error "Invalid model for current sensor"
#endif