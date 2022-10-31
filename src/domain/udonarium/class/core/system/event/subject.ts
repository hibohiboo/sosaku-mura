import type { Event, EventContext } from './event';
import type { Callback, Observer } from './observer';

export interface Subject {
  register(key: any): Observer;
  unregister(key: any): void;
  unregister(key: any, eventName: string): void;
  unregister(key: any, callback: Callback<any>): void;
  unregister(key: any, eventName: string, callback: Callback<any>): void;
  registerListener(listener: Observer): Observer;
  unregisterListener(listener: Observer): Observer | null;
  call<T>(eventName: string, data: T, sendTo?: string): void;
  call<T>(event: Event<T>, sendTo?: string): void;
  trigger<T>(eventName: string, data: T): Event<T>;
  trigger<T>(event: Event<T>): Event<T>;
  trigger<T>(event: EventContext<T>): Event<T>;
}
