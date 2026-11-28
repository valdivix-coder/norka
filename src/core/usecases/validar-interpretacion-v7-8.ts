// V7.8: wraps frozen V7.7, preserves cardinality and original capture.
import {validarV77} from "./validar-interpretacion-v7-7";
import type {ContextoV74} from "./validar-interpretacion-v7-4";
import type {SalidaInternaV71} from "../contracts/interpretacion-interna-v7-1";
import {canonSem78,hayCondicion78,conservaCondicion78,realizadaUnica78,indicioRealizada78,contieneNombre78} from "./semantica-captura-v7-8";
export const PASOS_V78=["B1","B2","B3","B4"] as const;
type Paso=typeof PASOS_V78[number];
export function validarV78(interna:SalidaInternaV71,c:ContextoV74,pasos:readonly Paso[]=PASOS_V78){
 const r=validarV77(interna,c),activos=new Set(pasos),unica=r.publica.elementos.length===1,fuente=c.texto.trim(),n=canonSem78(fuente);
 for(const [i,e] of r.publica.elementos.entries()){
  const marca=(campo:string,motivo:string)=>{e.confianza="baja";r.ajustes.push({indice:i,campo,motivo});};
  // B1: never add a beneficiary; explicit unsupported or contradictory reference is removed.
  if(activos.has("B1")&&e.persona_a_cargo&&e.persona_a_cargo!=="El hogar"&&(!contieneNombre78(fuente,e.persona_a_cargo)||interna.elementos[i].persona_base==="ninguna")){
   e.persona_a_cargo=null;marca("persona_a_cargo","v78_sin_ancla");
  }
  // B2: a standalone completed statement cannot be a pending task. Preserve source verbatim as a note.
  if(activos.has("B2")&&e.tipo!=="nota"&&unica&&realizadaUnica78(fuente)){
   Object.assign(e,{tipo:"nota",titulo:fuente,persona_a_cargo:null,ambito:null,plazo_fecha:null,plazo_hora:null,recurrencia:null,dirigida_a:null});marca("tipo","v78_realizada_nota");continue;
  }
  // B3: single conditional action: preserve original verbatim when condition is missing.
  // For a mixed capture don't attach a guessed condition to an arbitrary action: mark for review.
  if(activos.has("B3")&&e.tipo!=="nota"&&hayCondicion78(fuente)){
   if(unica&&!conservaCondicion78(fuente,e.titulo)){e.titulo=fuente;marca("titulo","v78_condicion_literal");}
   if(e.confianza!=="baja")marca("confianza","v78_condicion_revision");
  }
  // B4: payment proposal with exact vocative and modal followed by literal title.
  // Standard catalog only, no negation, condition, ambiguity or duplicate payment.
  if(activos.has("B4")&&unica&&e.tipo==="propuesta"&&e.dirigida_a&&e.ambito&&["Mascotas","Salud","Colegio","Compras","Hogar","Trámites","Crianza diaria"].includes(e.ambito)&&c.ambitos.filter(a=>a==="Pagos y finanzas").length===1&&!hayCondicion78(fuente)&&!indicioRealizada78(fuente)&&!/\b(?:no|nunca|tampoco|o|quizas|tal vez|y|e|pero)\b/.test(n)){
   const destinatario=canonSem78(e.dirigida_a),prefijo=destinatario+" ",t=canonSem78(e.titulo);
   const cuerpo=n.startsWith(prefijo)?n.slice(prefijo.length).replace(/^(?:puedes|podrias|podis|puede) /,""):"";
   if(/^(?:pagar|transferir)\b/.test(t)&&(cuerpo===t||cuerpo.startsWith(t+" el ")||cuerpo.startsWith(t+" manana")||cuerpo.startsWith(t+" hoy")||cuerpo.startsWith(t+" antes del "))){
    e.ambito="Pagos y finanzas";marca("ambito","v78_pago_propuesta_literal");
   }
  }
 }
 return r;
}
