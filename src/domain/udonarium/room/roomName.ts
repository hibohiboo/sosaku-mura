
import { skywayKey } from "../../../constants";
import { EventSystem, Network } from "../class/core/system";
import { PeerContext } from "../class/core/system/network/peer-context";
import { EventName } from "../event/constants";


export const getRooms = async () => {
  const rooms = [];
  const peersOfroom: { [room: string]: PeerContext[] } = {};
  const peerIds = await Network.listAllPeers();

  for (const peerId of peerIds) {
    const context = PeerContext.parse(peerId);
    if (context.isRoom) {
      const alias = context.roomId + context.roomName;
      if (!(alias in peersOfroom)) {
        peersOfroom[alias] = [];
      }
      peersOfroom[alias].push(context);
    }
  }
  for (const alias in peersOfroom) {
    rooms.push({ alias: alias, roomName: peersOfroom[alias][0].roomName, peerContexts: peersOfroom[alias] });
  }
  rooms.sort((a, b) => {
    if (a.alias < b.alias) return -1;
    if (a.alias > b.alias) return 1;
    return 0;
  });
  return rooms
}

const initNetwork = () => new Promise<string>((resolve) => {
  EventSystem.register('lobby').on(EventName.OPEN_NETWORK, () => {
    resolve(Network.peerId)
  })
  Network.setApiKey(skywayKey);
  Network.open();
})


export const getFirstRoom = async () => {
  await initNetwork();

  // 初回では接続できないことがあるので、何回かリトライする
  for (let i = 0, maxRetries = 5; i < maxRetries; i++) {
    const rooms = await getRooms();
    if (rooms.length !== 0) return rooms
    await new Promise((r) => setTimeout(r, 200));
  }
  return []
}
export const createRoom = async (roomName: string, roomPassword = '') => {
  const userId = Network.peerContext ? Network.peerContext.userId : PeerContext.generateId();
  Network.open(userId, PeerContext.generateId('***'), roomName, roomPassword);
}