import { describe, expect, it } from "vitest";
import { FamiliasMemoria } from "../../src/data/familias-memoria";
import { crearAlmacenFamiliasSupabase } from "../../src/data/familias-supabase";
import {
  aceptarInvitacion,
  crearFamiliaNueva,
  generarInvitacion,
  guardarMiPerfil,
  verFamilia,
  verInvitacion,
  DURACION_INVITACION_MS,
} from "../../src/core/usecases/familias";
import {
  normalizarTelefono,
  repartoIgual,
  validarCumpleanos,
} from "../../src/core/domain/integrante";
import { hashToken, aleatorioUrl } from "../../src/lib/entrada/pkce";

const reloj = (ms: number) => ({ ahoraMs: () => ms });
const T0 = Date.UTC(2026, 10, 25, 12);
const chile = (valor: string) => ({ modo: "chile" as const, valor });

async function familiaBase() {
  const a = new FamiliasMemoria();
  a.nombres.set("ana", "Ana");
  a.nombres.set("pablo", "Pablo");
  a.nombres.set("rosa", "Rosa");
  const { familia_id } = await crearFamiliaNueva(
    "ana",
    {
      nombre: " Familia  Pérez ",
      rol_familiar: "madre",
      participacion: "corresponsable",
      cumple_dia: 12,
      cumple_mes: 3,
      telefono: chile("1234 5678"),
    },
    a,
  );
  return { a, familia_id };
}
async function invitar(
  a: FamiliasMemoria,
  familia_id: string,
  datos = { rol_familiar: "padre", participacion: "corresponsable" },
  t = T0,
) {
  const codigo = aleatorioUrl(32);
  await generarInvitacion("ana", familia_id, datos, await hashToken(codigo), a, reloj(t));
  return codigo;
}

describe("Crear familia", () => {
  it("crea a quien la crea como administrador, con color, cuota y teléfono normalizados", async () => {
    const { a, familia_id } = await familiaBase();
    const { familia, yo, integrantes } = await verFamilia("ana", familia_id, a);
    expect(familia.nombre).toBe("Familia Pérez");
    expect(integrantes).toHaveLength(1);
    expect(yo).toMatchObject({
      permiso: "administrador",
      participacion: "corresponsable",
      cuota_objetivo: 100,
      color: "persona-1",
      telefono: "+56912345678",
      cumple_dia: 12,
      cumple_mes: 3,
    });
  });
  it("rechaza nombre vacío o demasiado largo, rol y participación inventados", async () => {
    const a = new FamiliasMemoria();
    const base = { nombre: "F", rol_familiar: "madre", participacion: "apoyo", cumple_dia: null, cumple_mes: null, telefono: null };
    await expect(crearFamiliaNueva("x", { ...base, nombre: "  " }, a)).rejects.toThrow("DATO_INVALIDO_NOMBRE");
    await expect(crearFamiliaNueva("x", { ...base, nombre: "a".repeat(61) }, a)).rejects.toThrow("DATO_INVALIDO_NOMBRE");
    await expect(crearFamiliaNueva("x", { ...base, rol_familiar: "jefe" }, a)).rejects.toThrow("DATO_INVALIDO_ROL");
    await expect(crearFamiliaNueva("x", { ...base, participacion: "dueño" }, a)).rejects.toThrow("DATO_INVALIDO_PARTICIPACION");
    expect(a.familias).toHaveLength(0);
  });
  it("un apoyo no tiene cuota", async () => {
    const a = new FamiliasMemoria();
    await crearFamiliaNueva("x", { nombre: "F", rol_familiar: "abuelo", participacion: "apoyo", cumple_dia: null, cumple_mes: null, telefono: null }, a);
    expect(a.integrantes[0].cuota_objetivo).toBeNull();
  });
});

