import { supabase } from "../utils/supabase";
import type { MovementData, MovementType } from "../types/movementData";
import { EmergencyContact } from "../types/emergencyContact";
import { UserProfile } from "../types/userProfile";
import { Observable, ObserverFunction } from "../utils/observable";

/** Typdefinition für den Cache mit allen Tabellen-Daten */
interface Cache {
  UserProfile: UserProfile | null;
  MovementData: MovementData[] | null;
  MovementType: MovementType[] | null;
  EmergencyContacts: EmergencyContact[] | null;
}

/** Optionen für die Abfrage von MovementData */
interface MovementDataQueryOptions {
  startDate?: Date;
  endDate?: Date;
  idMovementType?: number;
}

/** Typdefinition für Tabellennamen */
type TableName =
  | "UserProfile"
  | "MovementData"
  | "MovementType"
  | "EmergencyContacts";

/** Typdefinition für die Payload-Daten basierend auf dem Tabellennamen */
type PayloadData<T extends TableName> = T extends "UserProfile"
  ? UserProfile
  : T extends "MovementData"
  ? MovementData
  : T extends "MovementType"
  ? MovementType
  : T extends "EmergencyContacts"
  ? EmergencyContact
  : never;

/** Typdefinition für die Payload-Struktur bei Datenbankänderungen */
interface Payload<T extends TableName> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: PayloadData<T> | PayloadData<T>[];
  old?: PayloadData<T> | PayloadData<T>[];
}

/**
 * Eine Klasse zur Verwaltung von Datenbankabfragen mit Caching und Real-Time-Updates.
 */
class DataService {
  /** Cache-Objekt für die Daten aus verschiedenen Tabellen */
  private cache: Cache = {
    UserProfile: null,
    MovementData: null,
    MovementType: null,
    EmergencyContacts: null,
  };

  /** Zeitstempel der letzten Abfrage pro Tabelle */
  private lastFetched: { [key in TableName]?: number } = {};

  /** Cache-Dauer in Millisekunden (24 Stunden) */
  private cacheDuration = 60 * 60 * 1000 * 24;

  /** Observables für Änderungen an den Daten */
  private userProfileChangeObservable = new Observable<UserProfile | null>();
  private movementDataChangeObservable = new Observable<
    MovementData[] | null
  >();
  private movementTypeChangeObservable = new Observable<
    MovementType[] | null
  >();
  private emergencyContactsChangeObservable = new Observable<
    EmergencyContact[] | null
  >();

  /**
   * Konstruktor, der Real-Time-Updates für alle Tabellen abonniert.
   */
  constructor() {
    // Abonnieren von Updates für alle Tabellen und Benachrichtigung der Observer
    this.subscribeToUpdates("UserProfile", () => {
      this.userProfileChangeObservable.notify(this.cache.UserProfile);
    });
    this.subscribeToUpdates("MovementData", () => {
      this.movementDataChangeObservable.notify(this.cache.MovementData);
    });
    this.subscribeToUpdates("MovementType", () => {
      this.movementTypeChangeObservable.notify(this.cache.MovementType);
    });
    this.subscribeToUpdates("EmergencyContacts", () => {
      this.emergencyContactsChangeObservable.notify(
        this.cache.EmergencyContacts
      );
    });
  }

