<script lang="ts">
  import { initLobby, sendSimpleMessage } from '../../../domain/udonarium/room/lobby';

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
  <div on:click={onClick}>接続</div>
  <div on:click={sendSimpleMessage}>テスト送信</div>
</div>
