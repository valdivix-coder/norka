import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const raiz = fileURLToPath(new URL("../../", import.meta.url));
const pasos = [
  ["Tipos de rutas", "node_modules/next/dist/bin/next", "typegen"],
  ["TypeScript", "node_modules/typescript/bin/tsc", "--noEmit"],
  ["Linter", "node_modules/eslint/bin/eslint.js", ".", "--max-warnings", "0"],
  ["Pruebas", "node_modules/vitest/vitest.mjs", "run"],
];

if (process.argv.length > 2) {
  console.error("El arnés mínimo todavía no incorpora recorridos con navegador ni opciones adicionales.");
  process.exit(1);
}

for (const [nombre, ...argumentos] of pasos) {
  console.log(`\n${nombre}`);
  const resultado = spawnSync(process.execPath, argumentos, {
    cwd: raiz,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  if (resultado.error) {
    console.error(resultado.error.message);
  }
  if (resultado.status !== 0) {
    process.exit(resultado.status ?? 1);
  }
}

console.log("\nArnés mínimo aprobado.");
