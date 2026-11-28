import {defineConfig} from "vitest/config";
export default defineConfig({test:{include:["evals/huellas-v7-8.eval.ts"],testTimeout:60000}});
