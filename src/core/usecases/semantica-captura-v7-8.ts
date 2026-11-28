// Pure conservative diagnostics. No semantic equivalence claim and no network.
export const canonSem78=(s:string)=>s.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
const cond=/\b(?:si|solo si|en caso de que|siempre que|a menos que|con tal de que)\s+/iu;
export function hayCondicion78(s:string){return cond.test(s.normalize("NFC").toLowerCase());}
export function condicionLiteral78(s:string){
 const m=/(?:^|[;.!?]\s*)((?:solo si|si|en caso de que|siempre que|a menos que|con tal de que)\s+[^,;.!?]+),/iu.exec(s.trim());
 if(m)return m[1].trim();
 const fin=/\b((?:solo si|si|en caso de que|siempre que|a menos que|con tal de que)\s+[^,;.!?]+)[.!?]?$/iu.exec(s.trim());
 return fin?.[1].trim()??null;
}
export function conservaCondicion78(texto:string,titulo:string){
 if(!hayCondicion78(texto))return true;
 const f=condicionLiteral78(texto);return !!f&&(" "+canonSem78(titulo)+" ").includes(" "+canonSem78(f)+" ");
}
const pasado=/^(?:(?:ya|ayer|anoche|esta manana|hoy) )?(?:gaste|pague|transferi|compre|lleve|hice|retire|entregue|termine|complete|ordene|limpie|envie|llame|abone|cancele|he pagado|he comprado|he gastado|hemos pagado)\b/;
export function indicioRealizada78(texto:string){return pasado.test(canonSem78(texto))||/(?:^|[;,])\s*(?:(?:ya|ayer|anoche)\s+)?(?:gasté|pagué|transferí|compré|llevé|hice|retiré|entregué|terminé|completé|ordené|limpié|envié|llamé|aboné|cancelé)\b/iu.test(texto);}
export function realizadaUnica78(texto:string){
 const n=canonSem78(texto);
 // Only clearly standalone first-person completed assertions. Never infer across clauses or questions.
 return /^(?:(?:ya|ayer|anoche|esta mañana|hoy)\s+)?(?:gasté|pagué|transferí|compré|llevé|hice|retiré|entregué|terminé|completé|ordené|limpié|envié|llamé|aboné|cancelé|he pagado|he comprado|he gastado|hemos pagado)\b/iu.test(texto.trim())&&pasado.test(n)&&!/[;,!?]|\.\s+\p{L}/u.test(texto)&&!/\b(?:y|e|pero|aunque|si|falta|faltan|pendiente|manana|hay que|tengo que|debo|deberiamos|voy a|para pagar|para comprar|no)\b/.test(n);
}
export function tituloEliptico78(titulo:string){return /\b(?:el|la|los|las) de\b|\b(?:lo mismo|hacerlo|comprarlo|pagarlo)\b/.test(canonSem78(titulo));}
export function contieneNombre78(t:string,n:string){const x=canonSem78(n);return !!x&&(" "+canonSem78(t)+" ").includes(" "+x+" ");}

// A source containing multiple clauses must not be copied into a single interpreted action.
export function condicionUnica78(s:string){const f=condicionLiteral78(s);if(!f)return false;const n=s.trim();const resto=n.replace(f,"").replace(/^\s*,\s*/,"");return !/[;,]|\.\s+\p{L}/u.test(resto)&&!/\b(?:y|e|despues|luego|ademas)\b/.test(canonSem78(resto));}
