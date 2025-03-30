import os
import json
import numpy as np

# Skript zum Konvertieren von Beschleunigungsdaten in g-Force in Place aus den exportierten JSON-Files von Edge Impulse.
# Liste der Eingabeverzeichnisse, in denen die JSON-Dateien liegen.
input_dirs = ["training", "testing"]

# Skalierungsfaktor für LSM9DS1 im ±8g Bereich
# ACC_SCALE =  16384

# Durchlaufe jedes Verzeichnis in der Liste input_dirs
for input_dir in input_dirs:
    for filename in os.listdir(input_dir):
        if filename.endswith(".json") and filename != "labels.json":
            filepath = os.path.join(input_dir, filename)

            with open(filepath, "r") as file:
                data = json.load(file)
            # Hole den "payload"-Teil der Daten, Standard ist ein leeres Dict
            payload = data.get("payload", {})
            interval_ms = payload.get("interval_ms", 25)
            values = payload.get("values", [])

            # Konvertiere die Werte in ein NumPy-Array und skaliere sie in g-Force um.
            # Die Skalierung erfolgt hier mit dem Faktor 8.0 / 32768.0.
            values = (np.array(values) * 8.0 / 32768.0).tolist()

            # Neue Werte zurückschreiben
            data["payload"]["values"] = values

            # Datei überschreiben
            with open(filepath, "w") as file:
                json.dump(data, file, indent=2)

            print(f"✅ Konvertiert in g-Force: {filepath}")

print("\nAlle JSON-Dateien wurden erfolgreich in g-Force umgerechnet und gespeichert.")