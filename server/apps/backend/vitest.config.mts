import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    setupFiles: ['./test-silent-logger.ts'],
  },
});
