import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["tests/unit/**/*.test.ts"], reporters: ["default", "json", "junit"], outputFile: { json: "reports/unit/results.json", junit: "reports/unit/junit.xml" } }
});
