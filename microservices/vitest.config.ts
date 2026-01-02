import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    globals: true,
    root: './',
    include: [
      'apps/**/src/**/*.spec.ts',
      'apps/**/test/**/*.spec.ts',
      'libs/**/src/**/*.spec.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@app/shared': path.resolve(__dirname, './libs/shared/src'),
    },
  },
});
