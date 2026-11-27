import { readFileSync } from "node:fs";
import { test, expect } from "vitest";
import { huellasV75 } from "./comparacion-v7-5";
test("huellas 7.5 congeladas", () => { const f = JSON.parse(readFileSync("docs/inteligencia/CONGELACION-V7.5.json", "utf8")); expect(huellasV75()).toEqual(f.huellas); });
