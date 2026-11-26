import type { ReactNode } from "react";
import { MarcaDelTema } from "@/components/interfaz/MarcaDelTema";
import { MarcoRecorrido } from "@/components/recorrido/MarcoRecorrido";
import { interfaz as m, mensajes } from "@/mensajes/es-CL";
export const metadata = {
  title: `${m.muestra} · ${mensajes.marca}`,
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <MarcoRecorrido
      logotipo={<MarcaDelTema pieza="logotipo" />}
      isotipo={<MarcaDelTema pieza="isotipo" />}
    >
      {children}
    </MarcoRecorrido>
  );
}