  /**
   * Ruft den authentifizierten Benutzer ab.
   * @returns {Promise<any>} Der authentifizierte Benutzer
   * @throws {Error} Wenn kein Benutzer authentifiziert ist
   */
  private async getAuthUser() {
    console.log("getAuthUser");
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(
        `Fehler beim Abrufen des authentifizierten Benutzers: ${error.message}`
      );
    }
    if (!data.session || !data.session!.user) {
      throw new Error("Benutzer nicht authentifiziert");
    }
    return data.session.user;
  }

  /**
   * Ruft das Benutzerprofil ab, mit Cache-Unterstützung.
   * @returns {Promise<UserProfile>} Das Benutzerprofil
   * @throws {Error} Bei Fehlern oder fehlender Authentifizierung
   */
  public async getUserProfile(): Promise<UserProfile> {
    console.log("getUserProfile");
    const user = await this.getAuthUser();
    const currentTime = Date.now();
    // Verwende Cache, wenn Daten vorhanden und nicht abgelaufen
    if (
      this.cache.UserProfile &&
      this.lastFetched["UserProfile"] &&
      currentTime - this.lastFetched["UserProfile"]! < this.cacheDuration
    ) {
      return this.cache["UserProfile"] as UserProfile;
    }

    const { data, error } = await supabase
      .from("UserProfile")
      .select("*")
      .eq("idUserProfile", user.id)
      .single();
    if (error) {
      throw new Error(`Fehler beim Abrufen von UserProfile: ${error.message}`);
    }
    this.cache["UserProfile"] = data as Cache["UserProfile"];
    this.lastFetched["UserProfile"] = currentTime;
    return data;
  }

  /**
   * Prüft, ob der Cache die geforderten MovementData enthält.
   * @param {MovementDataQueryOptions} [options] - Filteroptionen
   * @returns {boolean} True, wenn der Cache die Daten enthält
   */
  private hasRequiredMovementDataInCache(
    options?: MovementDataQueryOptions
  ): boolean {
    if (!this.cache.MovementData || !this.lastFetched["MovementData"]) {
      return false;
    }

    if (!options) {
      return (
        Date.now() - this.lastFetched["MovementData"]! < this.cacheDuration
      );
    }

    const cachedData = this.cache.MovementData!;
    // Prüfe, ob Cache alle geforderten Daten abdeckt
    const hasStartDate = options.startDate
      ? cachedData.every(
          (item) => new Date(item.startedAt) >= options.startDate!
        )
      : true;
    const hasEndDate = options.endDate
      ? cachedData.every((item) => new Date(item.endedAt) <= options.endDate!)
      : true;
    const hasIdMovementType = options.idMovementType
      ? cachedData.every(
          (item) => item.idMovementType === options.idMovementType
        )
      : true;

    return (
      hasStartDate &&
      hasEndDate &&
      hasIdMovementType &&
      Date.now() - this.lastFetched["MovementData"]! < this.cacheDuration
    );
  }

  /**
   * Ruft Bewegungsdaten ab, mit optionalen Filtern und Cache-Unterstützung.
   * @param {MovementDataQueryOptions} [options] - Filteroptionen
   * @returns {Promise<MovementData[]>} Die gefilterten Bewegungsdaten
   * @throws {Error} Bei Fehlern oder fehlender Authentifizierung
   */
  public async getMovementData(
    options?: MovementDataQueryOptions
  ): Promise<MovementData[]> {
    console.log("getMovementData");
    const user = await this.getAuthUser();
    const currentTime = Date.now();

    if (this.hasRequiredMovementDataInCache(options)) {
      let filteredData = this.cache.MovementData!;
      // Filtere Cache-Daten nach Optionen
      if (options) {
        filteredData = filteredData.filter((item) => {
          const start = new Date(item.startedAt);
          const end = new Date(item.endedAt);
          return (
            (!options.startDate || start >= options.startDate) &&
            (!options.endDate || end <= options.endDate) &&
            (!options.idMovementType ||
              item.idMovementType === options.idMovementType)
          );
        });
      }
      return filteredData;
    }

    // Dynamische Supabase-Abfrage basierend auf Optionen
    let query = supabase
      .from("MovementData")
      .select("*")
      .eq("user_id", user.id);
    if (options?.startDate)
      query = query.gte("startedAt", options.startDate.toISOString());
    if (options?.endDate)
      query = query.lte("endedAt", options.endDate.toISOString());
    if (options?.idMovementType)
      query = query.eq("idMovementType", options.idMovementType);

    const { data, error } = await query;
    if (error) {
      throw new Error(`Fehler beim Abrufen von MovementData: ${error.message}`);
    }

    // Aktualisiere Cache: Neue Daten hinzufügen oder bestehende aktualisieren
    for (const item of data) {
      if (
        !this.cache.MovementData ||
        !this.cache.MovementData.some(
          (cacheItem) => cacheItem.idMovementData === item.idMovementData
        )
      ) {
        this.cache.MovementData = this.cache.MovementData
          ? [...this.cache.MovementData, item]
          : [item];
      } else {
        this.cache.MovementData = this.cache.MovementData.map((cacheItem) =>
          cacheItem.idMovementData === item.idMovementData ? item : cacheItem
        );
      }
    }
    this.lastFetched["MovementData"] = currentTime;
    return data;
  }

  /**
   * Abonniert Real-Time-Updates für eine Tabelle und aktualisiert den Cache.
   * @param {T} table - Der Tabellenname
   * @param {(payload: Payload<T>) => void} callback - Callback für Änderungen
   */
  private subscribeToUpdates<T extends TableName>(
    table: T,
    callback: (payload: Payload<T>) => void
  ): void {
    supabase
      .channel(table)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          const { eventType, new: newData, old: oldData } = payload;

          // Cache basierend auf Tabelle und Event aktualisieren
          switch (table) {
            case "UserProfile":
              this.updateUserProfileCache(eventType, newData as UserProfile);
              break;
            case "MovementData":
              this.updateMovementDataCache(
                eventType,
                newData as MovementData,
                oldData as MovementData
              );
              break;
            case "MovementType":
              this.updateMovementTypeCache(
                eventType,
                newData as MovementType,
                oldData as MovementType
              );
              break;
            case "EmergencyContacts":
              this.updateEmergencyContactsCache(
                eventType,
                newData as EmergencyContact,
                oldData as EmergencyContact
              );
              break;
          }

          callback({
            eventType,
            new: newData as PayloadData<T>,
            old: oldData as PayloadData<T>,
          });
        }
      )
      .subscribe();
  }

  /**
   * Ruft Bewegungstypen ab, mit Cache-Unterstützung.
   * @returns {Promise<MovementType[]>} Liste der Bewegungstypen
   * @throws {Error} Bei Fehlern
   */
  public async getMovementTypes(): Promise<MovementType[]> {
    const currentTime = Date.now();
    if (
      this.cache.MovementType &&
      this.lastFetched["MovementType"] &&
      currentTime - this.lastFetched["MovementType"]! < this.cacheDuration
    ) {
      return this.cache.MovementType as MovementType[];
    }

    const { data, error } = await supabase.from("MovementType").select("*");
    if (error) {
      throw new Error(`Fehler beim Abrufen von MovementType: ${error.message}`);
    }
    this.cache.MovementType = data as MovementType[];
    this.lastFetched["MovementType"] = currentTime;
    return data;
  }

  /**
   * Ruft Notfallkontakte ab, mit Cache-Unterstützung.
   * @returns {Promise<EmergencyContact[]>} Liste der Notfallkontakte
   * @throws {Error} Bei Fehlern oder fehlender Authentifizierung
   */
  public async getEmergencyContacts(): Promise<EmergencyContact[]> {
    console.log("getEmergencyContacts");
    const user = await this.getAuthUser();
    const currentTime = Date.now();
    if (
      this.cache.EmergencyContacts &&
      this.lastFetched["EmergencyContacts"] &&
      currentTime - this.lastFetched["EmergencyContacts"]! < this.cacheDuration
    ) {
      return this.cache.EmergencyContacts as EmergencyContact[];
    }

    const { data, error } = await supabase
      .from("EmergencyContacts")
      .select("*")
      .eq("idUser", user.id);
    if (error) {
      throw new Error(
        `Fehler beim Abrufen von EmergencyContacts: ${error.message}`
      );
    }
    this.cache.EmergencyContacts = data as EmergencyContact[];
    this.lastFetched["EmergencyContacts"] = currentTime;
    return data;
  }

  /**
   * Entfernt ein Abonnement von Datenänderungen.
   * @param {T} table - Der Tabellenname
   * @param {ObserverFunction<any>} callback - Callback-Funktion zum Entfernen
   */
  public unsubscribeFromData<T extends TableName>(
    table: T,
    callback: ObserverFunction<
      MovementData[] | UserProfile | EmergencyContact[] | MovementType[]
    >
  ): void {
    switch (table) {
      case "UserProfile":
        this.userProfileChangeObservable.unsubscribe(
          callback as ObserverFunction<UserProfile | null>
        );
        break;
      case "MovementData":
        this.movementDataChangeObservable.unsubscribe(
          callback as ObserverFunction<MovementData[] | null>
        );
        break;
      case "MovementType":
        this.movementTypeChangeObservable.unsubscribe(
          callback as ObserverFunction<MovementType[] | null>
        );
        break;
      case "EmergencyContacts":
        this.emergencyContactsChangeObservable.unsubscribe(
          callback as ObserverFunction<EmergencyContact[] | null>
        );
        break;
    }
  }

  /**
   * Abonniert Datenänderungen für eine Tabelle und ruft optional die neuesten Daten ab.
   * @param {T} table - Der Tabellenname
   * @param {(data: any) => void} callback - Callback für Änderungen
   * @param {boolean} [getLatestData=true] - Ob die neuesten Daten sofort abgerufen werden sollen
   */
  public subscribeToData<T extends TableName>(
    table: T,
    callback: (
      data: MovementData[] | UserProfile | EmergencyContact[] | MovementType[]
    ) => void,
    getLatestData = true
  ): void {
    switch (table) {
      case "UserProfile":
        this.userProfileChangeObservable.subscribe(
          callback as ObserverFunction<UserProfile | null>
        );
        if (getLatestData) this.getUserProfile().then((data) => callback(data));
        break;
      case "MovementData":
        this.movementDataChangeObservable.subscribe(
          callback as ObserverFunction<MovementData[] | null>
        );
        if (getLatestData)
          this.getMovementData().then((data) => callback(data));
        break;
      case "MovementType":
        this.movementTypeChangeObservable.subscribe(
          callback as ObserverFunction<MovementType[] | null>
        );
        if (getLatestData)
          this.getMovementTypes().then((data) => callback(data));
        break;
      case "EmergencyContacts":
        this.emergencyContactsChangeObservable.subscribe(
          callback as ObserverFunction<EmergencyContact[] | null>
        );
        if (getLatestData)
          this.getEmergencyContacts().then((data) => callback(data));
        break;
    }
  }

  // --- Cache-Update-Methoden ---

  /** Aktualisiert den Cache für UserProfile */
  private updateUserProfileCache(
    eventType: "INSERT" | "UPDATE" | "DELETE",
    newData?: UserProfile
  ): void {
    if (eventType === "INSERT" || eventType === "UPDATE") {
      this.cache.UserProfile = newData || null;
    } else if (eventType === "DELETE") {
      this.cache.UserProfile = null;
    }
  }

  /** Aktualisiert den Cache für MovementData */
  private updateMovementDataCache(
    eventType: "INSERT" | "UPDATE" | "DELETE",
    newData?: MovementData,
    oldData?: MovementData
  ): void {
    const currentData = this.cache.MovementData || [];
    if (eventType === "INSERT" && newData) {
      this.cache.MovementData = [...currentData, newData];
    } else if (eventType === "UPDATE" && newData) {
      for (let i = 0; i < currentData.length; i++) {
        if (currentData[i].idMovementData === newData.idMovementData) {
          currentData[i] = newData;
          break; // Beende Schleife nach Update
        }
      }
      this.cache.MovementData = currentData;
    } else if (eventType === "DELETE" && oldData) {
      this.cache.MovementData = currentData.filter(
        (item) => item.idMovementData !== oldData.idMovementData
      );
    }
  }

  /** Aktualisiert den Cache für MovementType */
  private updateMovementTypeCache(
    eventType: "INSERT" | "UPDATE" | "DELETE",
    newData?: MovementType,
    oldData?: MovementType
  ): void {
    const currentData = this.cache.MovementType || [];
    if (eventType === "INSERT" && newData) {
      this.cache.MovementType = [...currentData, newData];
    } else if (eventType === "UPDATE" && newData) {
      for (let i = 0; i < currentData.length; i++) {
        if (currentData[i].idMovementType === newData.idMovementType) {
          currentData[i] = newData;
          break;
        }
      }
      this.cache.MovementType = currentData;
    } else if (eventType === "DELETE" && oldData) {
      this.cache.MovementType = currentData.filter(
        (item) => item.idMovementType !== oldData.idMovementType
      );
    }
  }

  /** Aktualisiert den Cache für EmergencyContacts */
  private updateEmergencyContactsCache(
    eventType: "INSERT" | "UPDATE" | "DELETE",
    newData?: EmergencyContact,
    oldData?: EmergencyContact
  ): void {
    const currentData = this.cache.EmergencyContacts || [];
    if (eventType === "INSERT" && newData) {
      this.cache.EmergencyContacts = [...currentData, newData];
    } else if (eventType === "UPDATE" && newData) {
      for (let i = 0; i < currentData.length; i++) {
        if (currentData[i].idEmergencyContact === newData.idEmergencyContact) {
          currentData[i] = newData;
          break;
        }
      }
      this.cache.EmergencyContacts = currentData;
    } else if (eventType === "DELETE" && oldData) {
      this.cache.EmergencyContacts = currentData.filter(
        (item) => item.idEmergencyContact !== oldData.idEmergencyContact
      );
    }
  }

  /**
   * Setzt den Cache für eine bestimmte Tabelle oder alle Tabellen zurück.
   * @param {TableName} [table] - Optionaler Tabellenname, sonst alle zurücksetzen
   */
  public clearCache(table?: TableName): void {
    if (table) {
      this.cache[table] = null;
      this.lastFetched[table] = 0;
    } else {
      this.cache = {
        UserProfile: null,
        MovementData: null,
        MovementType: null,
        EmergencyContacts: null,
      };
      this.lastFetched = {};
    }
  }
}

/** Singleton-Instanz des DataService */
const dataService = new DataService();

export { dataService };
