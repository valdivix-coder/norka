import { NextResponse, type NextRequest } from "next/server";
import { esProveedor } from "@/lib/entrada/proveedores";
import { procesarRetorno } from "@/lib/entrada/retorno";
import { dependencias } from "@/lib/entrada/servidor";
import {
  COOKIE_ENTRADA,
  COOKIE_SESION,
  opcionesCookie,
} from "@/lib/entrada/cookies";

// Vuelta desde Supabase Auth. Abre la sesión propia y descarta todo lo del proveedor.
export async function GET(request: NextRequest) {
  const seguro = request.nextUrl.protocol === "https:";
  const [proveedor, modo, verificador] =
    request.cookies.get(COOKIE_ENTRADA)?.value.split(".") ?? [];
  const ir = (ruta: string) => {
    const r = NextResponse.redirect(new URL(ruta, request.nextUrl.origin));
    r.cookies.set(COOKIE_ENTRADA, "", opcionesCookie(seguro, "/api/entrar", 0));
    return r;
  };
  if (!proveedor || !esProveedor(proveedor) || !verificador)
    return ir("/entrar?error=incompleto");

  const resultado = await procesarRetorno(
    {
      proveedor,
      modo: modo === "unir" ? "unir" : "entrar",
      parametros: request.nextUrl.searchParams,
      verificador,
      tokenSesionActual: request.cookies.get(COOKIE_SESION)?.value,
    },
    dependencias(),
  );

  if (resultado.tipo === "error") return ir(`/entrar?error=${resultado.codigo}`);
  if (resultado.tipo === "unida") return ir("/cuenta?unida=1");
  const respuesta = ir("/cuenta");
  respuesta.cookies.set(
    COOKIE_SESION,
    resultado.tokenSesion,
    opcionesCookie(
      seguro,
      "/",
      Math.floor((resultado.caduca_en_ms - Date.now()) / 1000),
    ),
  );
  return respuesta;
}
