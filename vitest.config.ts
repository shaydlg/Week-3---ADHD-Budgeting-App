import { defineConfig } from "vitest/config";

// Vitest handles the fast unit tests only. Browser tests live in e2e/ and are
// run by Playwright instead, so we tell Vitest to look only under src/ for
// *.test.ts files. This keeps the two test tools from tripping over each other.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      // Measure ONLY the logic we unit-test (the budget math). The rest of the
      // app is tested by hand / in the browser, so including it would give a low,
      // noisy number. Scoped like this, the gate means something real:
      // "don't add untested budget logic."
      include: ["src/lib/budget.ts"],
      reporter: ["text", "text-summary"],
      // Fail the run if coverage of that file drops below these lines. Our tests
      // cover it fully today; this keeps it that way.
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
