/// <reference types="web-bluetooth" />

import { Observable } from "../utils/observable.ts";

/**
 * Eine Singleton-Klasse zur Verwaltung der Bluetooth-Verbindung und -Benachrichtigungen.
 */
export class BluetoothService {
  /** Observable für den Verbindungsstatus (true = verbunden, false = getrennt) */
  private connectionStatus = new Observable<boolean>();

  /** Observable für neue Werte von der Bluetooth-Charakteristik */
  private newValueObservable = new Observable<number | undefined>();

  /** UUID des Bluetooth-Dienstes */
  private SERVICE_UUID: BluetoothServiceUUID = "";

  /** UUID der Bluetooth-Charakteristik */
  private CHARACTERISTIC_UUID: BluetoothCharacteristicUUID =
    "c38a205a-5dc3-4126-86d1-487028603576";

  /** Das verbundene Bluetooth-Gerät */
  private device: BluetoothDevice | null = null;

  /** Der GATT-Server des verbundenen Geräts */
  private server: BluetoothRemoteGATTServer | null = null;

  /** Singleton-Instanz der Klasse */
  private static instance: BluetoothService;

  /** Privater Konstruktor für Singleton-Pattern */
  private constructor() {}

  /**
   * Gibt die Singleton-Instanz der BluetoothService-Klasse zurück.
   * @returns {BluetoothService} Die Singleton-Instanz
   */
  public static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  /**
   * Setzt die UUID des Bluetooth-Dienstes.
   * @param {string} uuid - Die UUID des Dienstes
   */
  setServiceUUID(uuid: string) {
    this.SERVICE_UUID = uuid;
  }

  /**
   * Erstellt ein Promise, das nach einem Timeout fehlschlägt.
   * @param {number} milliseconds - Timeout in Millisekunden
   * @returns {Promise<void>} Promise, das bei Timeout fehlschlägt
   */
  timeoutPromise(milliseconds: number): Promise<void> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            "Timeout: Die Verbindung konnte nicht innerhalb der vorgegebenen Zeit hergestellt werden."
          )
        );
      }, milliseconds);
    });
  }

  /**
   * Versucht, eine Verbindung zu einem Bluetooth-Gerät herzustellen und Benachrichtigungen zu starten.
   * @returns {Promise<boolean>} True bei Erfolg, False bei Fehler
   */
  async tryConnect(): Promise<boolean> {
    return navigator.bluetooth
      .requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.SERVICE_UUID],
      })
      .then(async (selectedDevice) => {
        this.device = selectedDevice;
        this.device.addEventListener(
          "gattserverdisconnected",
          this.onDisconnected.bind(this)
        );
        if (!this.device.gatt) {
          throw new Error("GATT Server nicht verfügbar.");
        }
        try {
          const connServer = await Promise.race([
            this.device.gatt.connect(),
            this.timeoutPromise(10000),
          ]);
          if (!connServer) {
            throw new Error(
              "Timeout: Die Verbindung konnte nicht innerhalb der vorgegebenen Zeit hergestellt werden."
            );
          }
          return connServer;
        } catch (error) {
          console.error(error);
          throw new Error("Verbindungsfehler oder Timeout");
        }
      })
      .then((connectedServer) => {
        this.server = connectedServer;
        return this.server.getPrimaryService(this.SERVICE_UUID);
      })
      .then((service) => service.getCharacteristic(this.CHARACTERISTIC_UUID))
      .then((characteristic) => {
        characteristic.startNotifications();
        characteristic.addEventListener(
          "characteristicvaluechanged",
          (event) => {
            const value = (
              event.target as BluetoothRemoteGATTCharacteristic
            ).value?.getUint16(0, true);
            this.newValueObservable.notify(value);
          }
        );
        this.connectionStatus.notify(true);
        return true;
      })
      .catch((error) => {
        console.error("Connection failed:", error);
        return false;
      });
  }

  /**
   * Trennt die Bluetooth-Verbindung, falls vorhanden.
   */
  disconnect() {
    if (this.server && this.server.connected) {
      this.server.disconnect();
    }
  }

  /**
   * Prüft, ob Bluetooth vom Browser unterstützt wird.
   * @returns {boolean} True, wenn Bluetooth verfügbar ist
   */
  isBluetoothSupported(): boolean {
    return "bluetooth" in navigator;
  }

  /**
   * Prüft, ob Bluetooth auf dem Gerät aktiviert ist.
   * @returns {Promise<boolean>} True, wenn Bluetooth aktiviert ist
   */
  isBluetoothEnabled(): Promise<boolean> {
    return (navigator as Navigator).bluetooth.getAvailability();
  }

  /**
   * Prüft, ob ein Bluetooth-Gerät verbunden ist.
   * @returns {boolean} True, wenn ein Gerät verbunden ist
   */
  isBluetoothDeviceConnected(): boolean {
    return (
      this.device !== null &&
      this.device.gatt !== undefined &&
      this.device.gatt.connected
    );
  }

  /**
   * Prüft, ob der Bluetooth-Service verfügbar ist.
   * @returns {boolean} True, wenn der Service verfügbar ist
   */
  isBluetoothServiceAvailable(): boolean {
    return this.server !== null && this.server.connected;
  }

  /**
   * Handler für das Trennen der Verbindung, benachrichtigt Observer.
   */
  onDisconnected(): void {
    this.connectionStatus.notify(false);
  }

  /**
   * Abonniert den Verbindungsstatus.
   * @param {(status: boolean) => void} observer - Funktion, die bei Statusänderung aufgerufen wird
   */
  subscribeToConnectionStatus(observer: (status: boolean) => void): void {
    this.connectionStatus.subscribe(observer);
  }

  /**
   * Entfernt ein Abonnement vom Verbindungsstatus.
   * @param {(status: boolean) => void} observer - Funktion, die nicht mehr aufgerufen werden soll
   */
  unsubscribeFromConnectionStatus(observer: (status: boolean) => void): void {
    this.connectionStatus.unsubscribe(observer);
  }

  /**
   * Abonniert neue Werte von der Bluetooth-Charakteristik.
   * @param {(value: any | undefined) => void} observer - Funktion, die bei neuen Werten aufgerufen wird
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToNewValue(observer: (value: any | undefined) => void): void {
    this.newValueObservable.subscribe(observer);
  }

  /**
   * Entfernt ein Abonnement von neuen Werten.
   * @param {(value: any | undefined) => void} observer - Funktion, die nicht mehr aufgerufen werden soll
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unsubscribeFromNewValue(observer: (value: any | undefined) => void): void {
    this.newValueObservable.unsubscribe(observer);
  }
}
