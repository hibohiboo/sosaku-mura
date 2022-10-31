import type { Event } from './event';
import type { Subject } from './subject';
import { EventName } from '../../../../event/constants';

export type Callback<T> = (event: Event<T>, listener?: Observer) => void;

export interface EventMap {
  [EventName.OPEN_NETWORK]: { peerId: string };
  [EventName.CLOSE_NETWORK]: { peerId: string };
  [EventName.NETWORK_ERROR]: { peerId: string, errorType: string, errorMessage: string, errorObject: any };
  [EventName.CONNECT_PEER]: { peerId: string };
  [EventName.DISCONNECT_PEER]: { peerId: string };
  [EventName.UPDATE_GAME_OBJECT]: {
    aliasName: string;
    identifier: string;
    majorVersion: number;
    minorVersion: number;
    // eslint-disable-next-line @typescript-eslint/ban-types
    syncData: Object;
  };
}

export interface Observer {
  readonly subject: Subject;
  readonly key: any;
  readonly eventName: string;
  readonly priority: number;
  readonly callback: Callback<any> | null;
  readonly isOnlyOnce: boolean;
  readonly isRegistered: boolean;

  on<K extends keyof EventMap>(eventName: K, callback: Callback<EventMap[K]>): Observer
  on<K extends keyof EventMap>(eventName: K, priority: number, callback: Callback<EventMap[K]>): Observer
  on(eventName: string, callback: Callback<any>): Observer
  on(eventName: string, priority: number, callback: Callback<any>): Observer
  on<T>(eventName: string, callback: Callback<T>): Observer
  on<T>(eventName: string, priority: number, callback: Callback<T>): Observer

  once<K extends keyof EventMap>(eventName: K, callback: Callback<EventMap[K]>): Observer
  once<K extends keyof EventMap>(eventName: K, priority: number, callback: Callback<EventMap[K]>): Observer
  once(eventName: string, callback: Callback<any>): Observer
  once(eventName: string, priority: number, callback: Callback<any>): Observer
  once<T>(eventName: string, callback: Callback<T>): Observer
  once<T>(eventName: string, priority: number, callback: Callback<T>): Observer

  unregister(): Observer

  trigger(event: Event<any>): void
  isEqual(key: any, eventName: string, callback: Callback<any>): boolean
}