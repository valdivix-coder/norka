import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {z} from "zod";
import {crearGeminiSintetico,ErrorGemini,SinModelosDisponibles,type ContextoSintetico,type IntentoGemini} from "../src/data/gemini-sintetico";
import {instruccionesCaptura} from "../src/data/prompt-captura";
import {instruccionesCapturaV7,sufijoLoteV7,sufijoIndividualV7} from "../src/data/prompt-captura-v7";
import {contratoInternoV7,contratoLoteInternoV7} from "../src/core/contracts/interpretacion-interna-v7";
import type {Interpretacion} from "../src/core/contracts/interpretacion";
import type {SalidaInterna} from "../src/core/usecases/validar-interpretacion-v7";
import type {AjusteInterpretacion} from "../src/core/usecases/revisar-interpretacion";
import {auditarAcciones} from "./auditar-acciones";
export type Version="6.0"|"7.0";
export type CasoEvaluable={id:number;texto:string;esperado:Interpretacion};
export type CorpusEvaluable=Omit<ContextoSintetico,"casos">&{casos:CasoEvaluable[]};
export const MODELO_AB="gemini-3.5-flash-lite";
const sha=(s:string|Buffer)=>createHash("sha256").update(s).digest("hex");
export function huellas(){
 return {"6.0":{instruccion:sha(instruccionesCaptura),validador:sha(readFileSync("src/core/usecases/revisar-interpretacion.ts"))},
 "7.0":{instruccion:sha(instruccionesCapturaV7),individual:sha(sufijoIndividualV7),lote:sha(sufijoLoteV7),
 esquema:sha(JSON.stringify(z.toJSONSchema(contratoInternoV7))),esquemaLote:sha(JSON.stringify(z.toJSONSchema(contratoLoteInternoV7))),
 validador:sha(readFileSync("src/core/usecases/validar-interpretacion-v7.ts"))}};
}
const campos=["tipo","persona_a_cargo","ambito","plazo_fecha","plazo_hora","recurrencia","dirigida_a"] as const;
const principales=["persona_a_cargo","ambito","plazo_fecha","plazo_hora"] as const;
type Elemento=Interpretacion["elementos"][number];
function firma(e:Elemento,ks:readonly (typeof campos[number])[]){return JSON.stringify(ks.map(k=>k==="recurrencia"&&e.recurrencia?{...e.recurrencia,dias:[...e.recurrencia.dias].sort()}:e[k]));}
function igual(a:Interpretacion,b:Interpretacion,ks:readonly (typeof campos[number])[]){return JSON.stringify(a.elementos.map(e=>firma(e,ks)).sort())===JSON.stringify(b.elementos.map(e=>firma(e,ks)).sort());}
function capa(a:Interpretacion,e:Interpretacion){
 const audit=auditarAcciones(a,e);const porCampo:Record<string,number>={};
 let accionesConDiscrepancia=audit.omitidas+audit.extras;
 for(const p of audit.pares){const dif=[...p.campos];if(a.elementos[p.actual].tipo!==e.elementos[p.esperado].tipo){porCampo.tipo=(porCampo.tipo??0)+1;accionesConDiscrepancia++;}else if(dif.length)accionesConDiscrepancia++;for(const k of dif)porCampo[k]=(porCampo[k]??0)+1;}
 let discrepanciasGlobales=0;
 for(const el of a.elementos)for(const k of ["persona_a_cargo","ambito","dirigida_a","plazo_fecha","plazo_hora"] as const)if(el[k]!==null&&!e.elementos.some(x=>x[k]===el[k]))discrepanciasGlobales++;
 return {principal:igual(a,e,principales),estricta:igual(a,e,campos),audit,porCampo,accionesConDiscrepancia,discrepanciasGlobales};
}
type Detalle={id:number;version:Version;estado:"no_ejecutada"|"fallida"|"valida";causa?:string;modelo?:string;brutaInterna?:SalidaInterna;bruta?:Interpretacion;resultado?:Interpretacion;ajustes?:AjusteInterpretacion[];metricas?:{bruta:ReturnType<typeof capa>;normalizada:ReturnType<typeof capa>}};
type Solicitud={version:Version;ids:number[];intento:IntentoGemini};
function acumular(dest:Record<string,number>,src:Record<string,number>){for(const [k,v] of Object.entries(src))dest[k]=(dest[k]??0)+v;}
function resumenBrazo(det:Detalle[],solicitudes:Solicitud[]){
 const validas=det.filter(x=>x.estado==="valida"),fallidas=det.filter(x=>x.estado==="fallida");
 const s={principalBruta:0,estrictaBruta:0,principalNormalizada:0,estrictaNormalizada:0,porAccion:0,porAccionBruta:0,camposInventados:0,camposBrutosDiscrepantes:0,accionesDiscrepantesBrutas:0,accionesDiscrepantesNormalizadas:0,omitidasBrutas:0,extrasBrutas:0,omitidasNormalizadas:0,extrasNormalizadas:0,porCampoBruta:{} as Record<string,number>,porCampoNormalizada:{} as Record<string,number>,ajustesPorMotivo:{} as Record<string,number>,casosCorregidos:[] as number[],casosEmpeorados:[] as number[],fallosPorCausa:{} as Record<string,number>,totalElementos:0,porRevisar:0};
 for(const d of validas){const m=d.metricas!;const b=m.bruta,n=m.normalizada;
  s.principalBruta+=Number(b.principal);s.estrictaBruta+=Number(b.estricta);s.principalNormalizada+=Number(n.principal);s.estrictaNormalizada+=Number(n.estricta);
  s.porAccion+=n.audit.discrepancias;s.porAccionBruta+=b.audit.discrepancias;s.camposInventados+=n.discrepanciasGlobales;s.camposBrutosDiscrepantes+=b.discrepanciasGlobales;
  s.accionesDiscrepantesBrutas+=b.accionesConDiscrepancia;s.accionesDiscrepantesNormalizadas+=n.accionesConDiscrepancia;
  s.omitidasBrutas+=b.audit.omitidas;s.extrasBrutas+=b.audit.extras;s.omitidasNormalizadas+=n.audit.omitidas;s.extrasNormalizadas+=n.audit.extras;
  acumular(s.porCampoBruta,b.porCampo);acumular(s.porCampoNormalizada,n.porCampo);
  for(const a of d.ajustes??[])s.ajustesPorMotivo[a.motivo]=(s.ajustesPorMotivo[a.motivo]??0)+1;
  if((!b.principal&&n.principal)||(!b.estricta&&n.estricta))s.casosCorregidos.push(d.id);
  if((b.principal&&!n.principal)||(b.estricta&&!n.estricta))s.casosEmpeorados.push(d.id);
  for(const e of d.resultado!.elementos){s.totalElementos++;if(e.confianza==="baja"||e.persona_a_cargo===null||e.ambito===null)s.porRevisar++;}
 }
 for(const q of solicitudes)if(q.intento.resultado!=="valida"){const causa=q.intento.motivo??"desconocida";s.fallosPorCausa[causa]=(s.fallosPorCausa[causa]??0)+1;}
 const exitos=solicitudes.filter(x=>x.intento.resultado==="valida"),lat=exitos.map(x=>x.intento.ms).sort((a,b)=>a-b);
 const mediana=lat.length?(lat[Math.floor((lat.length-1)/2)]+lat[Math.floor(lat.length/2)])/2:null;
 const p95=lat.length?lat[Math.ceil(lat.length*.95)-1]:null;
 const consumo={entrada:0,salida:0,razonamiento:0,sinMedicion:0};
 for(const q of solicitudes){const i=q.intento;if(i.tokensEntrada===undefined||i.tokensSalida===undefined)consumo.sinMedicion++;consumo.entrada+=i.tokensEntrada??0;consumo.salida+=i.tokensSalida??0;consumo.razonamiento+=i.tokensRazonamiento??0;}
 return {...s,total:det.length,validas:validas.length,fallidas:fallidas.length,intentadas:validas.length+fallidas.length,noEjecutadas:det.length-validas.length-fallidas.length,tasaPorRevisar:s.totalElementos?s.porRevisar/s.totalElementos:null,solicitudes:solicitudes.length,consumo,medianaMs:mediana,p95Ms:p95};
}
export async function ejecutarComparacion({clave,corpus,versiones=["6.0","7.0"],tamano=1,semilla=20261126,solicitar,esperar=ms=>new Promise<void>(r=>setTimeout(r,ms))}:{clave:string;corpus:CorpusEvaluable;versiones?:Version[];tamano?:number;semilla?:number;solicitar?:typeof fetch;esperar?:(ms:number)=>Promise<void>}){
 if(!Number.isSafeInteger(semilla)||!Number.isInteger(tamano)||tamano<1||tamano>5||!versiones.length||new Set(versiones).size!==versiones.length||versiones.some(v=>v!=="6.0"&&v!=="7.0"))throw new Error("CONFIG_AB_INVALIDA");
 const ids=new Set(corpus.casos.map(c=>c.id));if(ids.size!==corpus.casos.length)throw new Error("CORPUS_AB_INVALIDO");
 const detalle:Detalle[]=versiones.flatMap(version=>corpus.casos.map(c=>({id:c.id,version,estado:"no_ejecutada" as const})));
 const solicitudes:Solicitud[]=[];let grupoActual:number[]=[];let primera=true;
 const adaptadores=new Map(versiones.map(version=>[version,crearGeminiSintetico({clave,modelo:MODELO_AB,respaldos:[],version,corpus,solicitar,observar:intento=>solicitudes.push({version,ids:[...grupoActual],intento})})]));
 const registro=(id:number,version:Version)=>detalle.find(d=>d.id===id&&d.version===version)!;
 let parada:{motivo:string;version?:Version;ids:number[]}|null=null;
 outer:for(let i=0;i<corpus.casos.length;i+=tamano){
  const grupo=corpus.casos.slice(i,i+tamano);grupoActual=grupo.map(x=>x.id);
  const orden=(Math.floor(i/tamano)+Math.abs(semilla))%2===0?versiones:[...versiones].reverse();
  for(const version of orden){
   const ia=adaptadores.get(version)!;
   const antes=solicitudes.length;
   for(let intento=0;intento<2;intento++){
    if(!primera)await esperar(4500);primera=false;
    try{
     const salidas=await ia.evaluarLote(grupoActual);
     for(const caso of grupo){const resultado=salidas.get(caso.id)!,bruta=ia.bruta(caso.id)!;Object.assign(registro(caso.id,version),{estado:"valida",modelo:ia.modeloUsado(),brutaInterna:ia.brutaInterna(caso.id),bruta,resultado,ajustes:ia.ajustes(caso.id),metricas:{bruta:capa(bruta,caso.esperado),normalizada:capa(resultado,caso.esperado)}});}
     break;
    }catch(error){
     const ultimo=solicitudes.length>antes?solicitudes.at(-1)?.intento:undefined;
     const causa=error instanceof ErrorGemini?"HTTP "+error.estado:ultimo?.motivo??(error instanceof SinModelosDisponibles?"sin_modelos":"sin_salida_valida");
     if(intento===0&&(causa==="HTTP 503"||causa==="timeout"))continue;
     if(solicitudes.length>antes)for(const id of grupoActual)Object.assign(registro(id,version),{estado:"fallida",causa});
     parada={motivo:causa==="HTTP 429"?"cuota_429":"cobertura_incompleta:"+causa,version,ids:[...grupoActual]};break outer;
    }
   }
  }
  if(tamano===1&&versiones.length===2){
   const a=registro(grupoActual[0],"6.0").metricas!,b=registro(grupoActual[0],"7.0").metricas!;
   const regresion=(["bruta","normalizada"] as const).some(k=>(["principal","estricta"] as const).some(m=>a[k][m]&&!b[k][m]));
   const empeorada=b.bruta.estricta&&!b.normalizada.estricta||b.bruta.principal&&!b.normalizada.principal;
   if(regresion||empeorada){parada={motivo:regresion?"regresion_individual":"validador_empeora",version:"7.0",ids:[...grupoActual]};break;}
  }
 }
 const brazos=Object.fromEntries(versiones.map(v=>[v,resumenBrazo(detalle.filter(d=>d.version===v),solicitudes.filter(q=>q.version===v))])) as Partial<Record<Version,ReturnType<typeof resumenBrazo>>>;
 const pares=corpus.casos.flatMap(c=>{if(versiones.length!==2)return [];const a=registro(c.id,"6.0"),b=registro(c.id,"7.0");return a.metricas&&b.metricas?[{id:c.id,v6:a.metricas,v7:b.metricas}]:[];});
 return {resumen:{modo:tamano===1?"individual":"diagnostico_agrupado",tamano,semilla,modelo:MODELO_AB,respaldos:[],versiones,huellas:huellas(),parada,brazos,paresCompletos:pares.length,comparacionCompleta:versiones.length===2&&pares.length===corpus.casos.length,revisionManual:"Pendiente; discrepancia no equivale a invención."},detalle,solicitudes,pares};
}
