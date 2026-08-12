import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
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
