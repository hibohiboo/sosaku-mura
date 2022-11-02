<script lang="ts">
  import Chat from '../../../components/udona/Chat.svelte';
  import { onMount } from 'svelte';
  import { initLobby, sendSimpleMessage } from '../../../domain/udonarium/room/lobby';
  import { messages } from '../../../store/chatMessage';
  let comments = [{ author: 'eliza', text: 'そこにロマンはあるのかしら' }];
  onMount(() => {
    initLobby((ev) => {
      console.log('test event', ev);
      if (ev.isSendFromSelf) return;
      messages.update((m) => m.concat({ author: 'eliza', text: ev.data }));
    });
  });
</script>

<div style="height: 400px;">
  <Chat send={async (data) => sendSimpleMessage(data)} {comments} />
</div>
