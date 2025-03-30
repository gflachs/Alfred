import os
import pickle
import numpy as np
import pandas as pd
import ast

# Klasse DataProcessor: Verarbeitet die Rohdaten und exportiert Samples als CSV-Dateien. Nur Beschleunigungsdaten werden berücksichtigt.
class DataProcessor:
    def __init__(self, pkl_path, output_folder, label):
        # Konstruktor: Initialisiert die Parameter für den Datenprozessor.
        # pkl_path: Pfad zur Pickle-Datei mit den Daten.
        # output_folder: Ordner, in den die exportierten CSV-Dateien geschrieben werden.
        # label: Kennzeichnung, die im Dateinamen der exportierten Dateien verwendet wird.
        self.pkl_path = pkl_path
        self.output_folder = output_folder
        self.label = label
        self.df = None  # DataFrame für die geladenen Daten
        self.df_filtered = None # DataFrame für die gefilterten Daten
        os.makedirs(self.output_folder, exist_ok=True)

    def load_data(self):
         # Lädt die Daten aus der Pickle-Datei und speichert sie im DataFrame self.df.
        with open(self.pkl_path, "rb") as file:
            self.df = pickle.load(file)

    @staticmethod
    def parse_array(data):
        # Konvertiert die Eingabe 'data' in ein NumPy-Array.
        # Falls 'data' ein String ist, wird versucht, diesen in ein Array zu parsen.
        if isinstance(data, str):
            try:
                data = data.replace("\n", " ")
                return np.array(ast.literal_eval(data))
            except:
                return np.empty((0, 3))
        return np.array(data)

    def parse_columns(self):
        # Wendet die Funktion 'parse_array' auf die Spalte "Acc" des DataFrames an,
        # um sicherzustellen, dass die Beschleunigungsdaten als NumPy-Arrays vorliegen.
        self.df["Acc"] = self.df["Acc"].apply(self.parse_array)
        # self.df["Gyr"] = self.df["Gyr"].apply(self.parse_array)  # Entfernt

    def filter_data(self, activity_min=101, activity_max=135, device="waist"):
        # Filtert den DataFrame basierend auf:
        # - ActivityID: Nur Zeilen, deren ActivityID zwischen activity_min und activity_max liegt.
        # - Device: Nur Zeilen, bei denen das Gerät (Device) dem angegebenen Gerät entspricht (hier "waist").
        self.df_filtered = self.df[
            (self.df["ActivityID"] >= activity_min) &
            (self.df["ActivityID"] <= activity_max) &
            (self.df["Device"].str.lower() == device.lower())
        ]

    def export_samples(self):
        # Exportiert die gefilterten Daten in einzelne CSV-Dateien.
        count = 0
        for idx, row in self.df_filtered.iterrows():
            acc = row["Acc"]

            acc = acc[320:600]

            if acc.shape[1] == 3:
                # Erstelle Zeitstempel für jedes Sample. Da die Sampling-Rate 40Hz beträgt,
                # entspricht jedes Sample 25ms (1000ms/40).
                timestamps = np.arange(0, acc.shape[0]) * 25  # 40Hz = 25ms
                sample_df = pd.DataFrame({
                    "timestamp": timestamps,
                    "accX": acc[:, 0],
                    "accY": acc[:, 1],
                    "accZ": acc[:, 2]
                })

                activity_id = row["ActivityID"]
                filename = f"{self.label}_act{activity_id}_{idx}.csv"
                sample_df.to_csv(os.path.join(self.output_folder, filename), index=False)
                count += 1

        print(f"✅ {count} CSV-Dateien wurden exportiert in: {self.output_folder}")

    def run(self, activity_min=101, activity_max=135):
        # Führt den gesamten Datenverarbeitungsprozess aus:
        # 1. Laden der Daten
        # 2. Parsen der Spalten
        # 3. Filtern der Daten basierend auf ActivityID und Gerät
        # 4. Exportieren der gefilterten Samples als CSV-Dateien
        self.load_data()
        self.parse_columns()
        self.filter_data(activity_min=activity_min, activity_max=activity_max)
        self.export_samples()


if __name__ == "__main__":
    processor = DataProcessor(
        pkl_path="FallAllD_40SamplesPerSec_ActivityIdsFiltered.pkl",
        output_folder="turningWhileLying_sample",
        label="turningLying"
    )
    # Der run-Aufruf wird hier mit spezifischen Werten für activity_min und activity_max ausgeführt.
    # In diesem Fall werden nur Zeilen mit ActivityID == 17 verarbeitet. Falls keine spezifischen
    # Werte angegeben werden, werden standardmäßig ActivityIDs zwischen 101 und 135 verwendet. Dies entspricht 'falling'.
    processor.run(activity_min=17, activity_max=17)
