import { rutaSiguiente } from "./cookies";

// El origen configurado es del servidor, nunca del parámetro de una visita.
// Un único dominio de prueba evita perder la cookie PKCE entre previews.
export function origenEntrada(actual: string, configurado = process.env.NORKA_ORIGEN_ENTRADA): string {
  if (!configurado) return new URL(actual).origin;
  const url = new URL(configurado);
  if (url.protocol !== "https:" || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash)
    throw new Error("ORIGEN_ENTRADA_INVALIDO");
  return url.origin;
}
export function prepararInicio(actual: URL, proveedor: string, configurado?: string) {
  const origen = origenEntrada(actual.origin, configurado);
  const modo = actual.searchParams.get("modo") === "unir" ? "unir" : "entrar";
  const siguiente = rutaSiguiente(actual.searchParams.get("siguiente"));
  const retorno = new URL("/api/entrar/retorno", origen).toString();
  let redireccion: URL | null = null;
  if (actual.origin !== origen) {
    // Nunca trasladar una sesión de una forma de entrar vinculada entre dominios.
    redireccion = new URL(modo === "unir" ? "/entrar?error=incompleto" : "/api/entrar/"+proveedor, origen);
    if (siguiente && modo === "entrar") redireccion.searchParams.set("siguiente", siguiente);
  }
  return { origen, modo, siguiente, retorno, redireccion };
}
