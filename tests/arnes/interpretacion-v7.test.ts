import {describe,it,expect,vi,beforeAll,afterAll} from "vitest";
import {mkdtempSync,readFileSync,writeFileSync,copyFileSync,symlinkSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {spawnSync} from "node:child_process";
import {crearGeminiSintetico} from "../../src/data/gemini-sintetico";
import {instruccionesCaptura} from "../../src/data/prompt-captura";
import {resolverTiempo} from "../../src/core/usecases/validar-interpretacion-v7";
const corpus={fecha:"2026-11-26T12:00:00-03:00",zona_horaria:"America/Santiago",personas_a_cargo:["El hogar"],integrantes:["Rosa"],autor:"Rosa",ambitos:["Hogar"],casos:[{id:1,texto:"Mañana a las 09:30 limpiar el patio"},{id:2,texto:"Ordenar la casa"}]};
const publico={tipo:"tarea",titulo:"Limpiar el patio",persona_a_cargo:"El hogar",ambito:"Hogar",plazo_fecha:"2026-11-27",plazo_hora:"09:30",recurrencia:null,dirigida_a:null,confianza:"alta"};
const interna={descartes:[],elementos:[{...publico,evidencia:corpus.casos[0].texto,tiempo:["Mañana a las 09:30"],motivo_nota:null}]};
const modelo="gemini-3.5-flash-lite";
const responder=(x:unknown)=>Response.json({candidates:[{finishReason:"STOP",content:{parts:[{text:JSON.stringify(x)}]}}]});
describe("V7: selector y aislamiento sintético",()=>{
 it("V6 predeterminada conserva payload y resultado",async()=>{
  const solicitar=vi.fn(async(_u:RequestInfo|URL,init?:RequestInit)=>{const b=JSON.parse(String(init?.body));expect(b.systemInstruction.parts[0].text).toBe(instruccionesCaptura+"\nDevuelve {elementos:[...]}.");expect(JSON.parse(b.contents[0].parts[0].text).entradas).toEqual(corpus.casos[0]);expect(b.generationConfig.maxOutputTokens).toBeUndefined();return responder({elementos:[publico]});});
  const ia=crearGeminiSintetico({clave:"qa",modelo,corpus,solicitar});expect(ia.version).toBe("6.0");expect(await ia.evaluar(1)).toEqual({elementos:[publico]});expect(ia.brutaInterna(1)).toBeUndefined();
 });
 it("V7 usa esquema ordenado, calendario, tres capas y no altera hora",async()=>{
  const solicitar=vi.fn(async(_u:RequestInfo|URL,init?:RequestInit)=>{const b=JSON.parse(String(init?.body));const datos=JSON.parse(b.contents[0].parts[0].text);expect(datos.texto).toBe(corpus.casos[0].texto);expect(datos.contexto.calendario.manana).toBe("2026-11-27");expect(Object.keys(b.generationConfig.responseJsonSchema.properties.elementos.items.properties).slice(0,2)).toEqual(["evidencia","tiempo"]);expect(b.generationConfig.maxOutputTokens).toBe(1024);return responder(interna);});
  const ia=crearGeminiSintetico({clave:"qa",modelo,corpus,version:"7.0",solicitar});expect(await ia.evaluar(1)).toEqual({elementos:[publico]});expect(ia.bruta(1)).toEqual({elementos:[publico]});expect(ia.brutaInterna(1)).toEqual(interna);expect(Object.keys(ia.brutaInterna(1)!.elementos[0])[0]).toBe("tipo");
 });
 it("V7 no comparte plazos entre casos y rechaza identificadores duplicados",async()=>{
  const segundo={...interna.elementos[0],evidencia:corpus.casos[1].texto,tiempo:[],titulo:"Ordenar la casa"};
  const solicitar=vi.fn(async()=>responder({resultados:[{id:1,...interna},{id:2,descartes:[],elementos:[segundo]}]}));
  const ia=crearGeminiSintetico({clave:"qa",modelo,corpus,version:"7.0",solicitar});const r=await ia.evaluarLote([1,2]);expect(r.get(2)?.elementos[0].plazo_fecha).toBeNull();expect(r.get(2)?.elementos[0].plazo_hora).toBeNull();expect(r.get(1)?.elementos[0].plazo_hora).toBe("09:30");
  const mal=crearGeminiSintetico({clave:"qa",modelo,corpus,version:"7.0",solicitar:vi.fn(async()=>responder({resultados:[{id:1,...interna},{id:1,...interna}]}))});await expect(mal.evaluarLote([1,2])).rejects.toThrow("LOTE_INCOMPLETO");
 });
 it("V7 rechaza truncamiento",async()=>{const ia=crearGeminiSintetico({clave:"qa",modelo,corpus,version:"7.0",solicitar:vi.fn(async()=>Response.json({candidates:[{finishReason:"MAX_TOKENS",content:{parts:[{text:JSON.stringify(interna)}]}}]}))});await expect(ia.evaluar(1)).rejects.toThrow("FINISH_REASON_NO_STOP");});
});
describe("Anexos V7 originales y resistencia contra código integrado",()=>{
 let dir:string;
 beforeAll(()=>{
  dir=mkdtempSync(join(tmpdir(),"norka-v7-"));
  const root=resolve("docs/inteligencia");
  const blocks=[...readFileSync(join(root,"CAMBIOS-V7.md"),"utf8").matchAll(/```ts\n([\s\S]*?)\n```/g)].map(m=>m[1]);
  const names=["calendario.test.ts","validador.test.ts","regresion.test.ts","contrato.test.ts"];
  names.forEach((n,i)=>writeFileSync(join(dir,n),blocks[i+2].replaceAll("/home/claude/valdivix-coder/norka/evals/",resolve("evals")+"/")+"\n"));
  copyFileSync(resolve("src/core/usecases/validar-interpretacion-v7.ts"),join(dir,"postproceso-v7.ts"));
  copyFileSync(resolve("src/core/contracts/interpretacion-interna-v7.ts"),join(dir,"contrato-interno-v7.ts"));
  copyFileSync(join(root,"EJEMPLOS-DESARROLLO-V7.json"),join(dir,"EJEMPLOS-DESARROLLO-V7.json"));
  copyFileSync(join(root,"candidato-v7-0/resistencia.test.ts.txt"),join(dir,"resistencia.test.ts"));
  symlinkSync(resolve("node_modules"),join(dir,"node_modules"),"dir");
 });
 afterAll(()=>{if(dir)rmSync(dir,{recursive:true,force:true});});
 for(const [archivo,esperado] of [["calendario.test.ts","69 ok, 0 fallos"],["validador.test.ts","72 ok, 0 fallos; mutaciones detectadas 20/22"],["regresion.test.ts","DESARROLLO: 50/50 sin cambio de campos"],["contrato.test.ts","referencias internas válidas: 50 / 50"],["resistencia.test.ts","Contraejemplos independientes: 12"]]){
  it(archivo,()=>{const r=spawnSync(process.execPath,["--experimental-strip-types",archivo],{cwd:dir,encoding:"utf8"});expect(r.status,r.stderr+"\n"+r.stdout).toBe(0);expect(r.stdout).toContain(esperado);if(archivo==="regresion.test.ts")expect(r.stdout).toContain("OFICIAL: 50/50 sin cambio de campos");},15000);
 }
});

it("horas explícitas: conserva formato de 24 horas, meridiano y alternativas",()=>{
 const casos:[string[],string|null][]=[ [ ["mañana 09:30"],"09:30"],[["mañana a las 12:00 am"],"00:00"],[["mañana a las 12:00 pm"],"12:00"],[["mañana a las 09:30 o 10:30"],null],[["mañana","a las 09:30","a las 10:30"],null],[["mañana a las 9:3"],null],[["mañana a las 13:30 de la mañana"],null] ];
 for(const [frags,hora] of casos)expect(resolverTiempo("2026-11-26",frags,null).hora,frags.join(" | ")).toBe(hora);
});
