<script lang="ts">
  import {
    createPeerUser,
    getUsers,
    initGameObject
  } from '../../../domain/udonarium/room/lobbyWithUser';
  import { initLobby, sendSimpleMessage } from '../../../domain/udonarium/room/lobby';
  initGameObject();
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
    }}
  />
</div>
<ul>
  {#each usernames as name, i}
    <li>{name}</li>
  {/each}
</ul>
<div>
  <button
    on:click={() => {
      users[0].name = 'test1';
      const u = users[0];
      u.name = 'test2';
      user.name = 'test3';
    }}>test</button
  >
  <button
    on:click={() => {
      users = getUsers();
    }}>更新</button
  >
</div>
<pre>{JSON.stringify(users, null, 2)}</pre>
<pre>{JSON.stringify(user, null, 2)}</pre>
