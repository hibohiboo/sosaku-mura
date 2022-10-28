import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import dotenv from 'dotenv'
dotenv.config()
const dev = process.env.npm_lifecycle_event === 'dev';

const config: UserConfig = {
  plugins: [sveltekit()],
  define: {
    VITE_DEFINE_BASE_PATH: JSON.stringify(dev ? '' : '/sosaku-mura'),
    VITE_DEFINE_SKYWAY_KEY: JSON.stringify(process.env.DEFINE_SKYWAY_KEY)
  },
  server: { port: 4200 }
};

export default config;
