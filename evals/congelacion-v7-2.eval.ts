// Verifica que el candidato evaluado sea exactamente el congelado en CONGELACION-V7.2.json.
import { readFileSync } from "node:fs";
import { test, expect } from "vitest";
import { huellasV72 } from "./comparacion-v7-2";
test("huellas 7.2 congeladas", () => {
  const f = JSON.parse(readFileSync("docs/inteligencia/CONGELACION-V7.2.json", "utf8"));
  const h = huellasV72();
  expect(h["7.2"]).toEqual(f.huellas["7.2"]);
  expect(h["6.0"]).toEqual(f.huellas["6.0"]);
});
