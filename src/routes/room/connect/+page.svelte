<script lang="ts">
  import { getFirstRoom, getRooms } from '../../../domain/udonarium/room/roomName';
  import type { PeerContext } from 'src/domain/udonarium/class/core/system/network/peer-context';
  import { onMount } from 'svelte';
  import { createRoom, sendSimpleMessage } from '../../../domain/udonarium/room/lobby';

  let rooms: {
    alias: string;
    roomName: string;
    peerContexts: PeerContext[];
  }[] = [];
  const reload = async () => {
    rooms = await getRooms();
    console.log(rooms);
  };
  const onClick = async () => {
    rooms = await getFirstRoom();
    createRoom((ev) => {
      console.log('test', ev);
    });
  };
</script>

<svelte:head>
  <title>創作の村</title>
  <meta name="description" content="ないものは作ればいい" />
</svelte:head>
<div>
  <div on:click={onClick}>接続</div>
  <div on:click={sendSimpleMessage}>テスト送信</div>
  {#if rooms.length === 0}
    <div>ルームがありません</div>
  {:else}
    <ul>
      {#each rooms as room, i}
        <li>
          {room.roomName}:{room.peerContexts.length}人
        </li>
      {/each}
    </ul>
  {/if}
</div>
