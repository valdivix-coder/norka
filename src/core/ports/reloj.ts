// La hora siempre entra por este puerto (regla 14 de 9.2).
export interface Reloj {
  ahoraMs(): number;
}
