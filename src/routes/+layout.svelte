<script>
  import Header from '../components/layout/Header.svelte';
  import './styles.css';
</script>

<div class="app">
  <main>
    <slot />
  </main>

  <footer>
    <div>© hibohiboo. All rights.</div>
    <div>
      <a href="/cartagraph/privacy"> プライバシーポリシー </a>{' '}
      <a href="/cartagraph/privacy"> 利用規約 </a>
    </div>
  </footer>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 64rem;
    margin: 0 auto;
    box-sizing: border-box;
  }

  footer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
  }
  footer > div:first-child {
    right: auto;
  }
  footer > div:last-child {
    left: auto;
  }

  footer a {
    font-weight: bold;
  }

  @media (min-width: 480px) {
    footer {
      padding: 12px 0;
    }
  }
</style>
