<script lang="ts">
  import { createPeerUser, getUsers } from '../../../domain/udonarium/room/lobbyWithUser';
  import { initLobby, sendSimpleMessage } from '../../../domain/udonarium/room/lobby';
  const user = createPeerUser();
  let users = getUsers();
  const onClick = async () => {
    await initLobby((ev) => {
      console.log('test', ev);
    });
  };
  $: usernames = users.map((u) => u.name);
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
  <input
    value={user.name}
    on:change={(e) => {
      console.log(e);
      if (!e.target?.value) return;
      user.name = e.target.value;
      users = getUsers();
    }}
  />
</div>
<ul>
  {#each usernames as name, i}
    <li>{name}</li>
  {/each}
</ul>
