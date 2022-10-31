
import type { IPeerContext } from './peer-context';
const emptyFunction = () => { };
export class ConnectionCallback {
  onOpen: (peerId: string) => void = emptyFunction;
  onClose: (peerId: string) => void = emptyFunction;
  onConnect: (peerId: string) => void = emptyFunction;
  onDisconnect: (peerId: string) => void = emptyFunction;
  onData: (peerId: string | null, data: any) => void = emptyFunction;
  onError: (peerId: string, errorType: string, errorMessage: string, errorObject: any) => void = emptyFunction;
}

export interface Connection {
  readonly peerId: string;
  readonly peerIds: string[];
  readonly peerContext: IPeerContext | null;
  readonly peerContexts: IPeerContext[];
  readonly callback: ConnectionCallback;
  readonly bandwidthUsage: number;

  open(peerId: string): void
  open(userId: string, roomId: string, roomName: string, password: string): void
  close(): void
  connect(peerId: string): boolean
  disconnect(peerId: string): boolean
  disconnectAll(): void
  send(data: void, sendTo?: string): void
  setApiKey(key: string): void;
  listAllPeers(): Promise<string[]>
}
