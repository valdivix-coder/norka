// V7.7 experimental. A1–A7 cumulative; no change to previous versions or public contract.
import {validarV76} from "./validar-interpretacion-v7-6";
import {type ContextoV74} from "./validar-interpretacion-v7-4";
import {diaSemana,norm,SEMANA} from "./validar-interpretacion-v7";
import {leerFechaCivil} from "./calendario-captura";
import type {SalidaInternaV71} from "../contracts/interpretacion-interna-v7-1";
export const PASOS_V77=["A1","A2","A3","A4","A5","A6","A7"] as const;
type Paso=typeof PASOS_V77[number];
const dias="lunes|martes|miercoles|jueves|viernes|sabado|domingo";
const marcas=new RegExp("\\b(?:"+dias+"|hoy|manana|ayer|(?:el|del) \\d{1,2})\\b","g");
const alternativa=new RegExp("\\b(?:"+dias+"|hoy|manana|ayer|\\d{1,2})\\s+(?:o|u)\\s+(?:el |este )?(?:"+dias+"|hoy|manana|ayer|\\d{1,2})\\b");
const diaNumero=new RegExp("\\b("+dias+") (\\d{1,2})(?:\\b)");
const meses=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const sinTilde=(s:string)=>s.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase();
const palabra=(s:string)=>norm(s).split(" ").filter(x=>x.length>2&&!["del","para","con","los","las","una","que","por"].includes(x));
const realizados=/\b(?:ya|ayer|anoche|esta manana)\s+(?:pague|transferi|compre|lleve|hice|retire|entregue|fui|termine|complete|ordene|limpie|envie|llame)\b/;
const verbos:Record<string,string>={pague:"pagar",transferi:"transferir",compre:"comprar",lleve:"llevar",hice:"hacer",retire:"retirar",entregue:"entregar",fui:"ir",termine:"terminar",complete:"completar",ordene:"ordenar",limpie:"limpiar",envie:"enviar",llame:"llamar"};
function realizada(texto:string,titulo:string){
 const t=palabra(titulo);
 return texto.split(/[;.!?\n]+|,\s+|\s+y\s+(?=(?:falta|hay que|tengo que|ya|ayer)\b)/iu).map(norm).some(c=>{
  if(!realizados.test(c))return false;
  const verbo=Object.keys(verbos).find(k=>new RegExp("\\b"+k+"\\b").test(c));
  return !!verbo&&t.includes(verbos[verbo])&&t.filter(w=>w!==verbos[verbo]).length>0&&t.filter(w=>w!==verbos[verbo]).every(w=>c.split(" ").includes(w));
 });
}
export function validarV77(interna:SalidaInternaV71,c:ContextoV74,pasos:readonly Paso[]=PASOS_V77){
 const r=validarV76(interna,c), baseFechas=r.publica.elementos.map(e=>e.plazo_fecha), activos=new Set(pasos);
 for(const [i,e] of r.publica.elementos.entries()){
  const o=interna.elementos[i],fr=(o.tiempo??[]).filter(x=>norm(x)&&norm(c.texto).includes(norm(x)));
  const f=norm(fr.join(" ")),literal=sinTilde(fr.join(" "));
  const marcar=(campo:string,motivo:string)=>{e.confianza="baja";r.ajustes.push({indice:i,campo,motivo});};
  const fecha=(valor:string|null,motivo:string)=>{e.plazo_fecha=valor;marcar("plazo_fecha",motivo);};
  const hora=(valor:string|null,motivo:string)=>{e.plazo_hora=valor;marcar("plazo_hora",motivo);};
  const repeticion=/\b(?:cada|todos los|todas las|de cada)\b/.test(f);
  const multiple=[...f.matchAll(marcas)].length>1;
  const ambigua=alternativa.test(f)||multiple&&/\b(?:o|u|no|perdon|mejor|digo|corrijo)\b/.test(f);
  if(e.tipo!=="nota"){
   if(activos.has("A1")&&ambigua)fecha(null,"v77_fecha_alternativa");
   if(activos.has("A2")&&!ambigua&&!repeticion){
    const m=diaNumero.exec(f);
    const relojTrasDia=new RegExp("\\b(?:"+dias+") \\d{1,2}(?:[.h:]\\d{2}|\\s*(?:am|pm)\\b)").test(literal);
    if(m&&!relojTrasDia){
     const raw=o.plazo_fecha, civil=raw&&leerFechaCivil(raw);
     const mes=meses.findIndex(x=>new RegExp("\\bde "+x+"\\b").test(f))+1;
     const anio=/\b(?:de|del) (\d{4})\b/.exec(f);
     const valido=!!(raw&&civil&&civil.dia===Number(m[2])&&norm(SEMANA[diaSemana(raw)])===m[1]&&(!mes||civil.mes===mes)&&(!anio||civil.anio===Number(anio[1]))&&raw>=c.fecha.slice(0,10));
     fecha(valido?raw:null,valido?"v77_fecha_literal_restaurada":"v77_fecha_contradictoria");
    }
   }
   if(activos.has("A3")&&/\b(?:12|doce) de la noche\b/.test(f)){
    hora(o.plazo_hora==="00:00"?o.plazo_hora:null,"v77_medianoche");
    fecha(null,"v77_medianoche_fecha_por_revisar");
   }
   if(activos.has("A4")&&!ambigua&&!/\b(?:12|doce) de la noche\b/.test(f)&&/\b\d{1,2}[.h:]\d{2}\b|\b\d{1,2}\s*(?:am|pm)\b|\b(?:a eso de|como a las|tipo)\b/.test(literal)){
    // Restore only original hour. Literal verification is incomplete; mark explicitly.
    const explicita=/\b(\d{1,2})[.h:](\d{2})\b/.exec(literal),ampm=/\b(\d{1,2})\s*(am|pm)\b/.exec(literal);
    const hh=explicita?Number(explicita[1]):ampm?Number(ampm[1])%12+(ampm[2]==="pm"?12:0):null;
    const mm=explicita?Number(explicita[2]):ampm?0:null;
    const compatible=hh===null||mm===null||o.plazo_hora===String(hh).padStart(2,"0")+":"+String(mm).padStart(2,"0");
    if(o.plazo_hora!==null&&e.plazo_hora!==o.plazo_hora&&compatible)hora(o.plazo_hora,"v77_hora_no_verificada");
    else if(!compatible)marcar("plazo_hora","v77_hora_contradictoria");
    else if(/\b(?:a eso de|como a las|tipo)\b/.test(literal))marcar("plazo_hora","v77_hora_aproximada");
   }
   if(activos.has("A5")&&/\b(?:cada mes|de cada mes|todos los meses)\b/.test(f)&&!/\b(?:desde|a partir|hasta|comenzando|empieza)\b/.test(f)&&e.plazo_fecha!==null)fecha(null,"v77_repeticion_sin_plazo");
   // An inherited date must not survive if its immediately preceding source was invalidated.
   if(activos.has("A1")&&i>0&&o.alcance==="hereda"&&baseFechas[i-1]!==r.publica.elementos[i-1].plazo_fecha&&e.plazo_fecha===baseFechas[i-1])fecha(null,"v77_herencia_por_revisar");
  }
  if(activos.has("A6")&&e.persona_a_cargo==="El hogar"&&/\b(?:pagar|transferir|pago|cuota)\b/.test(norm(e.titulo))&&/\bjardin\b/.test(norm(e.titulo))&&/\bjardin\b/.test(norm(c.texto))&&!/\b(?:de la casa|del hogar|nuestro jardin)\b/.test(norm(c.texto)))marcar("persona_a_cargo","v77_hogar_ambiguo");
  if(activos.has("A7")&&e.tipo!=="nota"&&realizada(c.texto,e.titulo))marcar("tipo","v77_posible_accion_realizada");
 }
 return r;
}
