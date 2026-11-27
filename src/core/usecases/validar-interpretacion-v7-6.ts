// V7.6 experimental: same V7.5 request and V7.4 validator, plus a narrowly evidenced financial correction.
// No custom-catalog guess, no new actions, no dates, amounts or people generated.
import {validarV74,type ContextoV74} from "./validar-interpretacion-v7-4";
import {norm} from "./validar-interpretacion-v7";
import type {SalidaInternaV71} from "../contracts/interpretacion-interna-v7-1";
const FIN="Pagos y finanzas";
const TEMATICOS=new Set(["Mascotas","Salud","Colegio","Compras","Hogar","Trámites","Crianza diaria"]);
const STOP=new Set(["el","la","los","las","un","una","de","del","al","a","por","para","su","sus","que","hay","tengo","pagar","transferir"]);
const tokens=(s:string)=>norm(s).split(" ").filter(x=>x.length>2&&!STOP.has(x));
const verbo=/^(?:(?:hay que|tengo que|tenemos que|falta) )?(pagar|transferir)\b/;
const incierto=/\b(no|nunca|tampoco|si|quizas|tal vez|podria|podriamos|cancelar|anular|evitar|sin)\b/;
export function pagoLiteral(texto:string,titulo:string):boolean {
 const t=norm(titulo);
 if(!verbo.test(t)||incierto.test(t))return false;
 const objeto=tokens(t);
 if(!objeto.length)return false;
 // Split only on explicit independent clauses. Preserve negation/conditional scope conservatively:
 // if the source contains a condition or negation at all, do not autocorrect.
 if(incierto.test(norm(texto)))return false;
 const partes=texto.split(/[,;.!?]+|\s+(?:y|e)\s+(?=(?:hay que |tengo que |tenemos que )?[\p{L}]+(?:ar|er|ir)\b)/iu).map(norm).filter(Boolean);
 const candidatas=partes.filter(p=>verbo.test(p)&&objeto.every(w=>p.split(" ").includes(w)));
 return candidatas.length===1;
}
export function validarV76(interna:SalidaInternaV71,c:ContextoV74){
 const r=validarV74(interna,c);
 if(c.ambitos.filter(a=>a===FIN).length!==1)return r;
 for(const [i,e] of r.publica.elementos.entries()){
  if(e.tipo==="nota"||e.ambito===null||!TEMATICOS.has(e.ambito)||!pagoLiteral(c.texto,e.titulo))continue;
  // Duplicate payment titles or matching payment clauses must not be silently disambiguated.
  if(r.publica.elementos.some((x,j)=>j!==i&&norm(x.titulo)===norm(e.titulo)))continue;
  e.ambito=FIN;e.confianza="baja";
  r.ajustes.push({indice:i,campo:"ambito",motivo:"pago_literal_inequivoco"});
 }
 return r;
}
