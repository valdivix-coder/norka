import { cookies } from "next/headers";
import { validarSesion } from "../../core/usecases/sesion";
import { crearAlmacenFamiliasSupabase } from "../../data/familias-supabase";
import { COOKIE_SESION } from "../entrada/cookies";
import { hashToken } from "../entrada/pkce";
import { almacenes, configuracion, reloj } from "../entrada/servidor";

// La cuenta sale siempre de la cookie de sesión, nunca de datos enviados por el navegador.
export async function cuentaActual(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE_SESION)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  try {
    const { cuenta_id } = await validarSesion(await hashToken(token), almacenes(), reloj);
    return cuenta_id;
  } catch {
    return null;
  }
}

export function almacenFamilias() {
  const { url, claveServicio } = configuracion();
  return crearAlmacenFamiliasSupabase({ url, claveServicio });
}

export { reloj };
