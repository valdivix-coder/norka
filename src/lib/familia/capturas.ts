import { cuentaActual, almacenFamilias } from "@/lib/familia/cuenta";
import { configuracion } from "@/lib/entrada/servidor";
import { verFamilia } from "@/core/usecases/familias";
import { listarCapturasPendientes } from "@/data/capturas-supabase";
import { SesionInvalida } from "@/core/domain/cuenta";
export async function capturasDeFamilia(familiaId:string){
  const cuenta=await cuentaActual();
  if(!cuenta) throw new SesionInvalida();
  const {yo}=await verFamilia(cuenta,familiaId,almacenFamilias());
  return listarCapturasPendientes({...configuracion(),familiaId,integranteId:yo.id});
}
