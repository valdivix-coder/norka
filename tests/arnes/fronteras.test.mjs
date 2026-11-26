import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const eslint = new ESLint({
  errorOnUnmatchedPattern: false,
  allowInlineConfig: false,
});

async function erroresDeFrontera(codigo, filePath = "src/core/domain/ejemplo.ts") {
  const [resultado] = await eslint.lintText(codigo, { filePath });
  expect(resultado.fatalErrorCount).toBe(0);
  return resultado.messages.filter((mensaje) => mensaje.ruleId === "norka/fronteras");
}

describe("Fronteras del núcleo", () => {
  it("revisa todos los archivos reales del núcleo", async () => {
    const resultados = await eslint.lintFiles(["src/core/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"]);
    const errores = resultados.flatMap((resultado) =>
      resultado.messages.map((mensaje) => `${resultado.filePath}:${mensaje.line} ${mensaje.message}`),
    );
    expect(errores).toEqual([]);
  });

  it.each([
    'import React from "react";',
    'import type { ReactNode } from "react";',
    'export { useState } from "react";',
    'export * from "next/headers";',
    'const modulo = import("react/jsx-runtime");',
    'const modulo = require("@supabase/supabase-js");',
    'import Gemini from "@google/genai";',
    'import { adaptador } from "../../data/almacen";',
    'import { adaptador } from "@/data/almacen";',
    'import { componente } from "@/components/ejemplo";',
    'type Nodo = import("react").ReactNode;',
    'import Adaptador = require("next");',
    'const modulo = import(ruta);',
    'const modulo = require(ruta);',
    '/* eslint-disable norka/fronteras */ import React from "react";',
  ])("rechaza una dependencia externa o no verificable: %s", async (codigo) => {
    expect(await erroresDeFrontera(codigo)).toHaveLength(1);
  });

  it.each([
    'import { Reloj } from "../ports/reloj";',
    'import type { Tarea } from "@/core/domain/tarea";',
    'export * from "./tarea";',
  ])("permite dependencias internas: %s", async (codigo) => {
    expect(await erroresDeFrontera(codigo)).toEqual([]);
  });

  it("reserva Zod para los contratos", async () => {
    expect(await erroresDeFrontera('import { z } from "zod";', "src/core/contracts/captura.ts")).toEqual([]);
    expect(await erroresDeFrontera('import { z } from "zod";')).toHaveLength(1);
  });
});
