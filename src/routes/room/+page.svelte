<script lang="ts">
  import { getFirstRoom, getRooms } from '../../domain/udonarium/lobby/lobby';
  import type { PeerContext } from 'src/domain/udonarium/class/core/system/network/peer-context';
  import { onMount } from 'svelte';

  let rooms: {
    alias: string;
    roomName: string;
    peerContexts: PeerContext[];
  }[] = [];
  const reload = async () => {
    rooms = await getRooms();
    console.log(rooms);
  };
  onMount(async () => {
    rooms = await getFirstRoom();
  });
</script>

<svelte:head>
  <title>創作の村</title>
  <meta name="description" content="ないものは作ればいい" />
</svelte:head>
<div>
  <button on:click={reload}>reload</button>
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
