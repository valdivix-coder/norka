import { afterEach, expect, it, vi } from "vitest";
const entorno = vi.hoisted(() => ({ token: undefined as string | undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (entorno.token ? { value: entorno.token } : undefined),
  }),
}));
import { almacenFamiliaActual } from "../../src/lib/familia/servidor";
import { hashToken } from "../../src/lib/entrada/pkce";
const cuenta = "11111111-1111-4111-8111-111111111111";
const familia = "22222222-2222-4222-8222-222222222222";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  entorno.token = undefined;
});
it.each([undefined, "invalido"])(
  "rechaza cookie ausente o inválida sin consultar Supabase: %s",
  async (token) => {
    entorno.token = token;
    const solicitar = vi.fn();
    vi.stubGlobal("fetch", solicitar);
    await expect(almacenFamiliaActual(familia)).rejects.toThrow(
      "SESION_INVALIDA",
    );
    expect(solicitar).not.toHaveBeenCalled();
  },
);
it("encadena cookie, hash, sesión, pertenencia y almacén con filtros de familia", async () => {
  entorno.token = "a".repeat(43);
  const hash = await hashToken(entorno.token);
  vi.stubEnv("SUPABASE_URL", "https://ejemplo.supabase.co");
  vi.stubEnv("SUPABASE_SECRET_KEY", "solo-prueba");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "publicable-prueba");
  const consultas: URL[] = [];
  const solicitar = vi.fn<typeof fetch>(async (input) => {
    const url = new URL(String(input));
    consultas.push(url);
    if (url.pathname.endsWith("/sesiones")) {
      expect(url.searchParams.get("hash_token")).toBe("eq." + hash);
      return Response.json([
        {
          cuenta_id: cuenta,
          hash_token: hash,
          creada_en: "2020-01-01T00:00:00Z",
          caduca_en: "2099-01-01T00:00:00Z",
          revocada_en: null,
        },
      ]);
    }
    if (url.pathname.endsWith("/integrantes")) {
      expect(url.searchParams.get("cuenta_id")).toBe("eq." + cuenta);
      return Response.json([
        { cuenta_id: cuenta, familia_id: familia, estado: "activo" },
      ]);
    }
    if (url.pathname.endsWith("/ambitos")) {
      expect(url.searchParams.get("familia_id")).toBe("eq." + familia);
      return Response.json([]);
    }
    throw new Error("CONSULTA_NO_ESPERADA");
  });
  vi.stubGlobal("fetch", solicitar);
  const almacen = await almacenFamiliaActual(familia);
  expect(await almacen.listar("ambitos")).toEqual([]);
  expect(consultas.map((u) => u.pathname)).toEqual([
    "/rest/v1/sesiones",
    "/rest/v1/integrantes",
    "/rest/v1/sesiones",
    "/rest/v1/integrantes",
    "/rest/v1/ambitos",
  ]);
  expect(JSON.stringify(consultas)).not.toContain(entorno.token);
});
