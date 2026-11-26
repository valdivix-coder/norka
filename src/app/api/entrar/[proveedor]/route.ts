import { NextResponse, type NextRequest } from "next/server";
import { aleatorioUrl } from "@/lib/entrada/pkce";
import { esProveedor, proveedoresConfigurados } from "@/lib/entrada/proveedores";
import { prepararInicio } from "@/lib/entrada/origen";
import { urlDeAutorizacion } from "@/lib/entrada/supabase-auth";
import {
  COOKIE_ENTRADA,
  COOKIE_SIGUIENTE,
  MAX_ENTRADA_SEGUNDOS,
  opcionesCookie,
} from "@/lib/entrada/cookies";

// Inicia la entrada: guarda el verificador PKCE en una cookie httpOnly de corta vida
// y envía a la persona a Supabase Auth, que la lleva a Google.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ proveedor: string }> },
) {
  const { proveedor } = await params;
  const destinoError = (codigo: string) =>
    NextResponse.redirect(new URL(`/entrar?error=${codigo}`, request.url));
  if (!esProveedor(proveedor) || !proveedoresConfigurados().includes(proveedor))
    return destinoError("fallo");

  try {
    const { modo, retorno, siguiente, redireccion } = prepararInicio(new URL(request.url), proveedor);
    if (redireccion) {
      const respuesta = NextResponse.redirect(redireccion);
      respuesta.headers.set("Cache-Control", "no-store");
      respuesta.headers.set("Referrer-Policy", "no-referrer");
      return respuesta;
    }
    const verificador = aleatorioUrl(48);
    const url = await urlDeAutorizacion(
      { url: process.env.SUPABASE_URL as string }, proveedor, retorno, verificador,
    );
    const respuesta = NextResponse.redirect(url);
    respuesta.headers.set("Cache-Control", "no-store");
    respuesta.headers.set("Referrer-Policy", "no-referrer");
  respuesta.cookies.set(
    COOKIE_ENTRADA,
    `${proveedor}.${modo}.${verificador}`,
    opcionesCookie(request.nextUrl.protocol === "https:", "/api/entrar", MAX_ENTRADA_SEGUNDOS),
  );
  if (siguiente)
    respuesta.cookies.set(
      COOKIE_SIGUIENTE,
      siguiente,
      opcionesCookie(request.nextUrl.protocol === "https:", "/api/entrar", MAX_ENTRADA_SEGUNDOS),
    );
    else respuesta.cookies.set(COOKIE_SIGUIENTE, "", opcionesCookie(request.nextUrl.protocol === "https:", "/api/entrar", 0));
    return respuesta;
  } catch {
    return destinoError("fallo");
  }
}
