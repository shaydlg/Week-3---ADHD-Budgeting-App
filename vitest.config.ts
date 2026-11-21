import { defineConfig } from "vitest/config";

// Vitest handles the fast unit tests only. Browser tests live in e2e/ and are
// run by Playwright instead, so we tell Vitest to look only under src/ for
// *.test.ts files. This keeps the two test tools from tripping over each other.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
