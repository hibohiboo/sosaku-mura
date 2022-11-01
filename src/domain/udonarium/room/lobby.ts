
import { LOBBY_ROOM_ID, LOBBY_ROOM_NAME, LOBBY_ROOM_PASS } from "../../../domain/lobby/constants";
import { EventSystem, Network } from "../class/core/system";
import { PeerContext } from "../class/core/system/network/peer-context";
import { EVENT_NAME, type EventName } from "../event/constants";

interface EventMessage {
  isSendFromSelf: boolean;
  eventName: string
  sendFrom: string;
  data: string
}

export const createRoom = (callback: (message: EventMessage) => void) => {
  const userId = Network.peerContext ? Network.peerContext.userId : PeerContext.generateId();
  Network.open(userId, LOBBY_ROOM_ID, LOBBY_ROOM_NAME, LOBBY_ROOM_PASS);
  EventSystem.register('lobby').on(EVENT_NAME.SEND_SIMPLE_MESSAGE, callback)
}

export const sendSimpleMessage = () => {
  EventSystem.call(EVENT_NAME.SEND_SIMPLE_MESSAGE, 'self message');
}