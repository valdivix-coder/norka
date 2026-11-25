import { describe, expect, it } from "vitest";
import { CuentasMemoria } from "../../src/data/cuentas-memoria";
import { crearAlmacenCuentasSupabase } from "../../src/data/cuentas-supabase";
import { resolverEntrada, unirIdentidad } from "../../src/core/usecases/entrar";
import {
  abrirSesion,
  cerrarSesion,
  DURACION_SESION_MS,
  validarSesion,
} from "../../src/core/usecases/sesion";
import type { PerfilProveedor } from "../../src/core/domain/cuenta";
import { aleatorioUrl, desafio, hashToken } from "../../src/lib/entrada/pkce";
import {
  canjearCodigo,
  urlDeAutorizacion,
} from "../../src/lib/entrada/supabase-auth";
import {
  procesarRetorno,
  type Dependencias,
} from "../../src/lib/entrada/retorno";
import { proveedoresConfigurados } from "../../src/lib/entrada/proveedores";

function perfil(extra: Partial<PerfilProveedor> = {}): PerfilProveedor {
  return {
    proveedor: "google",
    sub: "g-1",
    correo: "ana@ejemplo.cl",
    correoVerificado: true,
    nombre: "Ana",
    fotoUrl: null,
    ...extra,
  };
}

describe("Una persona, una cuenta (6.16)", () => {
  it("correo que ya existe con otro proveedor: suma una identidad y no crea otra cuenta", async () => {
    const a = new CuentasMemoria();
    const primera = await resolverEntrada(perfil(), a);
    const segunda = await resolverEntrada(
      perfil({ proveedor: "apple", sub: "a-9" }),
      a,
    );
    expect(primera.resultado).toBe("nueva");
    expect(segunda.resultado).toBe("unida");
    expect(segunda.cuenta.id).toBe(primera.cuenta.id);
    expect(a.cuentas).toHaveLength(1);
    expect(a.identidades.map((i) => i.proveedor).sort()).toEqual(["apple", "google"]);
  });

  it("correo distinto: crea una cuenta nueva", async () => {
    const a = new CuentasMemoria();
    await resolverEntrada(perfil(), a);
    const otra = await resolverEntrada(
      perfil({ proveedor: "apple", sub: "a-9", correo: "oculto@privaterelay.example" }),
      a,
    );
    expect(otra.resultado).toBe("nueva");
    expect(a.cuentas).toHaveLength(2);
  });

  it("la misma identidad vuelve a la misma cuenta sin duplicar", async () => {
    const a = new CuentasMemoria();
    const uno = await resolverEntrada(perfil(), a);
    const dos = await resolverEntrada(perfil(), a);
    expect(dos.resultado).toBe("existente");
    expect(dos.cuenta.id).toBe(uno.cuenta.id);
    expect(a.identidades).toHaveLength(1);
  });

  it("normaliza el correo (mayúsculas y espacios) antes de comparar", async () => {
    const a = new CuentasMemoria();
    const uno = await resolverEntrada(perfil({ correo: "  Ana@Ejemplo.CL " }), a);
    const dos = await resolverEntrada(
      perfil({ proveedor: "facebook", sub: "f-1", correo: "ANA@ejemplo.cl" }),
      a,
    );
    expect(uno.cuenta.correo).toBe("ana@ejemplo.cl");
    expect(dos.cuenta.id).toBe(uno.cuenta.id);
  });

  it("no une cuentas por un correo que el proveedor no confirmó", async () => {
    const a = new CuentasMemoria();
    await resolverEntrada(perfil(), a);
    await expect(
      resolverEntrada(
        perfil({ proveedor: "facebook", sub: "f-1", correoVerificado: false }),
        a,
      ),
    ).rejects.toThrow("CORREO_NO_VERIFICADO");
    expect(a.identidades).toHaveLength(1);
  });

  it("rechaza una entrada sin correo", async () => {
    await expect(
      resolverEntrada(perfil({ correo: null }), new CuentasMemoria()),
    ).rejects.toThrow("CORREO_NO_VERIFICADO");
  });

  it("dos entradas simultáneas de la misma persona dejan una sola cuenta", async () => {
    const a = new CuentasMemoria();
    const [x, y] = await Promise.all([
      resolverEntrada(perfil(), a),
      resolverEntrada(perfil(), a),
    ]);
    expect(a.cuentas).toHaveLength(1);
    expect(x.cuenta.id).toBe(y.cuenta.id);
  });
});

