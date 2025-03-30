import os
import numpy as np
import pandas as pd

# Ordner mit Originaldaten
input_folder = "SisFall_original"
output_folder = "SisFall_40Hz"
os.makedirs(output_folder, exist_ok=True)

# Originale Samplingrate von SisFall (ungefähr)
original_hz = 200  # ADXL345 kann 100Hz bis 3200Hz - viele Sets nutzen 200Hz

# Ziel-Samplingrate
target_hz = 40
factor = int(original_hz / target_hz)

# ADXL345 Umrechnungsfaktor für ±16g bei 13 Bit: 16g / 4096 = 0.00390625
SCALE_G = 0.00390625

# Funktion zum Downsampling mit Mittelwert
def downsample(data, factor):
    n = len(data) // factor * factor
    data = data[:n]
    return data.reshape(-1, factor, data.shape[1]).mean(axis=1)

for file in os.listdir(input_folder):
    if file.endswith(".txt"):
        filepath = os.path.join(input_folder, file)

        # Datei einlesen (CSV-Format ohne Header, ; als Zeilenende, Trennung durch Kommas)
        raw_lines = open(filepath).read().split(";")
        raw_lines = [line.strip() for line in raw_lines if line.strip()]
        data = [list(map(int, line.split(","))) for line in raw_lines]
        df = pd.DataFrame(data)

        # Annahme: Die ersten drei Spalten sind accX, accY, accZ
        acc_data = df.iloc[:, 0:3].values
        acc_down = downsample(acc_data, factor)

        # Umwandlung in g-Force
        acc_down = acc_down * SCALE_G

        # Zeitstempel generieren: 25ms Abstand = 40Hz
        timestamps = np.arange(acc_down.shape[0]) * 25

        df_out = pd.DataFrame({
            "timestamp": timestamps,
            "accX": acc_down[:, 0],
            "accY": acc_down[:, 1],
            "accZ": acc_down[:, 2]
        })

        out_file = file.replace(".txt", ".csv")
        df_out.to_csv(os.path.join(output_folder, out_file), index=False)
        print(f"✅ {file} verarbeitet und gespeichert als {out_file} in {output_folder}")

print("\nFertig! Alle SisFall-Daten wurden auf 40Hz reduziert und in g-Force umgerechnet.")
