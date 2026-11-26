import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { MarcaDelTema } from "@/components/interfaz/MarcaDelTema";
import { MarcoReal } from "@/components/familia/MarcoReal";
import { NoEsIntegrante } from "@/core/domain/integrante";
import { verFamilia } from "@/core/usecases/familias";
import { esUuid } from "@/core/usecases/personas-reales";
import { almacenFamilias, cuentaActual } from "@/lib/familia/cuenta";
import { mensajes } from "@/mensajes/es-CL";
export const metadata = { title: { default: mensajes.marca, template: "%s · "+mensajes.marca }, robots: { index: false, follow: false } };
export default async function Layout({ children, params }: {children: ReactNode; params: Promise<{familiaId:string}>}) {
  const { familiaId } = await params;
  if (!esUuid(familiaId)) notFound();
  const cuenta = await cuentaActual();
  if (!cuenta) redirect("/entrar");
  let yo;
  try { ({yo} = await verFamilia(cuenta, familiaId, almacenFamilias())); }
  catch (e) { if(e instanceof NoEsIntegrante) notFound(); throw e; }
  return <MarcoReal familiaId={familiaId} nombre={yo.nombre}
    color={/^persona-[1-8]$/.test(yo.color) ? `var(--${yo.color})` : "var(--persona-1)"}
    logotipo={<MarcaDelTema pieza="logotipo"/>} isotipo={<MarcaDelTema pieza="isotipo"/>}>
    {children}
  </MarcoReal>;
}
