import {
  ConflictoUnico,
  CorreoNoVerificado,
  IdentidadEnOtraCuenta,
  normalizarCorreo,
  type Cuenta,
  type PerfilProveedor,
} from "../domain/cuenta";
import type { AlmacenCuentas } from "../ports/cuentas";

export type ResultadoEntrada = {
  cuenta: Cuenta;
  // existente: la identidad ya estaba · unida: se sumó a la cuenta del mismo correo · nueva: cuenta creada
  resultado: "existente" | "unida" | "nueva";
};

async function resolver(
  perfil: PerfilProveedor,
  almacen: AlmacenCuentas,
): Promise<ResultadoEntrada> {
  const identidad = await almacen.buscarIdentidad(perfil.proveedor, perfil.sub);
  if (identidad) {
    const cuenta = await almacen.buscarCuenta(identidad.cuenta_id);
    if (!cuenta) throw new Error("IDENTIDAD_SIN_CUENTA");
    return { cuenta, resultado: "existente" };
  }

  const correo = perfil.correo ? normalizarCorreo(perfil.correo) : "";
  if (!correo) throw new CorreoNoVerificado();

  const mismaPersona = await almacen.buscarCuentaPorCorreo(correo);
  if (mismaPersona) {
    // Solo se une por un correo que el proveedor confirmó. Si no, cualquiera podría
    // reclamar la cuenta de otra persona escribiendo su correo.
    if (!perfil.correoVerificado) throw new CorreoNoVerificado();
    await almacen.agregarIdentidad({
      cuenta_id: mismaPersona.id,
      proveedor: perfil.proveedor,
      sub: perfil.sub,
      correo,
    });
    return { cuenta: mismaPersona, resultado: "unida" };
  }

  const cuenta = await almacen.crearCuenta({
    correo,
    nombre: perfil.nombre?.trim() || correo.split("@")[0],
    foto_url: perfil.fotoUrl,
  });
  await almacen.agregarIdentidad({
    cuenta_id: cuenta.id,
    proveedor: perfil.proveedor,
    sub: perfil.sub,
    correo,
  });
  return { cuenta, resultado: "nueva" };
}

// Regla «una persona, una cuenta» (sección 6.16).
export async function resolverEntrada(
  perfil: PerfilProveedor,
  almacen: AlmacenCuentas,
): Promise<ResultadoEntrada> {
  try {
    return await resolver(perfil, almacen);
  } catch (error) {
    // Dos entradas simultáneas de la misma persona: la segunda reintenta una vez.
    if (error instanceof ConflictoUnico) return resolver(perfil, almacen);
    throw error;
  }
}

// Perfil › Formas de entrar › Agregar otra: suma una identidad a la cuenta con sesión.
export async function unirIdentidad(
  cuentaId: string,
  perfil: PerfilProveedor,
  almacen: AlmacenCuentas,
): Promise<"agregada" | "ya_estaba"> {
  const existente = await almacen.buscarIdentidad(perfil.proveedor, perfil.sub);
  if (existente) {
    if (existente.cuenta_id === cuentaId) return "ya_estaba";
    // Juntar dos cuentas con datos propios no está construido; se rechaza.
    throw new IdentidadEnOtraCuenta();
  }
  try {
    await almacen.agregarIdentidad({
      cuenta_id: cuentaId,
      proveedor: perfil.proveedor,
      sub: perfil.sub,
      correo: perfil.correo ? normalizarCorreo(perfil.correo) : null,
    });
  } catch (error) {
    if (error instanceof ConflictoUnico) throw new IdentidadEnOtraCuenta();
    throw error;
  }
  return "agregada";
}
