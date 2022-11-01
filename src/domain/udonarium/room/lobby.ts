
import { LOBBY_ROOM_ID, LOBBY_ROOM_NAME, LOBBY_ROOM_PASS } from "../../../domain/lobby/constants";
import { Network } from "../class/core/system";
import { PeerContext } from "../class/core/system/network/peer-context";
import { EventName } from "../event/constants";

export const createRoom = async () => {
  const userId = Network.peerContext ? Network.peerContext.userId : PeerContext.generateId();
  Network.open(userId, LOBBY_ROOM_ID, LOBBY_ROOM_NAME, LOBBY_ROOM_PASS);
}