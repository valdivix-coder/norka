import {defineConfig} from "vitest/config";
export default defineConfig({test:{include:["evals/contraste-residual-v7-8.eval.ts"],testTimeout:60000}});
