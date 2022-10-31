
import { roomPassword } from "../../../constants";
import { Network } from "../class/core/system";
import { PeerContext } from "../class/core/system/network/peer-context";
import { EventName } from "../event/constants";

export const createRoom = async () => {
  const userId = Network.peerContext ? Network.peerContext.userId : PeerContext.generateId();
  Network.open(userId, 'lob', '創作の村', roomPassword);
}