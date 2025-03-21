type ObserverFunction<T> = (data: T) => void;

export class Observable<T> {
  private observers: ObserverFunction<T>[] = [];

  subscribe(observer: ObserverFunction<T>) {
    this.observers.push(observer);
  }

  unsubscribe(observer: ObserverFunction<T>) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify(data: T) {
    this.observers.forEach((observer) => observer(data));
  }
}
