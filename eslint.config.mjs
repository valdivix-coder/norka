import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import fronteras from "./tests/arnes/regla-fronteras.mjs";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
  {
    files: ["src/core/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: { norka: { rules: { fronteras } } },
    rules: { "norka/fronteras": "error" },
  },
]);
