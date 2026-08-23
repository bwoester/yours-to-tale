import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '#shared': resolve(import.meta.dirname, './shared'),
      '#server': resolve(import.meta.dirname, './server'),
    },
  },
  test: {
    environment: 'node',
  },
});
