import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { terser } from 'rollup-plugin-terser'

import dotenv from 'dotenv'
dotenv.config()
const dev = process.env.npm_lifecycle_event === 'dev';

const config: UserConfig = {
  plugins: [sveltekit(), terser({ compress: { drop_console: true } })],
  define: {
    VITE_DEFINE_BASE_PATH: JSON.stringify(dev ? '' : '/sosaku-mura'),
    VITE_DEFINE_SKYWAY_KEY: JSON.stringify(process.env.DEFINE_SKYWAY_KEY),
    VITE_DEFINE_ROOM_PASSWORD: JSON.stringify(process.env.DEFINE_ROOM_PASSWORD)
  },
  server: { port: 4200 },
};

export default config;
