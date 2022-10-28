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


export const startConnection = (peerId: string) => {
  if (!peer) return
  let messages = '';
  const dataConnection = peer.connect(peerId);
  dataConnection.once('open', async () => {
    messages += `=== DataConnection has been opened ===\n`;
  });

  dataConnection.on('data', data => {
    messages += `Remote: ${data}\n`;
  });

  dataConnection.once('close', () => {
    messages += `=== DataConnection has been closed ===\n`;

  });

  // Register connected peer handler
  peer.on('connection', dataConnection => {
    dataConnection.once('open', async () => {
      messages += `=== DataConnection has been opened ===\n`;


    });

    dataConnection.on('data', data => {
      messages += `Remote: ${data}\n`;
    });

    dataConnection.once('close', () => {
      messages += `=== DataConnection has been closed ===\n`;

    });

    // // Register closing handler
    // closeTrigger.addEventListener('click', () => dataConnection.close(true), {
    //   once: true,
    // });

  });

  peer.on('error', console.error);
}
