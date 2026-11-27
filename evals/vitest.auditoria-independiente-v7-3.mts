import {defineConfig} from "vitest/config";
export default defineConfig({test:{include:["evals/auditoria-independiente-v7-3.eval.ts"],testTimeout:60000}});