describe("Invitar y aceptar: dos cuentas, una familia (criterio de 1.7)", () => {
  it("las dos quedan en la misma familia y cada una ve el teléfono de la otra", async () => {
    const { a, familia_id } = await familiaBase();
    const codigo = await invitar(a, familia_id);
    await aceptarInvitacion("pablo", await hashToken(codigo), { cumple_dia: 1, cumple_mes: 7, telefono: chile("8765 4321") }, a, reloj(T0 + 1000));

    const vistaAna = await verFamilia("ana", familia_id, a);
    const vistaPablo = await verFamilia("pablo", familia_id, a);
    expect(vistaAna.integrantes.map((i) => i.cuenta_id)).toEqual(["ana", "pablo"]);
    expect(vistaPablo.integrantes.map((i) => i.cuenta_id)).toEqual(["ana", "pablo"]);
    expect(vistaAna.integrantes.find((i) => i.cuenta_id === "pablo")?.telefono).toBe("+56987654321");
    expect(vistaPablo.integrantes.find((i) => i.cuenta_id === "ana")?.telefono).toBe("+56912345678");
    expect(vistaPablo.yo).toMatchObject({ permiso: "integrante", rol_familiar: "padre", participacion: "corresponsable", color: "persona-2" });
  });
  it("reparte la cuota en partes iguales entre corresponsables y el apoyo queda sin cuota", async () => {
    const { a, familia_id } = await familiaBase();
    await aceptarInvitacion("pablo", await hashToken(await invitar(a, familia_id)), { cumple_dia: null, cumple_mes: null, telefono: null }, a, reloj(T0));
    await aceptarInvitacion("rosa", await hashToken(await invitar(a, familia_id, { rol_familiar: "abuelo", participacion: "apoyo" })), { cumple_dia: null, cumple_mes: null, telefono: null }, a, reloj(T0));
    const cuotas = (await a.listarIntegrantes(familia_id)).map((i) => i.cuota_objetivo);
    expect(cuotas).toEqual([50, 50, null]);
  });
  it("el enlace es de un solo uso", async () => {
    const { a, familia_id } = await familiaBase();
    const h = await hashToken(await invitar(a, familia_id));
    const sin = { cumple_dia: null, cumple_mes: null, telefono: null };
    await aceptarInvitacion("pablo", h, sin, a, reloj(T0));
    await expect(aceptarInvitacion("rosa", h, sin, a, reloj(T0))).rejects.toThrow("INVITACION_USADA");
    expect(a.integrantes).toHaveLength(2);
  });
  it("caduca a los 7 días", async () => {
    const { a, familia_id } = await familiaBase();
    const h = await hashToken(await invitar(a, familia_id));
    const sin = { cumple_dia: null, cumple_mes: null, telefono: null };
    await expect(aceptarInvitacion("pablo", h, sin, a, reloj(T0 + DURACION_INVITACION_MS))).rejects.toThrow("INVITACION_CADUCADA");
    const vista = await verInvitacion(h, a, reloj(T0 + DURACION_INVITACION_MS - 1));
    expect(vista?.vigente).toBe(true);
    expect((await verInvitacion(h, a, reloj(T0 + DURACION_INVITACION_MS)))?.vigente).toBe(false);
  });
  it("un código desconocido no abre nada y quien ya es integrante no se repite", async () => {
    const { a, familia_id } = await familiaBase();
    const sin = { cumple_dia: null, cumple_mes: null, telefono: null };
    await expect(aceptarInvitacion("pablo", "0".repeat(64), sin, a, reloj(T0))).rejects.toThrow("INVITACION_NO_EXISTE");
    const h = await hashToken(await invitar(a, familia_id));
    await expect(aceptarInvitacion("ana", h, sin, a, reloj(T0))).rejects.toThrow("YA_ES_INTEGRANTE");
  });
  it("solo el administrador invita", async () => {
    const { a, familia_id } = await familiaBase();
    await aceptarInvitacion("pablo", await hashToken(await invitar(a, familia_id)), { cumple_dia: null, cumple_mes: null, telefono: null }, a, reloj(T0));
    await expect(
      generarInvitacion("pablo", familia_id, { rol_familiar: "tio", participacion: "apoyo" }, "f".repeat(64), a, reloj(T0)),
    ).rejects.toThrow("SOLO_ADMINISTRADOR");
  });
  it("en el almacén solo queda el hash del código, nunca el código", async () => {
    const { a, familia_id } = await familiaBase();
    const codigo = await invitar(a, familia_id);
    expect(JSON.stringify(a.invitaciones)).not.toContain(codigo);
    expect(a.invitaciones[0].hash_codigo).toBe(await hashToken(codigo));
  });
});

