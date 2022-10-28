import { skywayKey } from '../../constants';
import Peer from 'skyway-js';

let peer: Peer | undefined = undefined
export const getPeerId = async () => new Promise<string>((resolve, reject) => {
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
});


export const startConnection = (peerId: string, callback: any) => new Promise<{ send: any, close: any }>((resolve, reject) => {
  if (!peer) return
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

  // Register connected peer handler
  peer.on('connection', dataConnection => {
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

    });
    resolve({
      close: () => dataConnection && dataConnection.close(true),
      send: (data: string) => {
        const ret = dataConnection.send(data);
        console.log(data, ret)
        callback(data)
      }
    })
  });

});
