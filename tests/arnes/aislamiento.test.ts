import { describe, expect, it, vi } from "vitest";
import { BaseMemoria } from "../../src/data/almacen-memoria";
import { crearAlmacenSupabase } from "../../src/data/almacen-supabase";
import { guardarPersona } from "../../src/core/usecases/personas-a-cargo";
import type { PersonaACargo } from "../../src/core/domain/familia";

function persona(id: string, familia_id: string): PersonaACargo {
  return {
    id,
    familia_id,
    tipo: "hija_hijo",
    nombre: "Ejemplo",
    cumple_dia: null,
    cumple_mes: null,
    anio_nacimiento: null,
    va_al_colegio: false,
    color: "persona-1",
    icono: "persona",
    archivada_en: null,
    revision: 0,
  };
}
describe("Almacén de familia", () => {
  it("aísla listados y rechaza lectura, creación y edición cruzadas", async () => {
    const base = new BaseMemoria();
    const a = base.paraFamilia("a"),
      b = base.paraFamilia("b");
    await a.crear("personas_a_cargo", persona("uno", "a"));
    const otro = await b.crear("personas_a_cargo", persona("dos", "b"));
    expect(await a.listar("personas_a_cargo")).toHaveLength(1);
    await expect(a.obtener("personas_a_cargo", "dos")).rejects.toThrow(
      "FUERA_DE_FAMILIA",
    );
    await expect(a.crear("personas_a_cargo", otro)).rejects.toThrow(
      "FUERA_DE_FAMILIA",
    );
    await expect(a.actualizar("personas_a_cargo", otro)).rejects.toThrow(
      "FUERA_DE_FAMILIA",
    );
    await expect(
      a.actualizar("personas_a_cargo", { ...otro, familia_id: "a" }),
    ).rejects.toThrow("FUERA_DE_FAMILIA");
    expect((await b.obtener("personas_a_cargo", "dos")).revision).toBe(0);
  });
  it("evita mutaciones por referencia y detecta dos ediciones de la misma revisión", async () => {
    const a = new BaseMemoria().paraFamilia("a");
    const original = persona("uno", "a");
    await a.crear("personas_a_cargo", original);
    original.nombre = "Cambio externo";
    expect((await a.obtener("personas_a_cargo", "uno")).nombre).toBe("Ejemplo");
    const resultados = await Promise.allSettled([
      a.actualizar("personas_a_cargo", { ...original, nombre: "Primera" }),
      a.actualizar("personas_a_cargo", { ...original, nombre: "Segunda" }),
    ]);
    expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(resultados.filter((r) => r.status === "rejected")).toHaveLength(1);
    expect((await a.obtener("personas_a_cargo", "uno")).nombre).toBe("Primera");
  });
  it("protege el hogar también al intentar cambiar su tipo antes de archivarlo", async () => {
    const a = new BaseMemoria().paraFamilia("a");
    const hogar: PersonaACargo = { ...persona("hogar", "a"), tipo: "hogar" };
    await guardarPersona(a, hogar, true);
    await expect(
      guardarPersona(
        a,
        { ...hogar, archivada_en: "2026-11-21T00:00:00Z" },
        false,
      ),
    ).rejects.toThrow("HOGAR_NO_ARCHIVABLE");
    await expect(
      guardarPersona(a, { ...hogar, tipo: "mascota" }, false),
    ).rejects.toThrow("HOGAR_NO_ARCHIVABLE");
  });
  it("permite el 29 de febrero y rechaza el 31 de abril", async () => {
    const a = new BaseMemoria().paraFamilia("a");
    await guardarPersona(
      a,
      { ...persona("uno", "a"), cumple_dia: 29, cumple_mes: 2 },
      true,
    );
    await expect(
      guardarPersona(
        a,
        { ...persona("dos", "a"), cumple_dia: 31, cumple_mes: 4 },
        true,
      ),
    ).rejects.toThrow("CUMPLEANOS_INVALIDO");
  });
});
describe("Adaptador REST de Supabase", () => {
  function crear(solicitar: typeof fetch) {
    return crearAlmacenSupabase({
      url: "https://proyecto.supabase.co",
      claveServicio: "clave-de-prueba",
      familiaId: "a",
      solicitar,
    });
  }
  it("filtra por familia incluso si el identificador contiene operadores", async () => {
    const solicitar = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("[]"));
    const a = crear(solicitar);
    await expect(
      a.obtener("personas_a_cargo", "otro&familia_id=eq.b"),
    ).rejects.toThrow("REGISTRO_AUSENTE");
    const url = new URL(String(solicitar.mock.calls[0][0]));
    expect(url.searchParams.getAll("familia_id")).toEqual(["eq.a"]);
    expect(url.searchParams.get("id")).toBe("eq.otro&familia_id=eq.b");
  });
  it("rechaza respuestas de otra familia y cuerpos de creación cruzados", async () => {
    const solicitar = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify([persona("dos", "b")])));
    const a = crear(solicitar);
    await expect(a.listar("personas_a_cargo")).rejects.toThrow(
      "FUERA_DE_FAMILIA",
    );
    solicitar.mockClear();
    await expect(
      a.crear("personas_a_cargo", persona("dos", "b")),
    ).rejects.toThrow("FUERA_DE_FAMILIA");
    expect(solicitar).not.toHaveBeenCalled();
  });
  it("actualiza con familia, id y revisión y devuelve conflicto con la versión actual", async () => {
    const solicitar = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("[]"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ ...persona("uno", "a"), revision: 1 }])),
      );
    const a = crear(solicitar);
    await expect(
      a.actualizar("personas_a_cargo", persona("uno", "a")),
    ).rejects.toMatchObject({
      message: "CONFLICTO_REVISION",
      actual: { revision: 1 },
    });
    const [url, opciones] = solicitar.mock.calls[0];
    expect(new URL(String(url)).searchParams.get("revision")).toBe("eq.0");
    expect(JSON.parse(String(opciones?.body)).revision).toBe(1);
    expect(opciones?.redirect).toBe("error");
    expect(opciones?.cache).toBe("no-store");
  });
  it("no incluye respuestas del servidor ni claves en los errores", async () => {
    const solicitar = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("datos sensibles", { status: 500 }));
    await expect(crear(solicitar).listar("ambitos")).rejects.toThrow(
      /^ERROR_ALMACEN_500$/,
    );
  });
});
