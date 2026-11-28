import {defineConfig} from "vitest/config";
export default defineConfig({test:{include:["evals/listas-v7-7.eval.ts"],testTimeout:60000}});
