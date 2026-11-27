// Verifica que el candidato evaluado sea exactamente el congelado en CONGELACION-V7.1.json.
import { readFileSync } from "node:fs";
import { test, expect } from "vitest";
import { huellasV71 } from "./comparacion-v7-1";
test("huellas 7.1 congeladas", () => {
  const f = JSON.parse(readFileSync("docs/inteligencia/CONGELACION-V7.1.json", "utf8"));
  const h = huellasV71();
  expect(h["7.1"]).toEqual(f.huellas["7.1"]);
  expect(h["6.0"]).toEqual(f.huellas["6.0"]);
});
