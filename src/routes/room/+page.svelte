<script lang="ts">
  import { getRooms } from '../../domain/udonarium/lobby/lobby';
  import type { PeerContext } from 'src/domain/udonarium/class/core/system/network/peer-context';

  let rooms: {
    alias: string;
    roomName: string;
    peerContexts: PeerContext[];
  }[] = [];
  const reload = async () => {
    rooms = await getRooms();
  };
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
      {#each rooms as { alias, roomName }, i}
        <li>
          {alias} : {roomName}
        </li>
      {/each}
    </ul>
  {/if}
</div>
