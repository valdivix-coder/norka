import { describe, expect, it } from "vitest";
import { BaseMemoria } from "../../src/data/almacen-memoria";
import { cambiarPersonaReal, colorPersona } from "../../src/core/usecases/personas-reales";
import type { PersonaACargo } from "../../src/core/domain/familia";
const a = "00000000-0000-4000-8000-000000000001";
const b = "00000000-0000-4000-8000-000000000002";
const id = "00000000-0000-4000-8000-000000000003";
const fecha = "2026-11-25T12:00:00Z";
const persona: PersonaACargo = { id, familia_id: b, tipo: "hija_hijo", nombre: "Ejemplo",
  cumple_dia: 29, cumple_mes: 2, anio_nacimiento: null, va_al_colegio: true,
  color: "var(--persona-2)", icono: "persona", archivada_en: null, revision: 0 };
function preparar() {
  const base = new BaseMemoria();
  const almacen = base.paraFamilia(a);
  return { almacen, otra: base.paraFamilia(b), cambiar: (c: Parameters<typeof cambiarPersonaReal>[2]) =>
    cambiarPersonaReal(almacen,a,c,() => id,() => fecha,2026) };
}
describe("Personas reales, tarea 1.8", () => {
  it("crea en la familia autorizada, normaliza color y conserva tras releer", async () => {
    const { cambiar, almacen, otra } = preparar();
    const { actual } = await cambiar({tipo:"crear",persona});
    expect(actual).toMatchObject({familia_id:a,color:"persona-2",revision:0});
    expect(await almacen.listar("personas_a_cargo")).toHaveLength(1);
    expect(await otra.listar("personas_a_cargo")).toHaveLength(0);
  });
  it("edita, archiva y restaura respetando revisiones", async () => {
    const { cambiar } = preparar();
    const { actual } = await cambiar({tipo:"crear",persona});
    const editada = await cambiar({tipo:"editar",persona:{...actual,nombre:"Otro"}});
    const archivada = await cambiar({tipo:"archivar",id,revision:editada.actual.revision});
    expect(archivada.actual.archivada_en).toBe(fecha);
    const restaurada = await cambiar({tipo:"restaurar",id,revision:archivada.actual.revision});
    expect(restaurada.actual).toMatchObject({nombre:"Otro",archivada_en:null,revision:3});
  });
  it("no sobrescribe una edición concurrente al deshacer", async () => {
    const { cambiar } = preparar();
    const { actual } = await cambiar({tipo:"crear",persona});
    await cambiar({tipo:"editar",persona:{...actual,nombre:"Otro"}});
    await expect(cambiar({tipo:"archivar",id,revision:0})).rejects.toThrow("CONFLICTO_REVISION");
  });
  it("rechaza hogar nuevo, datos manipulados y cumpleaños inválido", async () => {
    const { cambiar } = preparar();
    await expect(cambiar({tipo:"crear",persona:{...persona,tipo:"hogar"}})).rejects.toThrow();
    await expect(cambiar({tipo:"crear",persona:{...persona,color:"red"}})).rejects.toThrow();
    await expect(cambiar({tipo:"crear",persona:{...persona,cumple_dia:31}})).rejects.toThrow();
  });
  it("protege el hogar", async () => {
    const { cambiar, almacen } = preparar();
    await almacen.crear("personas_a_cargo",{...persona,familia_id:a,tipo:"hogar"});
    await expect(cambiar({tipo:"archivar",id,revision:0})).rejects.toThrow("HOGAR_NO_ARCHIVABLE");
    await expect(cambiar({tipo:"editar",persona})).rejects.toThrow();
  });
  it("usa el token de hogar y evita colores arbitrarios", () => {
    expect(colorPersona("ambito-hogar","hogar")).toBe("var(--persona-hogar)");
    expect(colorPersona("persona-2","hija_hijo")).toBe("var(--persona-2)");
    expect(colorPersona("red","hija_hijo")).toBe("var(--persona-1)");
  });
});
