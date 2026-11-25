import { cookies } from "next/headers";
import { SesionInvalida } from "../../core/domain/cuenta";
import { almacenDeSesion } from "../../core/usecases/almacen-de-sesion";
import { crearAlmacenSupabase } from "../../data/almacen-supabase";
import { crearPertenenciasSupabase } from "../../data/pertenencias-supabase";
import { COOKIE_SESION } from "../entrada/cookies";
import { hashToken } from "../entrada/pkce";
import { almacenes, configuracion, reloj } from "../entrada/servidor";

// Punto de entrada para acciones y pantallas de servidor de 1.7/1.8.
// No acepta cuenta_id, claves ni hashes enviados por el navegador.
export async function almacenFamiliaActual(familiaId: string) {
  if (typeof window !== "undefined") throw new Error("SOLO_SERVIDOR");
  const token = (await cookies()).get(COOKIE_SESION)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw new SesionInvalida();
  const { url, claveServicio } = configuracion();
  return almacenDeSesion(await hashToken(token), familiaId, {
    sesiones: almacenes(),
    pertenencias: crearPertenenciasSupabase({ url, claveServicio }),
    reloj,
    paraFamilia: (id) =>
      crearAlmacenSupabase({ url, claveServicio, familiaId: id }),
  });
}
