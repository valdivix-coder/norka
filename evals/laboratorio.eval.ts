import {test,expect} from "vitest";
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {join} from "node:path";
import {planInterpretacion} from "../src/core/usecases/interpretacion";
import {contratoInterpretacion,type Interpretacion} from "../src/core/contracts/interpretacion";
type Contexto={fecha:string;personas_a_cargo:string[];ambitos:string[];integrantes:string[];autor:string};
type Brazo={estado:string;causa?:string|null;bruta?:Interpretacion|null;resultado?:Interpretacion|null;ajustes?:unknown[];ms?:number|null;aplicable?:{elementos:unknown[]}|null};
type Fixture={fuente:{run:string;artefacto:string;corpus:string;sha256Json:string;modelo?:string;tipo?:string;modo?:string};contexto:Contexto;casos:{id:number;texto:string;grupos?:string[];brazos:Record<string,Brazo>}[];resumen:Record<string,unknown>};
const parse=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
function importar73(dir:string):Fixture{
 const bytes=readFileSync(join(dir,"salida-eval-v7-3.json")),j=JSON.parse(bytes.toString());
 if(j.corpus!=="desarrollo-v7-3"||j.resumen.modo!=="desarrollo"||j.resumen.paresCompletos!==22||!j.resumen.comparacionCompleta)throw Error("ARTEFACTO_NO_PERMITIDO");
 const {casos,...contexto}=parse("evals/desarrollo-v7-3.json");
 const versions=j.resumen.versiones as string[];
 return {fuente:{run:"45994191002",artefacto:"15194768714",corpus:j.corpus,sha256Json:createHash("sha256").update(bytes).digest("hex"),modelo:j.resumen.modelo,tipo:"replay_real_gemini",modo:"desarrollo"},contexto,casos:casos.map((c:{id:number;texto:string;grupos?:string[]})=>({id:c.id,texto:c.texto,grupos:c.grupos,brazos:Object.fromEntries(versions.map(v=>{const d=j.detalle.find((x:{id:number;version:string})=>x.id===c.id&&x.version===v);const s=j.solicitudes.find((x:{id:number;version:string;repeticion?:boolean;intento:{resultado:string}})=>x.id===c.id&&x.version===v&&!x.repeticion&&x.intento.resultado==="valida");if(!d||d.estado!=="valida")throw Error("COBERTURA_INCOMPLETA");return [v,{estado:d.estado,bruta:d.bruta,resultado:d.resultado,ajustes:d.ajustes,ms:s?.intento.ms??null}];}))})),resumen:j.resumen.brazos};
}
function importar74(dir:string):Fixture{
 const bytes=readFileSync(join(dir,"salida-eval-v7-4.json")),j=JSON.parse(bytes.toString());
 if(j.corpus!=="desarrollo-v7-4"||j.resumen.modo!=="desarrollo"||j.resumen.paresCompletos!==12||!j.resumen.comparacionCompleta)throw Error("ARTEFACTO_NO_PERMITIDO");
 const {casos,...contexto}=parse("evals/desarrollo-v7-4.json");
 const versions=j.resumen.versiones as string[];
 return {fuente:{run:"46034647175",artefacto:"15215444062",corpus:j.corpus,sha256Json:createHash("sha256").update(bytes).digest("hex"),modelo:j.resumen.modelo,tipo:"replay_real_gemini",modo:"desarrollo"},contexto,casos:casos.map((c:{id:number;texto:string;grupos?:string[]})=>({id:c.id,texto:c.texto,grupos:c.grupos,brazos:Object.fromEntries(versions.map(v=>{const d=j.detalle.find((x:{id:number;version:string})=>x.id===c.id&&x.version===v);const s=j.solicitudes.find((x:{id:number;version:string;repeticion?:boolean;intento:{resultado:string}})=>x.id===c.id&&x.version===v&&!x.repeticion&&x.intento.resultado==="valida");if(!d||d.estado!=="valida")throw Error("COBERTURA_INCOMPLETA");return [v,{estado:d.estado,bruta:d.bruta,resultado:d.resultado,ajustes:d.ajustes,ms:s?.intento.ms??null}];}))})),resumen:j.resumen.brazos};
}
function propuesta(b:Brazo,c:Contexto,texto:string){
 if(b.estado!=="valida"||!b.resultado)return null;
 const ids=(xs:string[],prefix:string)=>xs.map((nombre,i)=>({id:prefix+i,nombre}));
 const personas=ids(c.personas_a_cargo,"p"),ambitos=ids(c.ambitos,"a"),integrantes=ids(c.integrantes,"i");
 const autorId=integrantes.find(x=>x.nombre===c.autor)?.id??"autor";
 const p=planInterpretacion(contratoInterpretacion.parse(b.resultado),{texto,autorId,personas,ambitos,integrantes});
 if(!p)return null;
 const nombre=(xs:{id:string;nombre:string}[],id:string|null)=>xs.find(x=>x.id===id)?.nombre??null;
 return {elementos:p.map(e=>({tipo:e.tipo,titulo:e.titulo,persona_a_cargo:nombre(personas,e.persona_a_cargo_id),ambito:nombre(ambitos,e.ambito_id),plazo_fecha:e.plazo_fecha,plazo_hora:e.plazo_hora,recurrencia:e.recurrencia,dirigida_a:nombre(integrantes,e.dirigida_a_id),confianza:e.por_revisar?"Por revisar":"Sin marca de revisión"}))};
}
test("laboratorio aislado: exportación explícita con procedencia y propuesta real",()=>{
 if(process.env.NORKA_LABORATORIO!=="1")throw Error("LABORATORIO_DESHABILITADO");
 const base="src/laboratorio/fixtures",files=readdirSync(base).filter(f=>/^replay-\d+\.json$/.test(f)).sort();
 const fixtures=files.map(f=>parse(join(base,f)) as Fixture);
 if(process.env.NORKA_REPLAY_V73)fixtures.push(importar73(process.env.NORKA_REPLAY_V73));
 if(process.env.NORKA_REPLAY_V74)fixtures.push(importar74(process.env.NORKA_REPLAY_V74));
 const permitido=new Set(["45922944781","45923853986","45928250323","45994191002","46034647175"]);
 expect(fixtures.every(f=>permitido.has(f.fuente.run)&&f.fuente.modo==="desarrollo"&&!f.fuente.corpus.includes("oficial")&&/^[a-f0-9]{64}$/.test(f.fuente.sha256Json))).toBe(true);
 expect(fixtures.length).toBe(3+Number(!!process.env.NORKA_REPLAY_V73)+Number(!!process.env.NORKA_REPLAY_V74));
 let validas=0,casos=0;
 const limpio=fixtures.map(f=>({...f,casos:f.casos.map(c=>{casos++;return {id:c.id,texto:c.texto,grupos:c.grupos??[],brazos:Object.fromEntries(Object.entries(c.brazos).map(([v,b])=>{if(b.estado==="valida"){contratoInterpretacion.parse(b.bruta);contratoInterpretacion.parse(b.resultado);validas++;}return [v,{estado:b.estado,causa:b.causa??null,bruta:b.bruta??null,resultado:b.resultado??null,ajustes:b.ajustes??[],ms:b.ms??null,aplicable:propuesta(b,f.contexto,c.texto)}];}))};})}));
 expect(casos).toBe(61+(process.env.NORKA_REPLAY_V73?22:0)+(process.env.NORKA_REPLAY_V74?12:0));
 expect(validas).toBe(122+(process.env.NORKA_REPLAY_V73?66:0)+(process.env.NORKA_REPLAY_V74?36:0));
 const d=JSON.stringify(limpio).replace(/</g,"\\u003c").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
 const html=readFileSync("src/laboratorio/plantilla.html","utf8").replace("/*TOKENS*/",()=>readFileSync("src/app/tokens.css","utf8")).replace("/*ESTILOS*/",()=>readFileSync("src/laboratorio/laboratorio.css","utf8")).replace("/*DATOS*/",()=>d).replace("/*LOGICA*/",()=>readFileSync("src/laboratorio/laboratorio.js","utf8"));
 const out=process.env.NORKA_LAB_OUT??"/tmp/norka-laboratorio";
 mkdirSync(out,{recursive:true});writeFileSync(join(out,"laboratorio-norka.html"),html);
 console.log("LABORATORIO",JSON.stringify({casos,validas,fuentes:fixtures.map(f=>({run:f.fuente.run,sha256:f.fuente.sha256Json})),sha256:createHash("sha256").update(html).digest("hex")}));
});
