import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/__tests__/**", "src/**/*.json"],
      thresholds: {
        // Tightened after closing the last gaps. Branch threshold left at
        // 95% because a few defensive `instanceof Error` ternaries in catch
        // handlers are intentionally not exercised in tests (the SDK never
        // throws non-Error values in practice).
        lines: 100,
        functions: 100,
        statements: 100,
        branches: 95,
      },
    },
  },
});
