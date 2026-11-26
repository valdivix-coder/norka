export const COOKIE_SESION = "norka_sesion";
export const COOKIE_ENTRADA = "norka_entrada";
export const MAX_ENTRADA_SEGUNDOS = 600;

type OpcionesCookie = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
};

export function opcionesCookie(
  seguro: boolean,
  path: string,
  maxAge: number,
): OpcionesCookie {
  return { httpOnly: true, secure: seguro, sameSite: "lax", path, maxAge };
}

export const COOKIE_SIGUIENTE = "norka_siguiente";

// Solo se vuelve a la página de una invitación. Todo lo demás se ignora, así nadie puede
// usar la entrada para enviar a una persona a otro sitio.
export function rutaSiguiente(valor: string | null | undefined): string | null {
  return valor && /^\/invitacion\/[A-Za-z0-9_-]{43}$/.test(valor) ? valor : null;
}
