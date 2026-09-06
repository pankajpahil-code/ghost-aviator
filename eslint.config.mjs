import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated scratch probes and the vendored, minified PDF.js worker are
    // not authored source. Keep `npm run lint` focused on code we maintain.
    ".tmp-audit/**",
    "public/pdf.worker.min.mjs",
  ]),
]);

export default eslintConfig;
