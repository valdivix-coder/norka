import type {RevisionUniversal} from "./motor-revision-universal";
import {preseleccionV77} from "./preseleccion-v7-7";
import {canonSem78,hayCondicion78,indicioRealizada78} from "../core/usecases/semantica-captura-v7-8";
import {debeOmitirIA} from "../core/usecases/prefiltro-ia";
// A conservative batch-level policy: no inferred clause assignment for automatic selection.
export function preseleccionV78(s:RevisionUniversal):number[]{
 const t=canonSem78(s.original);
 if(debeOmitirIA(s.original).omitir||hayCondicion78(s.original)||indicioRealizada78(s.original)||/\b(?:no|nunca|tampoco|quizas|tal vez|plata|dinero|lucas|pesos|pagar|pago|transferir|transferencia|gasto|gaste|cuota|cuenta|arancel|matricula|mensualidad|medico|medica|veterinario|veterinaria|vacuna|remedio|consulta|doctor|doctora|dentista|tratamiento|avisar|enviar|llamar)\b/.test(t)||/\$\s*\d/.test(s.original))return [];
 return preseleccionV77(s);
}
