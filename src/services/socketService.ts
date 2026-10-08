import { Coordinates } from '../types/location';
import { RideStatus } from '../constants/rideConstants';

type EventCallback = (data: any) => void;

/**
 * Real-time WebSocket / PubSub service for driver tracking and ride events
 */
class SocketService {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnected: boolean = false;

  connect(token?: string) {
    this.isConnected = true;
    console.log('[SocketService] Connected with token:', token ? 'Bearer ***' : 'Guest');
  }

  disconnect() {
    this.isConnected = false;
    this.listeners.clear();
    console.log('[SocketService] Disconnected');
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, data: any) {
    console.log(`[SocketService] Emitting ${event}:`, data);
  }

  // Simulated events for UI demonstration
  simulateDriverLocationUpdate(coords: Coordinates) {
    const callbacks = this.listeners.get('driver:location');
    callbacks?.forEach((cb) => cb(coords));
  }

  simulateRideStatusUpdate(status: RideStatus) {
    const callbacks = this.listeners.get('ride:status');
    callbacks?.forEach((cb) => cb({ status }));
  }
}

export const socketService = new SocketService();
