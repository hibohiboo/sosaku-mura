<script>
  import { getPeerId } from '../domain/skyway/chat';
  import Chatarea from '../components/chat/Chatarea.svelte';

  let peerId = '';
  const getId = async () => {
    peerId = await getPeerId();
  };
</script>

<svelte:head>
  <title>創作の村</title>
  <meta name="description" content="ないものは作ればいい" />
</svelte:head>
<div>
  <button on:click={getId}>チャットを始める</button>
  <div>id: {peerId}</div>
</div>
{#if peerId}
  <Chatarea />
{/if}
