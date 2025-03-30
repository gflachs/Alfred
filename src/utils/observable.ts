/** Typdefinition für eine Observer-Funktion, die Daten vom Typ T verarbeitet */
export type ObserverFunction<T> = (data: T) => void;

/**
 * Eine Klasse, die das Observer-Pattern implementiert, um Abonnenten über Datenänderungen zu informieren.
 * @template T - Der Typ der Daten, die beobachtet werden
 */
export class Observable<T> {
  /** Array von Observer-Funktionen, die auf Änderungen reagieren */
  private observers: ObserverFunction<T>[] = [];

  /**
   * Fügt einen neuen Observer hinzu, der bei Änderungen benachrichtigt wird.
   * @param {ObserverFunction<T>} observer - Funktion, die bei Datenänderungen aufgerufen wird
   */
  subscribe(observer: ObserverFunction<T>) {
    console.log("subscribe");
    this.observers.push(observer);
  }

  /**
   * Entfernt einen Observer aus der Liste der Abonnenten.
   * @param {ObserverFunction<T>} observer - Funktion, die nicht mehr benachrichtigt werden soll
   */
  unsubscribe(observer: ObserverFunction<T>) {
    console.log("unsubscribe");
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  /**
   * Benachrichtigt alle Observer über neue Daten.
   * @param {T} data - Die Daten, die an die Observer weitergegeben werden
   */
  notify(data: T) {
    console.log("notify");
    this.observers.forEach((observer) => observer(data));
  }
}
