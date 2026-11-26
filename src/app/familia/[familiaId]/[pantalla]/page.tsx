import { notFound, redirect } from "next/navigation";
import { PantallaRealVacia, FichaReal, type PantallaReal } from "@/components/familia/PantallaReal";
import { FueraDeFamilia, RegistroAusente, type PersonaACargo } from "@/core/domain/familia";
import { SesionInvalida } from "@/core/domain/cuenta";
import { esUuid } from "@/core/usecases/personas-reales";
import { almacenFamiliaActual } from "@/lib/familia/servidor";
import { capturasDeFamilia } from "@/lib/familia/capturas";
import { NoEsIntegrante } from "@/core/domain/integrante";
import type { TareaCapturadaVisible } from "@/core/domain/captura";
import { interfaz as m } from "@/mensajes/es-CL";
const titulos = { hoy:m.hoy, equilibrio:m.equilibrio, actividad:m.actividad, avisos:m.avisos, buscar:m.buscar, persona:m.persona } as const;
export async function generateMetadata({params}: {params:Promise<{pantalla:string}>}) {
  const {pantalla}=await params;
  return {title:Object.hasOwn(titulos,pantalla)?titulos[pantalla as keyof typeof titulos]:m.familia};
}
const permitidas = ["hoy","equilibrio","actividad","avisos","buscar","persona"];
export default async function Page({params,searchParams}: {
  params:Promise<{familiaId:string;pantalla:string}>;searchParams:Promise<{id?:string}>
}) {
  const {familiaId,pantalla}=await params;
  if(!esUuid(familiaId)||!permitidas.includes(pantalla)) notFound();
  const {id}=await searchParams;
  if(pantalla==="persona"&&!esUuid(id)) notFound();
  let personas: Parameters<typeof PantallaRealVacia>[0]["personas"] = [];
  let ficha: PersonaACargo | null = null;
  let capturas:TareaCapturadaVisible[]=[];
  try {
    const almacen=await almacenFamiliaActual(familiaId);
    if(pantalla==="hoy") capturas=await capturasDeFamilia(familiaId);
    if(pantalla==="buscar") personas=(await almacen.listar("personas_a_cargo")).filter(p=>!p.archivada_en)
      .map(({id,nombre,tipo,color})=>({id,nombre,tipo,color}));
    if(pantalla==="persona" && esUuid(id)) ficha=await almacen.obtener("personas_a_cargo",id);
  } catch(e) {
    if(e instanceof SesionInvalida) redirect("/entrar");
    if(e instanceof FueraDeFamilia || e instanceof RegistroAusente || e instanceof NoEsIntegrante) notFound();
    throw e;
  }
  if(pantalla==="persona") {
    if(!ficha || ficha.archivada_en) notFound();
    const {id,nombre,tipo,color,cumple_dia,cumple_mes}=ficha;
    return <FichaReal familiaId={familiaId} persona={{id,nombre,tipo,color,cumple_dia,cumple_mes}}/>;
  }
  return <PantallaRealVacia pantalla={pantalla as PantallaReal} familiaId={familiaId} personas={personas} capturas={capturas}/>;
}
