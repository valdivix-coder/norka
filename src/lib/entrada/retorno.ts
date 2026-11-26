import {
  CorreoNoVerificado,
  IdentidadEnOtraCuenta,
  SesionInvalida,
  type PerfilProveedor,
  type Proveedor,
} from "../../core/domain/cuenta";
import type { AlmacenCuentas } from "../../core/ports/cuentas";
import type { AlmacenSesiones } from "../../core/ports/sesiones";
import type { Reloj } from "../../core/ports/reloj";
import { resolverEntrada, unirIdentidad } from "../../core/usecases/entrar";
import { abrirSesion, validarSesion } from "../../core/usecases/sesion";
import { aleatorioUrl, hashToken } from "./pkce";

export type Modo = "entrar" | "unir";

// Códigos que viajan en la URL (?error=). No contienen datos de la persona.
export type CodigoError =
  | "cancelado"
  | "incompleto"
  | "sin_correo_verificado"
  | "otra_cuenta"
  | "fallo";

export type Dependencias = {
  cuentas: AlmacenCuentas;
  sesiones: AlmacenSesiones;
  reloj: Reloj;
  canjear: (
    proveedor: Proveedor,
    codigo: string,
    verificador: string,
  ) => Promise<PerfilProveedor>;
};

export type EntradaRetorno = {
  proveedor: Proveedor;
  modo: Modo;
  parametros: URLSearchParams;
  verificador: string | undefined;
  tokenSesionActual: string | undefined;
};

export type ResultadoRetorno =
  | { tipo: "sesion"; tokenSesion: string; caduca_en_ms: number }
  | { tipo: "unida" }
  | { tipo: "error"; codigo: CodigoError };

export async function procesarRetorno(
  e: EntradaRetorno,
  d: Dependencias,
): Promise<ResultadoRetorno> {
  if (e.parametros.get("error")) return { tipo: "error", codigo: "cancelado" };
  const codigo = e.parametros.get("code");
  if (!codigo || !e.verificador) return { tipo: "error", codigo: "incompleto" };

  try {
    const perfil = await d.canjear(e.proveedor, codigo, e.verificador);

    if (e.modo === "unir") {
      if (!e.tokenSesionActual) return { tipo: "error", codigo: "incompleto" };
      const { cuenta_id } = await validarSesion(
        await hashToken(e.tokenSesionActual),
        d.sesiones,
        d.reloj,
      );
      await unirIdentidad(cuenta_id, perfil, d.cuentas);
      return { tipo: "unida" };
    }

    const { cuenta } = await resolverEntrada(perfil, d.cuentas);
    const tokenSesion = aleatorioUrl(32);
    const { caduca_en_ms } = await abrirSesion(
      cuenta.id,
      await hashToken(tokenSesion),
      d.sesiones,
      d.reloj,
    );
    return { tipo: "sesion", tokenSesion, caduca_en_ms };
  } catch (error) {
    if (error instanceof CorreoNoVerificado)
      return { tipo: "error", codigo: "sin_correo_verificado" };
    if (error instanceof IdentidadEnOtraCuenta)
      return { tipo: "error", codigo: "otra_cuenta" };
    if (error instanceof SesionInvalida)
      return { tipo: "error", codigo: "incompleto" };
    return { tipo: "error", codigo: "fallo" };
  }
}
