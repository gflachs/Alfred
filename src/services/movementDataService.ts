import { supabase } from "../utils/supabase";
import type { MovementData } from "../types/movementData";
import { Observable } from "../utils/observable";

/** Speichert die aktuellen Bewegungsdaten */
let currentMovementData: MovementData | null = null;

// const movementDataObservable: Observable<void> = new Observable<void>(); // Auskommentiert, wird nicht verwendet

/** Observable für Sturzerkennung */
const fallingDataObservable: Observable<void> = new Observable<void>();

/**
 * Abonniert Benachrichtigungen bei Sturzerkennung.
 * @param {() => void} observer - Funktion, die bei einem Sturz aufgerufen wird
 */
export const subscribeToFalling = (observer: () => void) => {
  console.log("subscribe to falling");
  fallingDataObservable.subscribe(observer);
};

/**
 * Entfernt ein Abonnement von Sturzerkennungs-Benachrichtigungen.
 * @param {() => void} observer - Funktion, die nicht mehr aufgerufen werden soll
 */
export const unsubscribeFromFalling = (observer: () => void) => {
  fallingDataObservable.unsubscribe(observer);
};

/**
 * Verarbeitet neue Werte von einem Bluetooth-Gerät und speichert sie in der Datenbank.
 * @param {number} value - Der empfangene Wert (z. B. Bewegungstyp oder Sturz)
 */
export const handleNewValue = async (value: number) => {
  console.log("New value:", value);

  // Sturz erkannt (value = 4), benachrichtige Observer und beende Funktion
  if (value === 4) {
    fallingDataObservable.notify();
    return;
  }

  // Hole den aktuellen Benutzer
  const user = await supabase.auth.getSession();
  if (!user || !user.data.session?.user) {
    console.error("User not logged in.");
    return;
  }

  // Wenn sich der Bewegungstyp geändert hat oder keine aktuellen Daten vorliegen
  if (!currentMovementData || currentMovementData.idMovementType !== value) {
    if (currentMovementData) {
      // Beende die vorherige Bewegung, indem die Endzeit aktualisiert wird
      const { error } = await supabase
        .from("MovementData")
        .update({ endedAt: new Date() })
        .eq("idMovementData", currentMovementData.idMovementData)
        .single();

      if (error) {
        console.error(
          "Error updating end time of last movement data entry:",
          error
        );
        return;
      }
    }

    // Füge neue Bewegungsdaten in die Datenbank ein
    const { data, error } = await supabase
      .from("MovementData")
      .insert([
        {
          user_id: user.data.session.user.id,
          idMovementType: value,
          startedAt: new Date(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting new value into database:", error);
      return;
    }

    // Aktualisiere die aktuellen Bewegungsdaten mit dem neuen Eintrag
    currentMovementData = data;
  }
};
