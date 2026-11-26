import {defineConfig} from "vitest/config";
export default defineConfig({test:{include:["evals/gemini.eval.ts"],testTimeout:900000}});
