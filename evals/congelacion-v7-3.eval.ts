import { readFileSync } from "node:fs";
import { test, expect } from "vitest";
import { huellasV73 } from "./comparacion-v7-3";
test("huellas 7.3 congeladas", () => { const f = JSON.parse(readFileSync("docs/inteligencia/CONGELACION-V7.3.json", "utf8")); expect(huellasV73()).toEqual(f.huellas); });
