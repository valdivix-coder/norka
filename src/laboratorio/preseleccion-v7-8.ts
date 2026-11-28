import {confirmarRevision,type RevisionUniversal} from "./motor-revision-universal";
import {preseleccionV77} from "./preseleccion-v7-7";
import {canonSem78,hayCondicion78,indicioRealizada78,realizadaUnica78,conservaCondicion78,contieneNombre78} from "../core/usecases/semantica-captura-v7-8";
import {debeOmitirIA} from "../core/usecases/prefiltro-ia";
// A conservative batch-level policy: no inferred clause assignment for automatic selection.
export function preseleccionV78(s:RevisionUniversal):number[]{
 const t=canonSem78(s.original);
 if(s.contexto.integrantes.some(i=>i.id!==s.contexto.autorId&&contieneNombre78(s.original,i.nombre)))return [];
 if(debeOmitirIA(s.original).omitir||hayCondicion78(s.original)||indicioRealizada78(s.original)||/\b(?:no|nunca|tampoco|quizas|tal vez|plata|dinero|lucas|pesos|pagar|pago|transferir|transferencia|gasto|gaste|cuota|cuenta|arancel|matricula|mensualidad|medico|medica|veterinario|veterinaria|vacuna|remedio|consulta|doctor|doctora|dentista|tratamiento|avisar|enviar|llamar)\b/.test(t)||/\$\s*\d/.test(s.original))return [];
 return preseleccionV77(s);
}

// Explicit confirmation guard for the new sandbox; legacy UI is not wired to it.
export function confirmarRevisionV78(s:RevisionUniversal,revision:number,ids:number[]){
 if(realizadaUnica78(s.original))throw Error("HECHO_NO_ES_TAREA_PENDIENTE");
 if(hayCondicion78(s.original)&&ids.some(id=>{const i=s.items.find(x=>x.id===id);return !i||!conservaCondicion78(s.original,i.actual.titulo);}))throw Error("CONDICION_NO_PRESERVADA");
 return confirmarRevision(s,revision,ids);
}