describe("Privacidad entre familias", () => {
  it("quien no es integrante no ve nada de la familia ni los teléfonos", async () => {
    const { a, familia_id } = await familiaBase();
    await expect(verFamilia("intruso", familia_id, a)).rejects.toThrow("NO_ES_INTEGRANTE");
    await expect(guardarMiPerfil("intruso", familia_id, 0, { rol_familiar: "otro", cumple_dia: null, cumple_mes: null, telefono: null }, a)).rejects.toThrow("NO_ES_INTEGRANTE");
    await expect(generarInvitacion("intruso", familia_id, { rol_familiar: "otro", participacion: "apoyo" }, "e".repeat(64), a, reloj(T0))).rejects.toThrow("NO_ES_INTEGRANTE");
  });
  it("una familia no ve a los integrantes de otra", async () => {
    const { a, familia_id } = await familiaBase();
    a.nombres.set("otra", "Otra");
    const { familia_id: f2 } = await crearFamiliaNueva("otra", { nombre: "Otra", rol_familiar: "padre", participacion: "corresponsable", cumple_dia: null, cumple_mes: null, telefono: chile("11112222") }, a);
    expect((await verFamilia("ana", familia_id, a)).integrantes.map((i) => i.cuenta_id)).toEqual(["ana"]);
    await expect(verFamilia("ana", f2, a)).rejects.toThrow("NO_ES_INTEGRANTE");
  });
});

describe("Perfil: teléfono, cumpleaños y conflictos", () => {
  const vacio = { rol_familiar: "madre", cumple_dia: null, cumple_mes: null, telefono: null };
  it("cada persona edita su perfil con control de revisión", async () => {
    const { a, familia_id } = await familiaBase();
    const { yo } = await verFamilia("ana", familia_id, a);
    const nuevo = await guardarMiPerfil("ana", familia_id, yo.revision, { ...vacio, rol_etiqueta: "Mamá", telefono: { modo: "otro", valor: "+1 415 555 2671" } }, a);
    expect(nuevo).toMatchObject({ rol_etiqueta: "Mamá", telefono: "+14155552671", revision: yo.revision + 1 });
    await expect(guardarMiPerfil("ana", familia_id, yo.revision, vacio, a)).rejects.toThrow("CONFLICTO_REVISION");
  });
  it("valida el teléfono: 8 dígitos exactos en Chile y formato internacional en otro país", () => {
    expect(normalizarTelefono(null)).toBeNull();
    expect(normalizarTelefono(chile("  "))).toBeNull();
    expect(normalizarTelefono(chile("1234 5678"))).toBe("+56912345678");
    for (const malo of ["1234567", "123456789", "12a45678", "+56912345678"])
      expect(() => normalizarTelefono(chile(malo))).toThrow("DATO_INVALIDO_TELEFONO");
    expect(normalizarTelefono({ modo: "otro", valor: "+54 9 11 1234-5678" })).toBe("+5491112345678");
    for (const malo of ["56912345678", "+0123", "+", "+1234567890123456"])
      expect(() => normalizarTelefono({ modo: "otro", valor: malo })).toThrow("DATO_INVALIDO_TELEFONO");
  });
  it("valida el cumpleaños: juntos o ninguno, 29 de febrero sí, 30 de febrero no", () => {
    expect(validarCumpleanos({ dia: null, mes: null })).toEqual({ dia: null, mes: null });
    expect(validarCumpleanos({ dia: 29, mes: 2 })).toEqual({ dia: 29, mes: 2 });
    for (const [dia, mes] of [[30, 2], [31, 4], [0, 1], [1, 13], [5, null], [null, 5]] as const)
      expect(() => validarCumpleanos({ dia, mes })).toThrow("DATO_INVALIDO_CUMPLEANOS");
  });
  it("reparto igual: siempre suma 100", () => {
    expect(repartoIgual(1)).toEqual([100]);
    expect(repartoIgual(3)).toEqual([34, 33, 33]);
    for (let n = 1; n <= 12; n++) expect(repartoIgual(n).reduce((x, y) => x + y, 0)).toBe(100);
    expect(repartoIgual(0)).toEqual([]);
  });
});

