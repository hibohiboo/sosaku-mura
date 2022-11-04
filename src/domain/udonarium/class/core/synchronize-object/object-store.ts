import { EVENT_NAME } from '../../../event/constants';
import { EventSystem } from '../system';
import { setZeroTimeout } from '../system/util/zero-timeout';
import type { GameObject, ObjectContext } from './game-object';
import type { Type } from './object-factory';

type ObjectAliasName = string;
type ObjectIdentifier = string | null;
type TimeStamp = number;

export type CatalogItem = { identifier: string, version: number };

export class ObjectStore {
  private static _instance: ObjectStore
  static get instance(): ObjectStore {
    if (!ObjectStore._instance) ObjectStore._instance = new ObjectStore();
    return ObjectStore._instance;
  }

  private identifierMap: Map<ObjectIdentifier, GameObject> = new Map();
  private aliasNameMap: Map<ObjectAliasName, Map<ObjectIdentifier, GameObject>> = new Map();
  private garbageMap: Map<ObjectIdentifier, TimeStamp> = new Map();

  private queueMap: Map<ObjectIdentifier, ObjectContext> = new Map();
  private updateInterval: number | null = null;
  private garbageCollectionInterval: NodeJS.Timer | null = null;
  private updateCallback = () => { this.updateQueue(); }

  private constructor() { console.log('ObjectStore ready...'); };

  add(object: GameObject, shouldBroadcast = true): GameObject | null {
    if (this.get(object.identifier) != null || this.isDeleted(object.identifier)) return null;
    this.identifierMap.set(object.identifier, object);
    const objectsMap = this.aliasNameMap.has(object.aliasName) ? this.aliasNameMap.get(object.aliasName) : this.aliasNameMap.set(object.aliasName, new Map()).get(object.aliasName);
    objectsMap?.set(object.identifier, object);
    object.onStoreAdded();
    if (shouldBroadcast) this.update(object.toContext());
    return object;
  }

  remove(object: GameObject): GameObject | null {
    if (!this.identifierMap.has(object.identifier)) return null;

    this.identifierMap.delete(object.identifier);
    const objectsMap = this.aliasNameMap.get(object.aliasName);
    if (objectsMap) objectsMap.delete(object.identifier);
    object.onStoreRemoved();
    return object;
  }

  delete(object: GameObject, shouldBroadcast?: boolean): GameObject | null
  delete(identifier: string, shouldBroadcast?: boolean): GameObject | null
  delete(arg: any, shouldBroadcast = true) {
    let object: GameObject | null = null;
    let identifier: string | null = null;
    if (typeof arg === 'string') {
      object = this.get(arg);
      identifier = arg;
    } else {
      object = arg;
      identifier = arg.identifier;
    }
    this.markForDelete(identifier);
    return object == null ? null : this._delete(object, shouldBroadcast);
  }

  private _delete(object: GameObject, shouldBroadcast: boolean): GameObject | null {
    if (this.remove(object) === null) return null;
    if (shouldBroadcast) EventSystem.call(EVENT_NAME.DELETE_GAME_OBJECT, { identifier: object.identifier });

    return object;
  }

  private markForDelete(identifier: string | null) {
    this.garbageMap.set(identifier, performance.now());
    this.garbageCollection(10 * 60 * 1000);
  }

  get<T extends GameObject>(identifier: string | null): T | null {
    if (identifier == null) return null
    return this.identifierMap.has(identifier) ? <T>this.identifierMap.get(identifier) : null;
  }

  getObjects<T extends GameObject>(constructor: Type<T>): T[]
  getObjects<T extends GameObject>(aliasName: string): T[]
  getObjects<T extends GameObject>(): T[]
  getObjects<T extends GameObject>(arg?: any): T[] {
    console.log('getObjects', arg)
    if (arg == null) {
      return <T[]>Array.from(this.identifierMap.values());
    }
    let aliasName = '';
    if (typeof arg === 'string') {
      aliasName = arg;
    } else {
      aliasName = arg.aliasName;
    }

    return this.aliasNameMap.has(aliasName) ? <T[]>Array.from(this.aliasNameMap.get(aliasName)!.values()) : [];
  }

  update(identifier: string): void
  update(context: ObjectContext): void
  update(arg: any) {
    console.log('update', arg)
    let context: Record<string, any> | null = null; // ObjectContext
    if (typeof arg === 'string') {
      const object: GameObject | null = this.get(arg);
      if (object) context = object.toContext();
    } else {
      context = arg;
    }
    if (!context) return;

    if (this.queueMap.has(context.identifier)) {
      const queue = this.queueMap.get(context.identifier)! as Record<string, any>;
      for (const key in context) {

        queue[key] = context[key];
      }
      return;
    }
    EventSystem.call(EVENT_NAME.UPDATE_GAME_OBJECT, context);
    this.queueMap.set(context.identifier, context as ObjectContext);
    if (this.updateInterval === null) {
      this.updateInterval = setZeroTimeout(this.updateCallback);
    }
  }

  private updateQueue() {
    this.queueMap.clear();
    this.updateInterval = null;
  }

  isDeleted(identifier: string) {
    const timeStamp = this.garbageMap.get(identifier);
    return timeStamp != null;
  }

  getCatalog(): CatalogItem[] {
    const catalog: CatalogItem[] = [];
    for (const object of this.identifierMap.values()) {
      catalog.push({ identifier: object.identifier, version: object.version });
    }
    return catalog;
  }

  clearDeleteHistory() {
    this.garbageMap.clear();
  }

  private garbageCollection(garbage: ObjectContext): void
  private garbageCollection(ms: number): void
  private garbageCollection(arg: any) {
    if (typeof arg === 'number') {
      if (this.garbageCollectionInterval === null) {
        this.garbageCollectionInterval = setTimeout(() => { this.garbageCollectionInterval = null }, 1000);
        this._garbageCollection(arg);
      }
    } else {
      this.garbageMap.delete(arg.identifier);
    }
  }

  private _garbageCollection(ms: number) {
    const nowDate = performance.now();

    let checkLength = this.garbageMap.size - 100000;
    if (checkLength < 1) return;

    const entries = this.garbageMap.entries();
    while (checkLength < 1) {
      checkLength--;
      const item = entries.next();
      if (item.done) break;

      const identifier = item.value[0];
      const timeStamp = item.value[1];

      if (timeStamp + ms < nowDate) continue;
      this.garbageMap.delete(identifier);
    }
  }
}
