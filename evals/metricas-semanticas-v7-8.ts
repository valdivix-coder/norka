import type {Interpretacion} from "../src/core/contracts/interpretacion";
import type {ContextoInterpretacion} from "../src/core/usecases/interpretacion";
import {medirAcciones77,medirListas77} from "./metricas-acciones-v7-7";
import {hayCondicion78,conservaCondicion78,realizadaUnica78,tituloEliptico78} from "../src/core/usecases/semantica-captura-v7-8";
import {iniciarRevision} from "../src/laboratorio/motor-revision-universal";
import {preseleccionV78} from "../src/laboratorio/preseleccion-v7-8";
// Additional diagnostic metrics; old official gates untouched. Mixed conditions must be adjudicated manually.
export function medirSemantica78(a:Interpretacion,e:Interpretacion,ctx:ContextoInterpretacion){
 const m=medirAcciones77(a,e),unica=a.elementos.length===1,condicion=hayCondicion78(ctx.texto),realizada=realizadaUnica78(ctx.texto);
 const s=iniciarRevision(a,ctx);if(!s)throw Error("REVISION_INVALIDA");
 const pre=preseleccionV78(s);
 const detalles=a.elementos.map((x,i)=>{
  const p=m.pares.find(p=>p.actual===i),ref=p?e.elementos[p.esperado]:null;
  const condicionPerdida=unica&&condicion&&x.tipo!=="nota"&&!conservaCondicion78(ctx.texto,x.titulo);
  const condicionSinRevision=condicion&&x.tipo!=="nota"&&x.confianza==="alta";
  const realizadaPendiente=realizada&&x.tipo!=="nota";
  const excesoConfianza=!!ref&&ref.confianza==="baja"&&x.confianza==="alta";
  const eliptico=tituloEliptico78(x.titulo);
  const material=condicionPerdida||condicionSinRevision||realizadaPendiente;
  const lista=s.items[i].borrador.estado==="lista";
  return {indice:i,condicionPerdida,condicionSinRevision,realizadaPendiente,excesoConfianza,eliptico,material,lista,preseleccionada:pre.includes(i),coincidente:!!p?.correcta&&!material};
 });
 return {...medirListas77(a,e,ctx),condicionesMixtasPorAdjudicar:condicion&&!unica?1:0,condicionesPerdidas:detalles.filter(d=>d.condicionPerdida).length,condicionesSinRevision:detalles.filter(d=>d.condicionSinRevision).length,realizadasPendientes:detalles.filter(d=>d.realizadaPendiente).length,excesoConfianza:detalles.filter(d=>d.excesoConfianza).length,titulosElipticos:detalles.filter(d=>d.eliptico).length,listasConErrorAmpliado:detalles.filter(d=>d.lista&&!d.coincidente).length,preseleccionadas:pre.length,preseleccionadasConError:detalles.filter(d=>d.preseleccionada&&!d.coincidente).length,detalles};
}
