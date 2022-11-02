import { EVENT_NAME } from '../../..//event/constants';
import { EventSystem } from '../system';
import { ResettableTimeout } from '../system/util/resettable-timeout';

type PeerId = string;
type ObjectIdentifier = string;

export interface SynchronizeRequest {
  identifier: string;
  version: number;
  holderIds: string[];
  ttl: number;
}

export class SynchronizeTask {
  private static key: any = {};
  private static tasksMap: Map<ObjectIdentifier, SynchronizeTask[]> = new Map();

  onsynchronize: ((task: SynchronizeTask, identifier: string) => void) | null = null;
  onfinish: ((task: SynchronizeTask) => void) | null = null;
  ontimeout: ((task: SynchronizeTask, remainedRequests: SynchronizeRequest[]) => void) | null = null;

  private requestMap: Map<ObjectIdentifier, SynchronizeRequest> = new Map();
  private timeoutTimer: ResettableTimeout | null = null;

  private constructor(readonly peerId: PeerId) { }

  static create(peerId: PeerId, requests: SynchronizeRequest[]): SynchronizeTask {
    if (SynchronizeTask.tasksMap.size < 1) {
      EventSystem.register(SynchronizeTask.key)
        .on(EVENT_NAME.DISCONNECT_PEER, event => {
          SynchronizeTask.onDisconnect(event.data.peerId);
        })
        .on(EVENT_NAME.UPDATE_GAME_OBJECT, event => {
          if (event.isSendFromSelf) return;
          SynchronizeTask.onUpdate(event.data.identifier);
        })
        .on(EVENT_NAME.DELETE_GAME_OBJECT, event => {
          if (event.isSendFromSelf) return;
          SynchronizeTask.onUpdate(event.data.identifier);
        });
    }
    const task = new SynchronizeTask(peerId);
    task.initialize(requests);
    return task;
  }

  private cancel() {
    if (this.timeoutTimer) this.timeoutTimer.clear();
    this.timeoutTimer = null;
    this.onsynchronize = this.onfinish = this.ontimeout = null;

    for (const request of this.requestMap.values()) {
      this.deleteTasksMap(request.identifier);
    };

    this.requestMap.clear();
  }

  private initialize(requests: SynchronizeRequest[]) {
    for (const request of requests) {
      request.ttl--;
      this.requestMap.set(request.identifier, request);
      let tasks: SynchronizeTask[] | undefined = SynchronizeTask.tasksMap.get(request.identifier);
      if (tasks == null) tasks = [];
      tasks.push(this);
      SynchronizeTask.tasksMap.set(request.identifier, tasks);
      const sendTo = this.peerId != null && request.holderIds.includes(this.peerId) ? this.peerId : undefined;
      EventSystem.call(EVENT_NAME.REQUEST_GAME_OBJECT, request.identifier, sendTo);
    }

    if (this.requestMap.size < 1) {
      setTimeout(() => this.finish());
      return;
    }

    this.resetTimeout();
  }

  private finish() {
    if (this.onfinish) this.onfinish(this);
    this.cancel();
  }

  private timeout() {
    if (this.ontimeout) this.ontimeout(this, Array.from(this.requestMap.values()).filter(request => 0 <= request.ttl));
    this.finish();
  }

  private static onDisconnect(peerId: PeerId) {
    for (const tasks of SynchronizeTask.tasksMap.values()) {
      for (const task of tasks.concat()) {
        if (task.peerId === peerId) task.timeout();
      }
    }
    if (SynchronizeTask.tasksMap.size < 1) EventSystem.unregister(SynchronizeTask.key);
  }

  private static onUpdate(identifier: ObjectIdentifier) {
    if (!SynchronizeTask.tasksMap.has(identifier)) return;
    const tasks = SynchronizeTask.tasksMap.get(identifier);
    if (tasks == null) return;
    for (const task of tasks.concat()) {
      task.onUpdate(identifier);
    }
    if (SynchronizeTask.tasksMap.size < 1) EventSystem.unregister(SynchronizeTask.key);
  }

  private onUpdate(identifier: ObjectIdentifier) {
    this.requestMap.delete(identifier);
    if (this.onsynchronize) this.onsynchronize(this, identifier);
    if (this.requestMap.size < 1) {
      this.finish();
    } else {
      this.resetTimeout();
    }
  }

  private deleteTasksMap(identifier: ObjectIdentifier) {
    const tasks = SynchronizeTask.tasksMap.get(identifier);
    if (tasks == null) return
    const index = tasks.indexOf(this);
    if (-1 < index) tasks.splice(index, 1);
    if (tasks.length < 1) SynchronizeTask.tasksMap.delete(identifier);
  }

  private resetTimeout() {
    if (this.timeoutTimer == null) this.timeoutTimer = new ResettableTimeout(() => this.timeout(), 30 * 1000);
    this.timeoutTimer.reset();
  }
}
