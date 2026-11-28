// D-39, sandbox only. Do not turn uncertain or sensitive actions into one-tap default choices.
import type {RevisionUniversal} from "./motor-revision-universal";
const AMBITOS_BAJO_RIESGO=new Set(["Compras","Hogar","Mascotas","Colegio","Crianza diaria","Trámites"]);
const sensible=/\b(?:pagar|pago|pague|transferir|transferencia|gasto|gaste|cuota|cobro|arancel|matricula|mensualidad|cuenta|dinero|plata|lucas|pesos|medico|medica|dentista|veterinario|veterinaria|vacuna|remedio|medicamento|tratamiento|consulta|dosis|doctor|doctora|kine|oculista|pediatra|enviar|avisar|llamar)\b|\$\s*\d/;
export function preseleccionV77(s:RevisionUniversal):number[]{
 const pendientes=s.items.filter(x=>x.estado==="pendiente");
 const seguro=(i:typeof pendientes[number])=>i.actual.tipo!=="nota"&&i.actual.tipo!=="propuesta"&&i.actual.dirigida_a===null&&i.actual.ambito!==null&&AMBITOS_BAJO_RIESGO.has(i.actual.ambito)&&!sensible.test(i.actual.titulo.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase());
 if(pendientes.some(i=>!seguro(i)))return [];
 return pendientes.filter(i=>i.borrador.estado==="lista").map(i=>i.id);
}
