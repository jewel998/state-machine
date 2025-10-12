/**
 * Observer pattern implementation for state machine events
 */

export interface IObserver<TEvent> {
  update(event: TEvent): void;
}

export interface ISubject<TEvent> {
  subscribe(observer: IObserver<TEvent>): void;
  unsubscribe(observer: IObserver<TEvent>): void;
  notify(event: TEvent): void;
}

/**
 * Generic Observable implementation using Observer pattern
 */
export class Observable<TEvent> implements ISubject<TEvent> {
  private readonly observers: Set<IObserver<TEvent>> = new Set();

  public subscribe(observer: IObserver<TEvent>): void {
    this.observers.add(observer);
  }

  public unsubscribe(observer: IObserver<TEvent>): void {
    this.observers.delete(observer);
  }

  public notify(event: TEvent): void {
    this.observers.forEach((observer) => {
      try {
        observer.update(event);
      } catch (error) {
        // Prevent observer errors from affecting the subject
        console.error('Observer error:', error);
      }
    });
  }

  public getObserverCount(): number {
    return this.observers.size;
  }

  public clear(): void {
    this.observers.clear();
  }
}
