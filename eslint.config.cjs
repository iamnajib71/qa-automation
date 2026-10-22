const { FlatCompat } = require("@eslint/eslintrc");
const compat = new FlatCompat({ baseDirectory: __dirname });
module.exports = [
  { ignores: ["next-env.d.ts", ".next/**", ".vercel/**", ".tools/**", ".verification/**", "node_modules/**", "reports/**", "real-world/**/reports/**", "real-world/**/.python-deps/**", "test-results/**", "coverage/**", "cypress/videos/**", "cypress/screenshots/**", "public/generated/**", "docs/results/**", "docs/img/**", "tests/performance/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { files: ["**/*.cjs", "**/*.mjs", "cypress/**/*.js"], rules: { "@typescript-eslint/no-require-imports": "off" } }
];
