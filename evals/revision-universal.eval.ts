import {test,expect} from "vitest";
import {readFileSync} from "node:fs";
import {contratoInterpretacion} from "../src/core/contracts/interpretacion";
import {iniciarRevision,confirmarRevision,deshacerConfirmacion} from "../src/laboratorio/motor-revision-universal";
test("motor universal: conservación y confirmación local sobre replay sintético",()=>{
 const h=readFileSync("/tmp/revision-replay/laboratorio-norka.html","utf8");
 const m=h.match(/<script type="application\/json" id="datos">([\s\S]*?)<\/script>/);
 if(!m)throw Error("REPLAY_AUSENTE");
 const fixtures=JSON.parse(m[1]);
 let capturas=0,respuestas=0,acciones=0,listas=0,pendientes=0,lotes=0,confirmadas=0,deshechas=0,perdidas=0;
 for(const f of fixtures){
  expect(f.fuente.modo).toBe("desarrollo");expect(f.fuente.corpus).not.toContain("oficial");
  const ids=(v:string[],p:string)=>v.map((nombre,i)=>({nombre,id:p+i}));
  const integrantes=ids(f.contexto.integrantes,"i"),autorId=integrantes.find(x=>x.nombre===f.contexto.autor)?.id;
  expect(autorId).toBeDefined();
  for(const c of f.casos){capturas++;
   for(const b of Object.values(c.brazos) as any[]){
    if(b.estado!=="valida")continue;
    const entrada=contratoInterpretacion.parse(b.resultado);
    const s=iniciarRevision(entrada,{texto:c.texto,autorId:autorId!,personas:ids(f.contexto.personas_a_cargo,"p"),ambitos:ids(f.contexto.ambitos,"a"),integrantes})!;
    expect(s.original).toBe(c.texto);expect(s.recibos).toHaveLength(0);
    expect(s.items).toHaveLength(entrada.elementos.length);respuestas++;
    for(const [i,x] of s.items.entries()){
     acciones++;
     if(JSON.stringify(x.original)!==JSON.stringify(entrada.elementos[i])||JSON.stringify(x.borrador.reconocido)!==JSON.stringify(entrada.elementos[i]))perdidas++;
     expect(x.estado).toBe("pendiente");expect(x.borrador.propuesta.ejecutor_id).toBeNull();
     if(x.borrador.estado==="lista")listas++;else pendientes++;
    }
    const seleccion=s.items.filter(x=>x.borrador.estado==="lista").map(x=>x.id);
    const p=s.items.find(x=>x.borrador.estado==="por_completar");
    if(p)expect(()=>confirmarRevision(s,0,[p.id])).toThrow("ACCIONES_PENDIENTES");
    if(seleccion.length){
     const n=confirmarRevision(s,0,seleccion);lotes++;confirmadas+=seleccion.length;
     expect(n.recibos).toHaveLength(1);expect(n.recibos[0].ids).toEqual(seleccion);
     expect(s.recibos).toHaveLength(0);expect(n.items.filter(x=>x.estado==="confirmada")).toHaveLength(seleccion.length);
     const u=deshacerConfirmacion(n,1);expect(u.recibos).toHaveLength(0);expect(u.items.every(x=>x.estado==="pendiente")).toBe(true);deshechas+=seleccion.length;
    }
   }
  }
 }
 console.log("REVISION_REPLAY",JSON.stringify({capturas,respuestas,acciones,listas,pendientes,lotes,confirmadas,deshechas,perdidas}));
 expect(capturas).toBe(105);expect(respuestas).toBe(254);expect(acciones).toBe(367);expect(perdidas).toBe(0);expect(confirmadas).toBe(listas);expect(deshechas).toBe(confirmadas);
});
