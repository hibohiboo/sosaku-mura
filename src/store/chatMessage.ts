import { writable } from 'svelte/store';

export const messages = writable([] as { author: string; text: string; placeholder?: boolean }[]);