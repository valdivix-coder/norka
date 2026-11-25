import { notFound, redirect } from "next/navigation";
import { PantallaRealVacia, type PantallaReal } from "@/components/familia/PantallaReal";
import { FueraDeFamilia } from "@/core/domain/familia";
import { SesionInvalida } from "@/core/domain/cuenta";
import { esUuid } from "@/core/usecases/personas-reales";
import { almacenFamiliaActual } from "@/lib/familia/servidor";
const permitidas = ["hoy","equilibrio","actividad","avisos","buscar"];
export default async function Page({params}: {params:Promise<{familiaId:string;pantalla:string}>}) {
  const {familiaId,pantalla}=await params;
  if(!esUuid(familiaId)||!permitidas.includes(pantalla)) notFound();
  try {
    const almacen=await almacenFamiliaActual(familiaId);
    const personas=pantalla==="buscar" ? (await almacen.listar("personas_a_cargo")).filter(p=>!p.archivada_en)
      .map(({id,nombre,tipo,color})=>({id,nombre,tipo,color})) : [];
    return <PantallaRealVacia pantalla={pantalla as PantallaReal} familiaId={familiaId} personas={personas}/>;
  } catch(e) {
    if(e instanceof SesionInvalida) redirect("/entrar");
    if(e instanceof FueraDeFamilia) notFound();
    throw e;
  }
}
