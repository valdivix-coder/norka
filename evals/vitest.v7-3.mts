import {defineConfig} from "vitest/config";
export default defineConfig({test:{include:["evals/ab-v7-3.eval.ts"],testTimeout:4500000}});
