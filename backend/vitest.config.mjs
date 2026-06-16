// backend/vitest.config.mjs
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.js"],

    pool: "threads",
    fileParallelism: false,
    maxWorkers: 1,
    minWorkers: 1,

    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,

    clearMocks: true,
    restoreMocks: true,

    sequence: {
      concurrent: false,
      shuffle: false,
    },
  },
});
