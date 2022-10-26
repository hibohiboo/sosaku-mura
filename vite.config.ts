import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
const dev = process.env.npm_lifecycle_event === 'dev';

const config: UserConfig = {
  plugins: [sveltekit()],
  define: {
    VITE_DEFINE_BASE_PATH: JSON.stringify(dev ? '' : '/sosaku-mura'),
  },
};

export default config;
