import {defineConfig} from "vitest/config";
export default defineConfig({test:{include:["evals/auditoria-universal.eval.ts"],testTimeout:60000}});
