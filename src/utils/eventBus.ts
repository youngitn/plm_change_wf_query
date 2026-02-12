type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationEvent {
  message: string;
  type: NotificationType;
}

type Listener = (event: NotificationEvent) => void;

class EventBus {
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(message: string, type: NotificationType = 'error') {
    this.listeners.forEach(listener => listener({ message, type }));
  }
}

export const notificationBus = new EventBus();