describe("Unir formas de entrar desde Perfil", () => {
  it("agrega una identidad nueva a la cuenta con sesión, aunque el correo sea distinto", async () => {
    const a = new CuentasMemoria();
    const { cuenta } = await resolverEntrada(perfil(), a);
    const r = await unirIdentidad(
      cuenta.id,
      perfil({ proveedor: "apple", sub: "a-9", correo: "oculto@privaterelay.example" }),
      a,
    );
    expect(r).toBe("agregada");
    expect(await a.listarIdentidades(cuenta.id)).toHaveLength(2);
    expect(a.cuentas).toHaveLength(1);
  });
  it("es idempotente si la identidad ya era de esa cuenta", async () => {
    const a = new CuentasMemoria();
    const { cuenta } = await resolverEntrada(perfil(), a);
    expect(await unirIdentidad(cuenta.id, perfil(), a)).toBe("ya_estaba");
    expect(a.identidades).toHaveLength(1);
  });
  it("rechaza una identidad que ya pertenece a otra cuenta", async () => {
    const a = new CuentasMemoria();
    const { cuenta } = await resolverEntrada(perfil(), a);
    await resolverEntrada(
      perfil({ proveedor: "apple", sub: "a-9", correo: "otra@ejemplo.cl" }),
      a,
    );
    await expect(
      unirIdentidad(cuenta.id, perfil({ proveedor: "apple", sub: "a-9" }), a),
    ).rejects.toThrow("IDENTIDAD_EN_OTRA_CUENTA");
  });
});

describe("Sesión propia", () => {
  const reloj = (ms: number) => ({ ahoraMs: () => ms });
  it("abre, valida, caduca y se cierra", async () => {
    const a = new CuentasMemoria();
    await abrirSesion("c1", "h".repeat(64), a, reloj(1_000));
    expect(await validarSesion("h".repeat(64), a, reloj(2_000))).toEqual({ cuenta_id: "c1" });
    await expect(
      validarSesion("h".repeat(64), a, reloj(1_000 + DURACION_SESION_MS)),
    ).rejects.toThrow("SESION_INVALIDA");
    await cerrarSesion("h".repeat(64), a);
    await expect(validarSesion("h".repeat(64), a, reloj(2_000))).rejects.toThrow(
      "SESION_INVALIDA",
    );
  });
  it("un token desconocido no abre nada", async () => {
    await expect(
      validarSesion("x".repeat(64), new CuentasMemoria(), reloj(0)),
    ).rejects.toThrow("SESION_INVALIDA");
  });
});

