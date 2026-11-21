import { defineConfig } from "@playwright/test";

// Playwright drives a real browser against the running app. The webServer block
// starts the app automatically before the tests (and reuses an already-running
// dev server when you have one open locally).
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
