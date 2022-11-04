
import { EVENT_NAME } from '../event/constants';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject } from './core/synchronize-object/game-object';
import { ObjectStore } from './core/synchronize-object/object-store';
import { EventSystem, Network } from './core/system';

type UserId = string;
type PeerId = string;
type ObjectIdentifier = string;

@SyncObject('PeerUser')
export class PeerUser extends GameObject {
  @SyncVar() userId: UserId = '';
  @SyncVar() peerId: PeerId = '';
  @SyncVar() name = '';
  get test() {
    console.log('test getter')
    return this.context.syncData['test'];
  }
  set test(value: any) {
    console.log('set setter', value)
    this.context.syncData['test'] = value;
    this.update();
  }



  static myUser: PeerUser | null = null;
  private static userIdMap: Map<UserId, ObjectIdentifier> = new Map();
  private static peerIdMap: Map<PeerId, ObjectIdentifier> = new Map();

  get isMine(): boolean { return (PeerUser.myUser != null && PeerUser.myUser === this); }

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    if (!this.isMine) {
      EventSystem.register(this)
        .on(EVENT_NAME.DISCONNECT_PEER, -1000, event => {
          if (event.data.peerId !== this.peerId) return;
          setTimeout(() => {
            if (Network.peerIds.includes(this.peerId)) return;
            PeerUser.userIdMap.delete(this.userId);
            PeerUser.peerIdMap.delete(this.peerId);
            ObjectStore.instance.remove(this);
          }, 30000);
        });
    }
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
    PeerUser.userIdMap.delete(this.userId);
    PeerUser.peerIdMap.delete(this.peerId);
  }

  static findByUserId(userId: UserId): PeerUser | null {
    return this.find(PeerUser.userIdMap, userId, true);
  }

  static findByPeerId(peerId: PeerId): PeerUser | null {
    return this.find(PeerUser.peerIdMap, peerId, false);
  }

  private static find(map: Map<string, string>, key: string, isUserId: boolean): PeerUser | null {
    const identifier = map.get(key);
    if (identifier != null && ObjectStore.instance.get(identifier)) return ObjectStore.instance.get<PeerUser>(identifier);
    const cursors = ObjectStore.instance.getObjects<PeerUser>(PeerUser);
    for (const cursor of cursors) {
      const id = isUserId ? cursor.userId : cursor.peerId;
      if (id === key) {
        map.set(id, cursor.identifier);
        return cursor;
      }
    }
    return null;
  }

  static createMyUser(): PeerUser {
    if (PeerUser.myUser) {
      console.warn('It is already created.');
      return PeerUser.myUser;
    }
    PeerUser.myUser = new PeerUser();
    PeerUser.myUser.peerId = Network.peerId;
    PeerUser.myUser.initialize();
    return PeerUser.myUser;
  }

  // override
  apply(context: any) {// ObjectContext
    const userId = context.syncData['userId'];
    const peerId = context.syncData['peerId'];
    if (userId !== this.userId) {
      PeerUser.userIdMap.set(userId, this.identifier);
      PeerUser.userIdMap.delete(this.userId);
    }
    if (peerId !== this.peerId) {
      PeerUser.peerIdMap.set(peerId, this.identifier);
      PeerUser.peerIdMap.delete(this.peerId);
    }
    super.apply(context);
  }

  isPeerAUdon(): boolean {
    return /u.*d.*o.*n/ig.exec(this.peerId) != null;
  }
}
