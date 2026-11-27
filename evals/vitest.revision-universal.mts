import {defineConfig} from "vitest/config";
export default defineConfig({test:{include:["evals/revision-universal.eval.ts"],testTimeout:60000}});
