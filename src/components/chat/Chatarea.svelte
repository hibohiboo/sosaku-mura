<script lang="ts">
  import { beforeUpdate, afterUpdate } from 'svelte';
  //https://svelte.jp/tutorial/update
  // // https://akito-fujita.hatenablog.com/entry/2019/05/15/165506
  let div: HTMLDivElement | undefined = undefined;
  let autoscroll: boolean | undefined;

  beforeUpdate(() => {
    autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
  });

  afterUpdate(() => {
    if (autoscroll && div) div.scrollTo(0, div.scrollHeight);
  });

  let comments: { author: string; text: string; placeholder?: boolean }[] = [
    { author: 'eliza', text: 'hello' }
  ];
  const isEnterEvent = (event: any): event is { key: string; target: { value: string } } =>
    event?.key === 'Enter';

  async function handleKeydown(event: unknown) {
    if (!isEnterEvent(event)) return;

    const text = event.target.value;
    if (!text) return;

    comments = comments.concat({
      author: 'user',
      text
    });

    event.target.value = '';

    const reply = 'rep';
    await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200));
    comments = comments.concat({
      author: 'eliza',
      text: '...',
      placeholder: true
    });
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
    comments = comments
      .filter((comment) => !comment.placeholder)
      .concat({
        author: 'eliza',
        text: reply
      });
  }
</script>

<div class="chat">
  <h1>Eliza</h1>

  <div class="scrollable" bind:this={div}>
    {#each comments as comment}
      <article class={comment.author}>
        <span>{comment.text}</span>
      </article>
    {/each}
  </div>

  <input on:keydown={handleKeydown} />
</div>

<style>
  .chat {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 320px;
  }

  .scrollable {
    flex: 1 1 auto;
    border-top: 1px solid #eee;
    margin: 0 0 0.5em 0;
    overflow-y: auto;
  }

  article {
    margin: 0.5em 0;
  }

  .user {
    text-align: right;
  }

  span {
    padding: 0.5em 1em;
    display: inline-block;
  }

  .eliza span {
    background-color: #eee;
    border-radius: 1em 1em 1em 0;
    color: #222;
  }

  .user span {
    background-color: #0074d9;
    color: #eee;
    border-radius: 1em 1em 0 1em;
    word-break: break-all;
  }
</style>
