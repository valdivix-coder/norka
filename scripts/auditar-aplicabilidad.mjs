import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const campos=['plazo_hora','plazo_fecha','recurrencia','persona_a_cargo','ambito','dirigida_a'];
const canon=v=>v&&typeof v==='object'?(Array.isArray(v)?v.map(canon):Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])]))):v;
const iguales=(a,b)=>JSON.stringify(canon(a))===JSON.stringify(canon(b));
// Solo replay sintético exportado por el laboratorio. No leer una BD ni enviar datos.
export function auditarAplicabilidad(fixtures){
 const s={capturas:0,respuestas:0,accionesNormalizadas:0,accionesAplicables:0,accionesPareadas:0,capturasCambioCantidad:0,accionesConCambios:0,porRevisar:0,cambiosPorCampo:{},cambiosTipo:{}};
 const cambios=[];
 const inc=(obj,k)=>obj[k]=(obj[k]??0)+1;
 for(const f of fixtures){
  if(f.fuente?.modo!=='desarrollo'||!f.fuente?.corpus||f.fuente.corpus.includes('oficial'))throw Error('SOLO_DESARROLLO_SINTETICO');
  for(const c of f.casos){s.capturas++;
   for(const [version,b] of Object.entries(c.brazos)){
    if(b.estado!=='valida')continue;
    const a=b.resultado?.elementos,p=b.aplicable?.elementos;
    if(!Array.isArray(a)||!Array.isArray(p))throw Error('CAPA_AUSENTE');
    s.respuestas++;s.accionesNormalizadas+=a.length;s.accionesAplicables+=p.length;
    if(a.length!==p.length)s.capturasCambioCantidad++;
    for(let i=0;i<Math.min(a.length,p.length);i++){
     s.accionesPareadas++;const x=a[i],y=p[i],d=[];
     for(const k of campos)if(x[k]!=null&&!iguales(x[k],y[k])){inc(s.cambiosPorCampo,k);d.push(k);}
     for(const k of ['tipo','titulo'])if(!iguales(x[k],y[k])){inc(s.cambiosPorCampo,k);d.push(k);}
     if(x.tipo!==y.tipo)inc(s.cambiosTipo,x.tipo+'→'+y.tipo);
     if(y.confianza==='Por revisar')s.porRevisar++;
     if(d.length){s.accionesConCambios++;cambios.push({run:f.fuente.run,caso:c.id,version,indice:i,campos:d});}
    }
   }
  }
 }
 return {resumen:s,cambios,limites:'Comparación por índice de capas del laboratorio. No mide exactitud semántica, acciones omitidas por el modelo ni ejecución real; cambios de contrato intencionales también cuentan. Categorías pueden solaparse.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const bytes=readFileSync(process.argv[2]);const h=bytes.toString('utf8');
 const m=h.match(/<script type="application\/json" id="datos">([\s\S]*?)<\/script>/);
 if(!m)throw Error('HTML_DE_LABORATORIO_REQUERIDO');
 const r=auditarAplicabilidad(JSON.parse(m[1]));
 console.log(JSON.stringify({sha256:createHash('sha256').update(bytes).digest('hex'),...r},null,2));
}
