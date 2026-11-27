import {defineConfig} from "vitest/config";
export default defineConfig({test:{include:["evals/replay-v7-6.eval.ts"],testTimeout:60000}});
