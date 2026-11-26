import type {Interpretacion,ElementoInterpretado} from "../src/core/contracts/interpretacion";
const campos=["persona_a_cargo","ambito","dirigida_a","plazo_fecha","plazo_hora","recurrencia"] as const;
const canon=(e:ElementoInterpretado,k:typeof campos[number])=>k==="recurrencia"&&e.recurrencia?JSON.stringify({...e.recurrencia,dias:[...e.recurrencia.dias].sort()}):JSON.stringify(e[k]);
const tokens=(s:string)=>new Set(s.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().match(/[a-z0-9]+/g)?.filter(x=>x.length>2&&!["para","del","los","las","una","con","que"].includes(x))??[]);
function distancia(a:ElementoInterpretado,b:ElementoInterpretado){
 const x=tokens(a.titulo),y=tokens(b.titulo);const comun=[...x].filter(k=>y.has(k)).length;
 return (1-comun/Math.max(1,x.size+y.size-comun))*10+campos.filter(k=>canon(a,k)!==canon(b,k)).length+(a.tipo!==b.tipo?1:0);
}
// Emparejamiento uno a uno de costo mínimo, hasta 10 acciones. No cuenta títulos
// como equivalencia semántica: los títulos y montos aún necesitan auditoría humana.
export function auditarAcciones(actual:Interpretacion,esperado:Interpretacion){
 const a=actual.elementos,b=esperado.elementos,n=Math.max(a.length,b.length);
 if(n>10)return {discrepancias:n,omitidas:Math.max(0,b.length-a.length),extras:Math.max(0,a.length-b.length),requiereRevision:true,pares:[]};
 const memo=new Map<string,{costo:number;indices:number[]}>();
 function resolver(i:number,mask:number):{costo:number;indices:number[]}{
  if(i===n)return {costo:0,indices:[]};
  const llave=i+":"+mask,prev=memo.get(llave);if(prev)return prev;
  let mejor={costo:Infinity,indices:[] as number[]};
  for(let j=0;j<n;j++)if(!(mask&(1<<j))){
   const r=resolver(i+1,mask|(1<<j)),c=(a[i]&&b[j]?distancia(a[i],b[j]):20)+r.costo;
   if(c<mejor.costo)mejor={costo:c,indices:[j,...r.indices]};
  }
  memo.set(llave,mejor);return mejor;
 }
 const pares=resolver(0,0).indices.flatMap((j,i)=>a[i]&&b[j]?[{actual:i,esperado:j,campos:campos.filter(k=>canon(a[i],k)!==canon(b[j],k)),noSustentados:campos.filter(k=>a[i][k]!==null&&canon(a[i],k)!==canon(b[j],k))}]:[]);
 const extras=Math.max(0,a.length-b.length),omitidas=Math.max(0,b.length-a.length);
 return {pares,extras,omitidas,discrepancias:pares.reduce((n,p)=>n+p.noSustentados.length,0)+extras,requiereRevision:true};
}
