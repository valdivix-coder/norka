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
