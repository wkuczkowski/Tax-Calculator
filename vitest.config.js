import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["2026/tests/**/*.test.js"],
  },
});