describe("PKCE y hash del token", () => {
  it("coincide con el vector de prueba de la RFC 7636", async () => {
    expect(await desafio("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });
  it("genera valores distintos y solo caracteres seguros para URL", () => {
    const a = aleatorioUrl(32);
    expect(a).not.toBe(aleatorioUrl(32));
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
  });
  it("el hash del token tiene 64 hexadecimales y no contiene el token", async () => {
    const h = await hashToken("secreto");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain("secreto");
  });
});

describe("Conexión con Supabase Auth", () => {
  const cfg = { url: "https://proyecto.supabase.co", clavePublicable: "sb_publishable_x" };
  it("arma la URL de autorización con PKCE y sin guardar nada en ella", async () => {
    const u = new URL(
      await urlDeAutorizacion(cfg, "google", "https://norka.example/api/entrar/retorno", "verif"),
    );
    expect(u.origin + u.pathname).toBe("https://proyecto.supabase.co/auth/v1/authorize");
    expect(u.searchParams.get("provider")).toBe("google");
    expect(u.searchParams.get("code_challenge_method")).toBe("s256");
    expect(u.searchParams.get("code_challenge")).toBe(await desafio("verif"));
    expect(u.searchParams.get("redirect_to")).toBe("https://norka.example/api/entrar/retorno");
    expect(u.search).not.toContain("verif&");
  });
  it("canjea el código y devuelve solo el perfil, sin tokens", async () => {
    let llamada: { url: string; cuerpo: string; apikey: string } | undefined;
    const solicitar = (async (url: URL, init: RequestInit) => {
      llamada = {
        url: String(url),
        cuerpo: String(init.body),
        apikey: (init.headers as Record<string, string>).apikey,
      };
      return new Response(
        JSON.stringify({
          access_token: "TOKEN-SECRETO",
          refresh_token: "REFRESCO-SECRETO",
          user: {
            id: "u1",
            email: "Ana@Ejemplo.cl",
            email_confirmed_at: "2026-11-24T00:00:00Z",
            user_metadata: { full_name: "Ana Pérez", avatar_url: "https://f/x.png" },
            identities: [
              { id: "999", provider: "google", identity_data: { sub: "999", email_verified: true } },
            ],
          },
        }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;
    const p = await canjearCodigo({ ...cfg, solicitar }, "google", "CODIGO", "VERIF");
    expect(llamada?.url).toBe("https://proyecto.supabase.co/auth/v1/token?grant_type=pkce");
    expect(JSON.parse(llamada!.cuerpo)).toEqual({ auth_code: "CODIGO", code_verifier: "VERIF" });
    expect(llamada?.apikey).toBe("sb_publishable_x");
    expect(p).toEqual({
      proveedor: "google",
      sub: "999",
      correo: "Ana@Ejemplo.cl",
      correoVerificado: true,
      nombre: "Ana Pérez",
      fotoUrl: "https://f/x.png",
    });
    expect(JSON.stringify(p)).not.toContain("SECRETO");
  });
  it("no copia la respuesta del servidor a los errores", async () => {
    const solicitar = (async () =>
      new Response("TOKEN-SECRETO", { status: 400 })) as unknown as typeof fetch;
    await expect(
      canjearCodigo({ ...cfg, solicitar }, "google", "c", "v"),
    ).rejects.toThrow(/^CANJE_RECHAZADO_400$/);
  });
  it("los botones solo existen si el proveedor está configurado", () => {
    const base = { SUPABASE_URL: "https://x.supabase.co", SUPABASE_PUBLISHABLE_KEY: "k" };
    expect(proveedoresConfigurados({ ...base })).toEqual([]);
    expect(proveedoresConfigurados({ ...base, ENTRADA_GOOGLE: "activa" })).toEqual(["google"]);
    expect(proveedoresConfigurados({ ENTRADA_GOOGLE: "activa" })).toEqual([]);
  });
});

describe("Retorno de la entrada", () => {
  function deps(a: CuentasMemoria, p: PerfilProveedor = perfil()): Dependencias {
    return {
      cuentas: a,
      sesiones: a,
      reloj: { ahoraMs: () => 5_000 },
      canjear: async () => p,
    };
  }
  const entrada = (extra = {}) => ({
    proveedor: "google" as const,
    modo: "entrar" as const,
    parametros: new URLSearchParams("code=abc"),
    verificador: "verif",
    tokenSesionActual: undefined,
    ...extra,
  });

  it("abre una sesión y guarda solo el hash del token", async () => {
    const a = new CuentasMemoria();
    const r = await procesarRetorno(entrada(), deps(a));
    if (r.tipo !== "sesion") throw new Error("se esperaba una sesión");
    expect(a.sesiones).toHaveLength(1);
    expect(a.sesiones[0].hash_token).toBe(await hashToken(r.tokenSesion));
    expect(JSON.stringify(a.sesiones)).not.toContain(r.tokenSesion);
  });
  it("sin verificador o sin código, no abre sesión", async () => {
    const a = new CuentasMemoria();
    expect(await procesarRetorno(entrada({ verificador: undefined }), deps(a))).toEqual({
      tipo: "error",
      codigo: "incompleto",
    });
    expect(
      await procesarRetorno(entrada({ parametros: new URLSearchParams("") }), deps(a)),
    ).toEqual({ tipo: "error", codigo: "incompleto" });
    expect(a.sesiones).toHaveLength(0);
  });
  it("si la persona cancela en el proveedor, informa y no crea nada", async () => {
    const a = new CuentasMemoria();
    const r = await procesarRetorno(
      entrada({ parametros: new URLSearchParams("error=access_denied") }),
      deps(a),
    );
    expect(r).toEqual({ tipo: "error", codigo: "cancelado" });
    expect(a.cuentas).toHaveLength(0);
  });
  it("un fallo del canje no deja cuentas ni sesiones", async () => {
    const a = new CuentasMemoria();
    const d = deps(a);
    d.canjear = async () => {
      throw new Error("CANJE_RECHAZADO_400");
    };
    expect(await procesarRetorno(entrada(), d)).toEqual({ tipo: "error", codigo: "fallo" });
    expect(a.cuentas).toHaveLength(0);
    expect(a.sesiones).toHaveLength(0);
  });
  it("modo unir: exige sesión y suma la identidad a esa cuenta", async () => {
    const a = new CuentasMemoria();
    const inicio = await procesarRetorno(entrada(), deps(a));
    if (inicio.tipo !== "sesion") throw new Error("se esperaba una sesión");
    const apple = perfil({ proveedor: "apple", sub: "a-9", correo: "oculto@privaterelay.example" });
    const sin = await procesarRetorno(entrada({ modo: "unir" }), deps(a, apple));
    expect(sin).toEqual({ tipo: "error", codigo: "incompleto" });
    const con = await procesarRetorno(
      entrada({ modo: "unir", proveedor: "apple", tokenSesionActual: inicio.tokenSesion }),
      deps(a, apple),
    );
    expect(con).toEqual({ tipo: "unida" });
    expect(a.cuentas).toHaveLength(1);
    expect(a.identidades).toHaveLength(2);
  });
});

describe("Adaptador de cuentas y sesiones en Supabase", () => {
  function simulado(respuestas: Response[]) {
    const llamadas: { url: URL; init: RequestInit }[] = [];
    const solicitar = (async (url: URL, init: RequestInit) => {
      llamadas.push({ url, init });
      return respuestas.shift() ?? new Response("[]", { status: 200 });
    }) as unknown as typeof fetch;
    return { llamadas, solicitar };
  }
  const json = (v: unknown, status = 200) => new Response(JSON.stringify(v), { status });

  it("exige HTTPS y clave de servicio", () => {
    expect(() =>
      crearAlmacenCuentasSupabase({ url: "http://x.test", claveServicio: "k" }),
    ).toThrow("SUPABASE_REQUIERE_HTTPS");
    expect(() =>
      crearAlmacenCuentasSupabase({ url: "https://x.test", claveServicio: "" }),
    ).toThrow("FALTA_CLAVE_SERVICIO");
  });
  it("busca por correo con igualdad exacta (nunca ilike) y envía la clave solo como cabecera", async () => {
    const s = simulado([json([])]);
    const a = crearAlmacenCuentasSupabase({
      url: "https://x.supabase.co",
      claveServicio: "sb_secret_z",
      solicitar: s.solicitar,
    });
    await a.buscarCuentaPorCorreo("a_b@ejemplo.cl");
    const { url, init } = s.llamadas[0];
    expect(url.searchParams.get("correo")).toBe("eq.a_b@ejemplo.cl");
    expect(url.toString()).not.toContain("ilike");
    expect(url.toString()).not.toContain("sb_secret_z");
    expect((init.headers as Record<string, string>).apikey).toBe("sb_secret_z");
  });
  it("traduce un 409 en conflicto único", async () => {
    const s = simulado([json({}, 409)]);
    const a = crearAlmacenCuentasSupabase({
      url: "https://x.supabase.co",
      claveServicio: "k",
      solicitar: s.solicitar,
    });
    await expect(
      a.crearCuenta({ correo: "a@b.cl", nombre: "A", foto_url: null }),
    ).rejects.toThrow("CONFLICTO_UNICO");
  });
  it("guarda y lee sesiones solo por hash", async () => {
    const s = simulado([
      json([]),
      json([
        {
          cuenta_id: "c",
          hash_token: "h".repeat(64),
          creada_en: "2026-11-24T00:00:00.000Z",
          caduca_en: "2026-12-24T00:00:00.000Z",
          revocada_en: null,
        },
      ]),
    ]);
    const a = crearAlmacenCuentasSupabase({
      url: "https://x.supabase.co",
      claveServicio: "k",
      solicitar: s.solicitar,
    });
    await a.crear({ cuenta_id: "c", hash_token: "h".repeat(64), creada_en_ms: 0, caduca_en_ms: 1000 });
    expect(Object.keys(JSON.parse(String(s.llamadas[0].init.body))).sort()).toEqual([
      "caduca_en",
      "creada_en",
      "cuenta_id",
      "hash_token",
    ]);
    const r = await a.buscarPorHash("h".repeat(64));
    expect(r?.revocada).toBe(false);
    expect(r?.caduca_en_ms).toBe(Date.parse("2026-12-24T00:00:00.000Z"));
  });
});

import { rutaSiguiente } from "../../src/lib/entrada/cookies";
describe("Volver a la invitación después de entrar", () => {
  const codigo = "A".repeat(43);
  it("solo acepta la página de una invitación", () => {
    expect(rutaSiguiente(`/invitacion/${codigo}`)).toBe(`/invitacion/${codigo}`);
    for (const malo of [
      "https://sitio-malo.example",
      "//sitio-malo.example",
      "/cuenta",
      `/invitacion/${codigo}/../../x`,
      `/invitacion/${codigo}?a=b`,
      "/invitacion/corto",
      "",
      null,
      undefined,
    ])
      expect(rutaSiguiente(malo)).toBeNull();
  });
});
