
import { LOBBY_ROOM_ID, LOBBY_ROOM_NAME, LOBBY_ROOM_PASS } from "../../../domain/lobby/constants";
import { EventSystem, Network } from "../class/core/system";
import { PeerContext } from "../class/core/system/network/peer-context";
import { EVENT_NAME, type EventName } from "../event/constants";
import { getRooms, initAndGetRooms } from "./room";

interface EventMessage {
  isSendFromSelf: boolean;
  eventName: string
  sendFrom: string;
  data: string
}
const resetNetwork = () => {
  if (Network.peerContexts.length < 1) {
    Network.open();
  }
}
export const getUserId = () => {
  if (Network.peerContext) {
    console.log('peercontext id')
    return Network.peerContext.userId
  }
  console.log('generated user id')
  return PeerContext.generateId();
}
const openLobby = () => {
  const userId = getUserId()
  Network.open(userId, LOBBY_ROOM_ID, LOBBY_ROOM_NAME, LOBBY_ROOM_PASS);
}
const listenPeerEvent = (triedPeer: string[], peerContexts: PeerContext[]) => {
  EventSystem.register(triedPeer)
    .on(EVENT_NAME.CONNECT_PEER, event => {
      console.log('接続成功！', event.data.peerId);
      triedPeer.push(event.data.peerId);
      console.log('接続成功 ' + triedPeer.length + '/' + peerContexts.length);
      if (peerContexts.length <= triedPeer.length) {
        resetNetwork();
        EventSystem.unregister(triedPeer);
      }
    })
    .on(EVENT_NAME.DISCONNECT_PEER, event => {
      console.warn('接続失敗', event.data.peerId);
      triedPeer.push(event.data.peerId);
      console.warn('接続失敗 ' + triedPeer.length + '/' + peerContexts.length);
      if (peerContexts.length <= triedPeer.length) {
        resetNetwork();
        EventSystem.unregister(triedPeer);
      }
    });
}
const connectLobby = (peerContexts: PeerContext[]) => {
  openLobby();
  const triedPeer: string[] = [];
  EventSystem.register(triedPeer)
    .on(EVENT_NAME.OPEN_NETWORK, event => {
      console.log('LobbyComponent OPEN_PEER', event.data.peerId);
      EventSystem.unregister(triedPeer);

      for (const context of peerContexts) {
        Network.connect(context.peerId);
      }

      listenPeerEvent(triedPeer, peerContexts)
    });
}

export const initLobby = async (callback: (message: EventMessage) => void) => {
  const rooms = await initAndGetRooms()
  console.log(rooms)
  const lobby = rooms.find(room => room.roomName === LOBBY_ROOM_NAME)
  if (lobby) {
    connectLobby(lobby.peerContexts)
  } else {
    openLobby()
  }
  EventSystem.register('lobby').on(EVENT_NAME.SEND_SIMPLE_MESSAGE, callback)

}

export const sendSimpleMessage = () => {
  EventSystem.call(EVENT_NAME.SEND_SIMPLE_MESSAGE, 'self message');
}