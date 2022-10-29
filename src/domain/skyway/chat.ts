import { skywayKey } from '../../constants';
import Peer from 'skyway-js';
import type { DataConnection } from 'skyway-js';

let peer: Peer | undefined = undefined
type SkyWayMessage = string
type Watcher = (m: SkyWayMessage) => void
let connection: DataConnection | undefined = undefined
export const getPeerId = async (watcher: Watcher) => new Promise<string>((resolve, reject) => {
  if (peer) {
    return resolve(peer.id)
  }
  peer = new Peer({ key: skywayKey });
  peer.once('open', id => {
    resolve(id);
    console.log(id);
  })
  peer.on('error', (error) => {
    console.error(error)
    reject(error);
  });
  // Register connected peer handler
  peer.on('connection', dataConnection => {
    connection = dataConnection
    dataConnection.once('open', async () => {
      console.log(`=== DataConnection has been opened ===\n`)
    });

    dataConnection.on('data', data => {
      watcher(data)
      console.log(`Remote: ${data}\n`)
    });

    dataConnection.once('close', () => {
      console.log(`=== DataConnection has been closed ===\n`);
    });
  });
});

export const startConnection = (peerId: string, callback: Watcher) => new Promise<{ send: any, close: any }>((resolve, reject) => {
  if (!peer) {
    console.log('skyway agent is not ready')
    return
  }
  if (connection) {
    console.log('connection is already open')
    return
  }
  let messages = '';
  const dataConnection = peer.connect(peerId);
  dataConnection.once('open', async () => {
    messages += `=== DataConnection has been opened ===\n`;
    console.log(messages)
  });

  dataConnection.on('data', data => {
    messages += `Remote: ${data}\n`;
    callback(data)
    console.log(data)
  });

  dataConnection.once('close', () => {
    messages += `=== DataConnection has been closed ===\n`;
    console.log(messages)
  });
  connection = dataConnection
});

export const sendMessage = (data: SkyWayMessage) => {
  if (!connection) {
    console.log('connection not open');
    return
  }
  connection.send(data);
}

export const cloneConnection = (data: SkyWayMessage) => {
  if (!connection) {
    console.log('connection not open');
    return
  }
  connection.close(true)

}