import { defineConfig } from "vitest/config";
import path from "node:path";

// Runtime + schema + diff tests are pure (no DOM needed) → node environment.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
