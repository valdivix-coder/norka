import {defineConfig} from "vitest/config";
export default defineConfig({test:{include:["evals/replay-v7-8.eval.ts"],testTimeout:60000}});