describe("Adaptador de familias en Supabase", () => {
  const U = "11111111-1111-4111-8111-111111111111";
  function simulado(respuestas: Response[]) {
    const llamadas: { url: URL; init: RequestInit }[] = [];
    const solicitar = (async (url: URL, init: RequestInit) => {
      llamadas.push({ url, init });
      return respuestas.shift() ?? new Response("[]", { status: 200 });
    }) as unknown as typeof fetch;
    return { llamadas, solicitar };
  }
  const json = (v: unknown, status = 200) => new Response(JSON.stringify(v), { status });
  const crear = (s: ReturnType<typeof simulado>) =>
    crearAlmacenFamiliasSupabase({ url: "https://x.supabase.co", claveServicio: "sb_secret_z", solicitar: s.solicitar });

  it("exige HTTPS y clave de servicio", () => {
    expect(() => crearAlmacenFamiliasSupabase({ url: "http://x.test", claveServicio: "k" })).toThrow("SUPABASE_REQUIERE_HTTPS");
    expect(() => crearAlmacenFamiliasSupabase({ url: "https://x.test", claveServicio: "" })).toThrow("FALTA_CLAVE_SERVICIO");
  });
  it("crea la familia con una sola llamada atómica y sin exponer la clave en la URL", async () => {
    const s = simulado([json({ familia_id: U, integrante_id: U })]);
    const r = await crear(s).crearFamilia({ cuenta_id: U, nombre: "F", rol_familiar: "madre", rol_etiqueta: null, participacion: "apoyo", cumple: { dia: null, mes: null }, telefono: null });
    expect(r).toEqual({ familia_id: U, integrante_id: U });
    expect(s.llamadas).toHaveLength(1);
    expect(s.llamadas[0].url.pathname).toBe("/rest/v1/rpc/crear_familia");
    expect(s.llamadas[0].url.toString()).not.toContain("sb_secret_z");
  });
  it("traduce los errores de la invitación y no copia otros mensajes", async () => {
    const motivos = ["INVITACION_USADA", "INVITACION_CADUCADA", "INVITACION_NO_EXISTE", "YA_ES_INTEGRANTE"];
    for (const m of motivos) {
      const s = simulado([json({ code: "P0001", message: m }, 400)]);
      await expect(crear(s).aceptarInvitacion({ hash_codigo: "a".repeat(64), cuenta_id: U, ahora_ms: 0, cumple: { dia: null, mes: null }, telefono: null })).rejects.toThrow(m);
    }
    const s = simulado([json({ message: "detalle interno con TOKEN-SECRETO" }, 400)]);
    await expect(crear(s).aceptarInvitacion({ hash_codigo: "a".repeat(64), cuenta_id: U, ahora_ms: 0, cumple: { dia: null, mes: null }, telefono: null })).rejects.toThrow(/^ERROR_ALMACEN_400$/);
  });
  it("lista integrantes solo de la familia pedida y rechaza filas de otra", async () => {
    const fila = (familia_id: string) => ({ id: U, familia_id, cuenta_id: U, rol_familiar: "madre", rol_etiqueta: null, permiso: "administrador", participacion: "apoyo", cuota_objetivo: null, color: "persona-1", icono: "inicial", cumple_dia: null, cumple_mes: null, telefono: "+56912345678", revision: 0, cuentas: { nombre: "Ana" } });
    const ok = simulado([json([fila(U)])]);
    const lista = await crear(ok).listarIntegrantes(U);
    expect(lista[0]).toMatchObject({ nombre: "Ana", telefono: "+56912345678" });
    expect(ok.llamadas[0].url.searchParams.get("familia_id")).toBe("eq." + U);
    const otra = simulado([json([fila("22222222-2222-4222-8222-222222222222")])]);
    await expect(crear(otra).listarIntegrantes(U)).rejects.toThrow("RESPUESTA_ALMACEN_INVALIDA");
    expect(await crear(simulado([])).listarIntegrantes("no-es-uuid")).toEqual([]);
  });
});
