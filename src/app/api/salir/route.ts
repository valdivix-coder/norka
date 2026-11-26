import { NextResponse, type NextRequest } from "next/server";
import { cerrarSesion } from "@/core/usecases/sesion";
import { hashToken } from "@/lib/entrada/pkce";
import { almacenes } from "@/lib/entrada/servidor";
import { COOKIE_SESION, opcionesCookie } from "@/lib/entrada/cookies";

// Cierra la sesión en la base y borra la cookie. Solo acepta envíos desde este mismo sitio.
export async function POST(request: NextRequest) {
  const origen = request.headers.get("origin");
  if (origen && origen !== request.nextUrl.origin)
    return new NextResponse(null, { status: 403 });
  const token = request.cookies.get(COOKIE_SESION)?.value;
  if (token) await cerrarSesion(await hashToken(token), almacenes());
  const respuesta = NextResponse.redirect(
    new URL("/entrar", request.nextUrl.origin),
    303,
  );
  respuesta.cookies.set(
    COOKIE_SESION,
    "",
    opcionesCookie(request.nextUrl.protocol === "https:", "/", 0),
  );
  return respuesta;
}
