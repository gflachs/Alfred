/// <reference types="web-bluetooth" />

import { Observable } from "../utils/observable.ts";

export class BluetoothService {
  // Typisierte Observables mit spezifischen Datentypen
  private connectionStatus = new Observable<boolean>();
  private newValueObservable = new Observable<number | undefined>();
  private SERVICE_UUID: BluetoothServiceUUID = "";
  private CHARACTERISTIC_UUID: BluetoothCharacteristicUUID =
    "beb5483e-36e1-4688-b7f5-ea07361b26a8";
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private static instance: BluetoothService;

  private constructor() {}

  public static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  setServiceUUID(uuid: string) {
    this.SERVICE_UUID = uuid;
  }

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

  async tryConnect(): Promise<boolean> {
    return navigator.bluetooth
      .requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.SERVICE_UUID],
      })
      .then(async (selectedDevice) => {
        console.log("Gerät ausgewählt:", selectedDevice);
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
        console.log("Verbunden mit dem GATT-Server:", this.server);
        console.log(this.server.getPrimaryServices());
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
            this.newValueObservable.notify(value); // value ist number | undefined
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

  disconnect() {
    if (this.server && this.server.connected) {
      this.server.disconnect();
      console.log("Disconnected from the device.");
    } else {
      console.log("Device is already disconnected or was never connected.");
    }
  }

  isBluetoothSupported(): boolean {
    return "bluetooth" in navigator;
  }

  isBluetoothEnabled(): Promise<boolean> {
    return (navigator as Navigator).bluetooth.getAvailability();
  }

  isBluetoothDeviceConnected(): boolean {
    return (
      this.device !== null &&
      this.device.gatt !== undefined &&
      this.device.gatt.connected
    );
  }

  isBluetoothServiceAvailable(): boolean {
    return this.server !== null && this.server.connected;
  }

  onDisconnected(): void {
    console.log("Die Verbindung wurde getrennt!");
    this.connectionStatus.notify(false);
  }

  // Typisierte Observer-Funktionen
  subscribeToConnectionStatus(observer: (status: boolean) => void): void {
    this.connectionStatus.subscribe(observer);
  }

  unsubscribeFromConnectionStatus(observer: (status: boolean) => void): void {
    this.connectionStatus.unsubscribe(observer);
  }

  subscribeToNewValue(observer: (value: number | undefined) => void): void {
    this.newValueObservable.subscribe(observer);
  }

  unsubscribeFromNewValue(observer: (value: number | undefined) => void): void {
    this.newValueObservable.unsubscribe(observer);
  }
}
