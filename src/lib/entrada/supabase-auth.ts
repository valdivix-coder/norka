import type { PerfilProveedor, Proveedor } from "../../core/domain/cuenta";
import { desafio } from "./pkce";

type Configuracion = {
  url: string;
  clavePublicable: string;
  solicitar?: typeof fetch;
};

// Supabase Auth hace de intermediario con Google (flujo PKCE). norka solo lee quién es
// la persona y descarta los tokens: nunca se guardan ni se registran (regla 6 de 9.2).
export function urlDeAutorizacion(
  { url }: Pick<Configuracion, "url">,
  proveedor: Proveedor,
  retorno: string,
  verificador: string,
): Promise<string> {
  return desafio(verificador).then((codigo) => {
    const destino = new URL("/auth/v1/authorize", url);
    destino.search = new URLSearchParams({
      provider: proveedor,
      redirect_to: retorno,
      code_challenge: codigo,
      code_challenge_method: "s256",
    }).toString();
    return destino.toString();
  });
}

type RespuestaCanje = {
  user?: {
    id?: string;
    email?: string;
    email_confirmed_at?: string | null;
    user_metadata?: Record<string, unknown>;
    identities?: {
      id?: string;
      provider?: string;
      identity_data?: Record<string, unknown>;
    }[];
  };
};

const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);

export async function canjearCodigo(
  { url, clavePublicable, solicitar = fetch }: Configuracion,
  proveedor: Proveedor,
  codigo: string,
  verificador: string,
): Promise<PerfilProveedor> {
  const destino = new URL("/auth/v1/token", url);
  destino.search = "grant_type=pkce";
  const respuesta = await solicitar(destino, {
    method: "POST",
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10000),
    headers: { apikey: clavePublicable, "Content-Type": "application/json" },
    body: JSON.stringify({ auth_code: codigo, code_verifier: verificador }),
  });
  // Nunca se copia el cuerpo de la respuesta a un error: podría traer tokens.
  if (!respuesta.ok) throw new Error("CANJE_RECHAZADO_" + respuesta.status);
  const datos: RespuestaCanje = await respuesta.json();
  const identidad = datos.user?.identities?.find((i) => i.provider === proveedor);
  const sub = texto(identidad?.identity_data?.sub) ?? texto(identidad?.id);
  if (!datos.user || !sub) throw new Error("PERFIL_INVALIDO");
  const meta = { ...datos.user.user_metadata, ...identidad?.identity_data };
  return {
    proveedor,
    sub,
    correo: texto(datos.user.email) ?? texto(identidad?.identity_data?.email),
    correoVerificado:
      meta.email_verified === true || Boolean(datos.user.email_confirmed_at),
    nombre: texto(meta.full_name) ?? texto(meta.name),
    fotoUrl: texto(meta.avatar_url) ?? texto(meta.picture),
  };
}
