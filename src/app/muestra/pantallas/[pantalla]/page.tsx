import { notFound } from "next/navigation";
import {
  PantallaRecorrido,
  type Pantalla,
} from "@/components/recorrido/PantallaRecorrido";
const permitidas = [
  "hoy",
  "familia",
  "equilibrio",
  "actividad",
  "buscar",
  "avisos",
  "perfil",
  "persona",
];
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ pantalla: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { pantalla } = await params;
  if (!permitidas.includes(pantalla)) notFound();
  const { id } = await searchParams;
  return (
    <PantallaRecorrido
      pantalla={pantalla as Pantalla}
      id={typeof id === "string" ? id : undefined}
    />
  );
}
