import { describe, expect, it, vi } from "vitest";
import { almacenDeSesion } from "../../src/core/usecases/almacen-de-sesion";
import { validarSesion } from "../../src/core/usecases/sesion";
import { BaseMemoria } from "../../src/data/almacen-memoria";
import { CuentasMemoria } from "../../src/data/cuentas-memoria";
import { crearPertenenciasSupabase } from "../../src/data/pertenencias-supabase";
import type { PersonaACargo } from "../../src/core/domain/familia";

const persona = (id: string, familia_id: string): PersonaACargo => ({
  id,
  familia_id,
  tipo: "mascota",
  nombre: "Ejemplo",
  cumple_dia: null,
  cumple_mes: null,
  anio_nacimiento: null,
  va_al_colegio: false,
  color: "persona-1",
  icono: "mascota",
  archivada_en: null,
  revision: 0,
});
async function preparar() {
  const sesiones = new CuentasMemoria();
  await sesiones.crear({
    cuenta_id: "cuenta-a",
    hash_token: "hash-a",
    creada_en_ms: 0,
    caduca_en_ms: 100,
  });
  await sesiones.crear({
    cuenta_id: "cuenta-b",
    hash_token: "hash-b",
    creada_en_ms: 0,
    caduca_en_ms: 100,
  });
  const activos = new Set(["cuenta-a/familia-a", "cuenta-b/familia-b"]);
  const pertenencias = {
    esIntegranteActivo: vi.fn(async (c: string, f: string) =>
      activos.has(c + "/" + f),
    ),
  };
  const base = new BaseMemoria();
  await base
    .paraFamilia("familia-a")
    .crear("personas_a_cargo", persona("a", "familia-a"));
  await base
    .paraFamilia("familia-b")
    .crear("personas_a_cargo", persona("b", "familia-b"));
  const tiempo = { ahora: 1 };
  const deps = {
    sesiones,
    pertenencias,
    reloj: { ahoraMs: () => tiempo.ahora },
    paraFamilia: vi.fn((id: string) => base.paraFamilia(id)),
  };
  return { sesiones, activos, base, tiempo, deps };
}

describe("Almacén autorizado por sesión", () => {
  it("deriva la cuenta de la sesión y aísla dos familias", async () => {
    const { deps } = await preparar();
    const a = await almacenDeSesion("hash-a", "familia-a", deps);
    expect((await a.listar("personas_a_cargo")).map((p) => p.id)).toEqual([
      "a",
    ]);
    await expect(a.obtener("personas_a_cargo", "b")).rejects.toThrow(
      "FUERA_DE_FAMILIA",
    );
    await expect(
      a.crear("personas_a_cargo", persona("c", "familia-b")),
    ).rejects.toThrow("FUERA_DE_FAMILIA");
    await expect(
      a.actualizar("personas_a_cargo", persona("b", "familia-b")),
    ).rejects.toThrow("FUERA_DE_FAMILIA");
    await expect(
      a.actualizar("personas_a_cargo", persona("b", "familia-a")),
    ).rejects.toThrow("FUERA_DE_FAMILIA");
    const b = await almacenDeSesion("hash-b", "familia-b", deps);
    expect((await b.obtener("personas_a_cargo", "b")).revision).toBe(0);
  });
  it("no abre un almacén ajeno aunque se conozca el identificador", async () => {
    const { deps } = await preparar();
    await expect(almacenDeSesion("hash-a", "familia-b", deps)).rejects.toThrow(
      "FUERA_DE_FAMILIA",
    );
    expect(deps.paraFamilia).not.toHaveBeenCalled();
  });
  it("rechaza una sesión inexistente antes de consultar la pertenencia", async () => {
    const { deps } = await preparar();
    await expect(
      almacenDeSesion("inventado", "familia-a", deps),
    ).rejects.toThrow("SESION_INVALIDA");
    expect(deps.pertenencias.esIntegranteActivo).not.toHaveBeenCalled();
  });
  it.each(["retirada", "revocada", "caducada"])(
    "revalida cada operación con pertenencia/sesión %s",
    async (cambio) => {
      const { deps, activos, sesiones, tiempo } = await preparar();
      const a = await almacenDeSesion("hash-a", "familia-a", deps);
      if (cambio === "retirada") activos.clear();
      if (cambio === "revocada") await sesiones.revocar("hash-a");
      if (cambio === "caducada") tiempo.ahora = 100;
      const error =
        cambio === "retirada" ? "FUERA_DE_FAMILIA" : "SESION_INVALIDA";
      await expect(a.listar("personas_a_cargo")).rejects.toThrow(error);
      await expect(a.obtener("personas_a_cargo", "a")).rejects.toThrow(error);
      await expect(
        a.crear("personas_a_cargo", persona("c", "familia-a")),
      ).rejects.toThrow(error);
      await expect(
        a.actualizar("personas_a_cargo", persona("a", "familia-a")),
      ).rejects.toThrow(error);
    },
  );
  it("permite varias familias solo cuando cada pertenencia es activa", async () => {
    const { deps, activos } = await preparar();
    activos.add("cuenta-a/familia-b");
    const b = await almacenDeSesion("hash-a", "familia-b", deps);
    expect((await b.listar("personas_a_cargo"))[0].id).toBe("b");
  });
  it("preserva control de revisión ante dos ediciones", async () => {
    const { deps } = await preparar();
    const a = await almacenDeSesion("hash-a", "familia-a", deps);
    const resultados = await Promise.allSettled([
      a.actualizar("personas_a_cargo", {
        ...persona("a", "familia-a"),
        nombre: "Primera",
      }),
      a.actualizar("personas_a_cargo", {
        ...persona("a", "familia-a"),
        nombre: "Segunda",
      }),
    ]);
    expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(resultados.filter((r) => r.status === "rejected")).toHaveLength(1);
  });
  it("un fallo de pertenencia no permite leer datos", async () => {
    const { deps } = await preparar();
    deps.pertenencias.esIntegranteActivo.mockRejectedValue(
      new Error("SIN_RED"),
    );
    await expect(almacenDeSesion("hash-a", "familia-a", deps)).rejects.toThrow(
      "SIN_RED",
    );
    expect(deps.paraFamilia).not.toHaveBeenCalled();
  });
  it.each([NaN, Infinity, -Infinity])(
    "rechaza vencimiento corrupto %s",
    async (valor) => {
      const { deps, sesiones } = await preparar();
      sesiones.sesiones[0].caduca_en_ms = valor;
      await expect(
        validarSesion("hash-a", sesiones, deps.reloj),
      ).rejects.toThrow("SESION_INVALIDA");
    },
  );
});

