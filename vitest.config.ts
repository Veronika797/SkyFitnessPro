import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts", "./src/test/setup.ts"],

    pool: "forks",

    testTimeout: 10000,
    hookTimeout: 10000,
    isolate: true,

    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
