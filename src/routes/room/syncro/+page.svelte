<script lang="ts">
  import { createPeerUser } from '../../../domain/udonarium/room/lobbyWithUser';
  import { initLobby, sendSimpleMessage } from '../../../domain/udonarium/room/lobby';
  const user = createPeerUser();
  const onClick = async () => {
    await initLobby((ev) => {
      console.log('test', ev);
    });
  };
</script>

<svelte:head>
  <title>創作の村</title>
  <meta name="description" content="ないものは作ればいい" />
</svelte:head>
<div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div on:click={onClick}>接続</div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div on:click={() => sendSimpleMessage('test message')}>テスト送信</div>
  <input bind:value={user.name} />
</div>
