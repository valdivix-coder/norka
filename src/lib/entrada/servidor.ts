import { crearAlmacenCuentasSupabase } from "../../data/cuentas-supabase";
import { canjearCodigo } from "./supabase-auth";
import type { Dependencias } from "./retorno";

export const reloj = { ahoraMs: () => Date.now() };

export function configuracion() {
  const url = process.env.SUPABASE_URL;
  const clavePublicable = process.env.SUPABASE_PUBLISHABLE_KEY;
  const claveServicio = process.env.SUPABASE_SECRET_KEY;
  if (!url || !clavePublicable || !claveServicio)
    throw new Error("FALTA_CONFIGURACION_SUPABASE");
  return { url, clavePublicable, claveServicio };
}

export function almacenes() {
  const { url, claveServicio } = configuracion();
  return crearAlmacenCuentasSupabase({ url, claveServicio });
}

export function dependencias(): Dependencias {
  const { url, clavePublicable } = configuracion();
  const almacen = almacenes();
  return {
    cuentas: almacen,
    sesiones: almacen,
    reloj,
    canjear: (proveedor, codigo, verificador) =>
      canjearCodigo({ url, clavePublicable }, proveedor, codigo, verificador),
  };
}
