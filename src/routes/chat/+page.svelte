<script lang="ts">
  import { messages } from '../../store/chatMessage';
  import Chat from '../../components/udona/Chat.svelte';
  import { getPeerId, sendMessage, startConnection } from '../../domain/skyway/chat';

  let ownPeerId = '';
  const watcher = (data: any) => {
    messages.update((m) =>
      m.filter((comment) => !comment.placeholder).concat({ author: 'eliza', text: data })
    );
  };
  const getId = async () => {
    ownPeerId = await getPeerId(watcher);
  };
  let targetPeerId = '';

  let connect: { send: any } | undefined = undefined;
  const startChat = async () => {
    startConnection(targetPeerId, watcher);
  };
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
    <button on:click={startChat}>チャットを始める</button>
  </div>
{/if}

{#if ownPeerId}
  <Chat send={async (data) => sendMessage(data)} />
{/if}
