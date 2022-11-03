import { EVENT_NAME } from '../../../event/constants';
import { EventSystem, Network } from '../system';
import type { GameObject, ObjectContext } from './game-object';
import { ObjectFactory } from './object-factory';
import { type CatalogItem, ObjectStore } from './object-store';
import { type SynchronizeRequest, SynchronizeTask } from './synchronize-task';

type PeerId = string;
type ObjectIdentifier = string;

export class ObjectSynchronizer {
  private static _instance: ObjectSynchronizer
  static get instance(): ObjectSynchronizer {
    if (!ObjectSynchronizer._instance) ObjectSynchronizer._instance = new ObjectSynchronizer();
    return ObjectSynchronizer._instance;
  }

  private requestMap: Map<ObjectIdentifier, SynchronizeRequest> = new Map();
  private peerMap: Map<PeerId, SynchronizeTask[]> = new Map();
  private tasks: SynchronizeTask[] = [];

  private constructor() { }

  initialize() {
    this.destroy();
    console.log('ObjectSynchronizer ready...');
    EventSystem.register(this)
      .on(EVENT_NAME.CONNECT_PEER, 2, event => {
        if (!event.isSendFromSelf) return;
        console.log('CONNECT_PEER GameRoomService !!!', event.data.peerId);
        this.sendCatalog(event.data.peerId);
      })
      .on(EVENT_NAME.DISCONNECT_PEER, event => {
        this.removePeerMap(event.data.peerId);
      })
      .on<CatalogItem[]>(EVENT_NAME.SYNCHRONIZE_GAME_OBJECT, event => {
        if (event.isSendFromSelf) return;
        console.log('SYNCHRONIZE_GAME_OBJECT ' + event.sendFrom);
        const catalog: CatalogItem[] = event.data;
        for (const item of catalog) {
          if (ObjectStore.instance.isDeleted(item.identifier)) {
            EventSystem.call(EVENT_NAME.DELETE_GAME_OBJECT, { identifier: item.identifier }, event.sendFrom);
          } else {
            this.addRequestMap(item, event.sendFrom);
          }
        }
        this.synchronize();
      })
      .on(EVENT_NAME.REQUEST_GAME_OBJECT, event => {
        console.log('REQUEST_GAME_OBJECT ' + event);
        if (event.isSendFromSelf) return;
        if (ObjectStore.instance.isDeleted(event.data)) {
          EventSystem.call(EVENT_NAME.DELETE_GAME_OBJECT, { identifier: event.data }, event.sendFrom);
        } else {
          const object: GameObject | null = ObjectStore.instance.get(event.data);
          if (object) EventSystem.call(EVENT_NAME.UPDATE_GAME_OBJECT, object.toContext(), event.sendFrom);
        }
      })
      .on(EVENT_NAME.UPDATE_GAME_OBJECT, event => {
        const context: ObjectContext = event.data;
        const object: GameObject | null = ObjectStore.instance.get(context.identifier);
        if (object) {
          if (!event.isSendFromSelf) this.updateObject(object, context);
        } else if (ObjectStore.instance.isDeleted(context.identifier)) {
          EventSystem.call(EVENT_NAME.DELETE_GAME_OBJECT, { identifier: context.identifier }, event.sendFrom);
        } else {
          this.createObject(context);
        }
      })
      .on(EVENT_NAME.DELETE_GAME_OBJECT, event => {
        const context: ObjectContext = event.data;
        ObjectStore.instance.delete(context.identifier, false);
      });
  }

  destroy() {
    EventSystem.unregister(this);
  }

  private updateObject(object: GameObject, context: ObjectContext) {
    if (context.majorVersion + context.minorVersion > object.version) {
      object.apply(context);
    }
  }

  private createObject(context: ObjectContext) {
    const newObject: GameObject | null = ObjectFactory.instance.create(context.aliasName, context.identifier);
    if (!newObject) {
      console.warn(context.aliasName + ' is Unknown...?', context);
      return;
    }
    ObjectStore.instance.add(newObject, false);
    newObject.apply(context);
  }

  private sendCatalog(sendTo: PeerId) {
    const catalog = ObjectStore.instance.getCatalog();
    const interval = setInterval(() => {
      const count = catalog.length < 2048 ? catalog.length : 2048;
      EventSystem.call(EVENT_NAME.SYNCHRONIZE_GAME_OBJECT, catalog.splice(0, count), sendTo);
      if (catalog.length < 1) clearInterval(interval);
    });
  }

  private addRequestMap(item: CatalogItem, sendFrom: PeerId) {
    const request = this.requestMap.get(item.identifier);
    if (request && request.version === item.version) {
      request.holderIds.push(sendFrom);
      this.addPeerMap(sendFrom);
    } else if (!request || request.version < item.version) {
      this.requestMap.set(item.identifier, { identifier: item.identifier, version: item.version, holderIds: [sendFrom], ttl: 2 });
      this.addPeerMap(sendFrom);
    }
  }

  private addPeerMap(targetPeerId: PeerId) {
    if (!this.peerMap.has(targetPeerId)) this.peerMap.set(targetPeerId, []);
  }

  private removePeerMap(targetPeerId: PeerId) {
    this.peerMap.delete(targetPeerId);
  }

  private synchronize() {
    while (0 < this.requestMap.size && this.tasks.length < 32) this.runSynchronizeTask();
  }

  private runSynchronizeTask() {
    const targetPeerId = this.getTargetPeerId();
    if (targetPeerId == null) return;
    const requests: SynchronizeRequest[] = this.makeRequestList(targetPeerId);

    if (requests.length < 1) {
      this.removePeerMap(targetPeerId);
      return;
    }
    const task = SynchronizeTask.create(targetPeerId, requests);
    this.tasks.push(task);

    const targetPeerIdTasks = this.peerMap.get(targetPeerId);
    if (targetPeerIdTasks) targetPeerIdTasks.push(task);

    task.onfinish = task => {
      this.tasks.splice(this.tasks.indexOf(task), 1);
      const targetPeerIdTasks = this.peerMap.get(targetPeerId);
      if (targetPeerIdTasks) targetPeerIdTasks.splice(targetPeerIdTasks.indexOf(task), 1);
      this.synchronize();
    }

    task.ontimeout = (task, remainedRequests) => {
      console.log('GameObject synchronize タイムアウト');
      remainedRequests.forEach(request => this.requestMap.set(request.identifier, request));
    }
  }

  private makeRequestList(targetPeerId: PeerId, maxRequest = 32): SynchronizeRequest[] {
    const requests: SynchronizeRequest[] = [];

    for (const [identifier, request] of this.requestMap) {
      if (maxRequest <= requests.length) break;
      if (!request.holderIds.includes(targetPeerId)) continue;

      const gameObject = ObjectStore.instance.get(request.identifier);
      if (!gameObject || gameObject.version < request.version) requests.push(request);

      this.requestMap.delete(identifier);
    }
    return requests;
  }

  private getTargetPeerId(): PeerId | null {
    let min = 9999;
    let selectPeerId: PeerId | null = null;
    const peerContexts = Network.peerContexts;

    for (let i = peerContexts.length - 1; 0 <= i; i--) {
      const rand = Math.floor(Math.random() * (i + 1));
      [peerContexts[i], peerContexts[rand]] = [peerContexts[rand], peerContexts[i]];
    }

    for (const peerContext of peerContexts) {
      const tasks = this.peerMap.get(peerContext.peerId);
      if (peerContext.isOpen && tasks && tasks.length < min) {
        min = tasks.length;
        selectPeerId = peerContext.peerId;
      }
    }
    return selectPeerId;
  }
}
