import { readFileSync } from "node:fs";
import { test, expect } from "vitest";
import { huellasV74 } from "./comparacion-v7-4";
test("huellas 7.4 congeladas", () => { const f = JSON.parse(readFileSync("docs/inteligencia/CONGELACION-V7.4.json", "utf8")); expect(huellasV74()).toEqual(f.huellas); });
