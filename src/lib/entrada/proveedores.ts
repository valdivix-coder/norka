import { PROVEEDORES, type Proveedor } from "../../core/domain/cuenta";

type Entorno = Record<string, string | undefined>;

// Un proveedor se enciende con ENTRADA_<PROVEEDOR>=activa (sección 6.16).
// Además hacen falta SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY.
export function proveedoresConfigurados(entorno: Entorno = process.env): Proveedor[] {
  if (!entorno.SUPABASE_URL || !entorno.SUPABASE_PUBLISHABLE_KEY) return [];
  return PROVEEDORES.filter(
    (p) => entorno[`ENTRADA_${p.toUpperCase()}`] === "activa",
  );
}

export function esProveedor(valor: string): valor is Proveedor {
  return (PROVEEDORES as readonly string[]).includes(valor);
}
