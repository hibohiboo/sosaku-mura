import * as lzbase62 from 'lzbase62';
import SHA256 from 'crypto-js/sha256'; // @diff ts errorが出たのでimport記述を修正

import { base } from '../util/base-x';
import { PeerSessionGrade, } from './peer-session-state';
import type { MutablePeerSessionState, PeerSessionState } from './peer-session-state';

const Base62 = base('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
const roomIdPattern = /^(\w{6})(\w{3})(\w*)-(\w*)/i;

export interface IPeerContext {
  readonly peerId: string;
  readonly userId: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly password: string;
  readonly digestUserId: string;
  readonly digestPassword: string;
  readonly isOpen: boolean;
  readonly isRoom: boolean;
  readonly hasPassword: boolean;
  readonly session: PeerSessionState;
}


export class PeerContext implements IPeerContext {
  peerId = '';
  userId = '';
  roomId = '';
  roomName = '';
  password = '';
  digestUserId = '';
  digestPassword = '';
  isOpen = false;
  session: MutablePeerSessionState = { grade: PeerSessionGrade.UNSPECIFIED, ping: 0, health: 0, speed: 0, description: '' };

  get isRoom(): boolean { return 0 < this.roomId.length; }
  get hasPassword(): boolean { return 0 < this.password.length + this.digestPassword.length; }

  private constructor(peerId: string) {
    this.parse(peerId);
  }

  private parse(peerId: string) {
    try {
      this.peerId = peerId;
      const regArray = roomIdPattern.exec(peerId);
      const isRoom = regArray != null;
      if (isRoom) {
        this.digestUserId = regArray[1];
        this.roomId = regArray[2];
        this.roomName = lzbase62.decompress(regArray[3]);
        this.digestPassword = regArray[4];
        return;
      }
    } catch (e) {
      console.warn(e);
    }
    this.digestUserId = peerId;
    return;
  }

  verifyPassword(password: string): boolean {
    const digest = calcDigestPassword(this.roomId, password);
    const isCorrect = digest === this.digestPassword;
    return isCorrect;
  }

  static parse(peerId: string): PeerContext {
    return new PeerContext(peerId);
  }

  static create(userId: string): PeerContext
  static create(userId: string, roomId: string, roomName: string, password: string): PeerContext
  static create(...args: any): PeerContext { // @diff ts errorが出たので型を修正
    if (args.length <= 1) {
      return PeerContext._create.apply(this, args);
    } else {
      return PeerContext._createRoom.apply(this, args);
    }
  }

  private static _create(userId = ''): PeerContext {
    const digestUserId = calcDigestUserId(userId);
    const peerContext = new PeerContext(digestUserId);

    peerContext.userId = userId;
    return peerContext;
  }

  private static _createRoom(userId = '', roomId = '', roomName = '', password = ''): PeerContext {
    const digestUserId = this.generateId('******');
    const digestPassword = calcDigestPassword(roomId, password);
    const peerId = `${digestUserId}${roomId}${lzbase62.compress(roomName)}-${digestPassword}`;

    const peerContext = new PeerContext(peerId);
    peerContext.userId = userId;
    peerContext.password = password;
    return peerContext;
  }

  static generateId(format = '********'): string {
    const h = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let k: string = format;
    k = format.replace(/\*/g, c => h[Math.floor(Math.random() * (h.length))]);

    return k;
  }
}

function calcDigestUserId(userId: string): string {
  if (userId == null) return '';
  return calcDigest(userId);
}

function calcDigestPassword(roomId: string, password: string): string {
  if (roomId == null || password == null) return '';
  return 0 < password.length ? calcDigest(roomId + password, 7) : '';
}

function calcDigest(str: string, truncateLength = -1): string {
  if (str == null) return '';
  const hash = SHA256(str);
  const array = new Uint8Array(Uint32Array.from(hash.words).buffer);
  let base62 = Base62.encode(array);

  if (truncateLength < 0) truncateLength = base62.length;
  if (base62.length < truncateLength) truncateLength = base62.length;

  base62 = base62.slice(0, truncateLength);
  return base62;
}
