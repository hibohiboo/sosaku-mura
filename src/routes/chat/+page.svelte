<script>
  import Chat from '../../components/udona/Chat.svelte';
  import { getPeerId } from '../../domain/skyway/chat';

  let ownPeerId = '';
  const getId = async () => {
    ownPeerId = await getPeerId();
  };
  let targetPeerId = '';
</script>

<svelte:head>
  <title>創作の村</title>
  <meta name="description" content="ないものは作ればいい" />
</svelte:head>
<div>
  <button on:click={getId}>チャット起動</button>
  <div>id: {ownPeerId}</div>
</div>
{#if ownPeerId}
  <div>
    <div>相手のid: <input bind:value={targetPeerId} /></div>
    <button on:click={getId}>チャットを始める</button>
  </div>
{/if}

{#if targetPeerId}
  <Chat />
{/if}