const cuenta = "11111111-1111-4111-8111-111111111111";
const familia = "22222222-2222-4222-8222-222222222222";
const fila = { cuenta_id: cuenta, familia_id: familia, estado: "activo" };
describe("Pertenencia Supabase", () => {
  it("filtra cuenta, familia y estado; no solicita teléfonos ni usa caché", async () => {
    const solicitar = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json([fila]));
    const almacen = crearPertenenciasSupabase({
      url: "https://ejemplo.supabase.co",
      claveServicio: "solo-prueba",
      solicitar,
    });
    expect(await almacen.esIntegranteActivo(cuenta, familia)).toBe(true);
    const [destino, opciones] = solicitar.mock.calls[0];
    const url = new URL(String(destino));
    expect(url.searchParams.get("cuenta_id")).toBe("eq." + cuenta);
    expect(url.searchParams.get("familia_id")).toBe("eq." + familia);
    expect(url.searchParams.get("estado")).toBe("eq.activo");
    expect(url.searchParams.get("select")).toBe("cuenta_id,familia_id,estado");
    expect(opciones?.cache).toBe("no-store");
    expect(opciones?.redirect).toBe("error");
    expect(new Headers(opciones?.headers).get("Authorization")).toBeNull();
  });
  it.each([
    null,
    {},
    [fila, fila],
    [{ ...fila, estado: "retirado" }],
    [{ ...fila, cuenta_id: familia }],
    [{ ...fila, familia_id: cuenta }],
  ])("rechaza respuesta inesperada %j", async (respuesta) => {
    const solicitar = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(respuesta));
    const almacen = crearPertenenciasSupabase({
      url: "https://ejemplo.supabase.co",
      claveServicio: "solo-prueba",
      solicitar,
    });
    await expect(almacen.esIntegranteActivo(cuenta, familia)).rejects.toThrow(
      "RESPUESTA_PERTENENCIA_INVALIDA",
    );
  });
  it("rechaza identificadores manipulados antes de pedir datos", async () => {
    const solicitar = vi.fn<typeof fetch>();
    const almacen = crearPertenenciasSupabase({
      url: "https://ejemplo.supabase.co",
      claveServicio: "solo-prueba",
      solicitar,
    });
    expect(await almacen.esIntegranteActivo(cuenta, "*,estado.eq.activo")).toBe(
      false,
    );
    expect(solicitar).not.toHaveBeenCalled();
  });
  it("una respuesta vacía no autoriza", async () => {
    const almacen = crearPertenenciasSupabase({
      url: "https://ejemplo.supabase.co",
      claveServicio: "solo-prueba",
      solicitar: vi.fn<typeof fetch>().mockResolvedValue(Response.json([])),
    });
    expect(await almacen.esIntegranteActivo(cuenta, familia)).toBe(false);
  });
  it("no expone el cuerpo de errores del servidor", async () => {
    const almacen = crearPertenenciasSupabase({
      url: "https://ejemplo.supabase.co",
      claveServicio: "solo-prueba",
      solicitar: vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response("dato privado", { status: 503 })),
    });
    await expect(almacen.esIntegranteActivo(cuenta, familia)).rejects.toThrow(
      /^ERROR_PERTENENCIA_503$/,
    );
  });
});
