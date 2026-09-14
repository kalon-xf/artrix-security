import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(root)
    }
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"]
  }
});
