type EventCallback<T> = (document: T) => void | Promise<void>;

type eventType = "created" | "updated" | "deleted";

class ModelEventEmitter<T> {
  private listeners: { [event: string]: EventCallback<T>[] } = {};

  on(event: eventType, callback: EventCallback<T>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: eventType, document: T): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(document);
        } catch (error) {
          console.error(`Error in ${event} event listener:`, error);
        }
      });
    }
  }
}

export const createModelEvents = <T>() => new ModelEventEmitter<T>();
