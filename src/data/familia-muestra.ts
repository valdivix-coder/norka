import { BaseMemoria } from "./almacen-memoria";
import type { PersonaACargo } from "@/core/domain/familia";
import { interfaz as m } from "@/mensajes/es-CL";

export const familiaMuestraId = "muestra-local";
export const hogarMuestra: PersonaACargo = {
  id: "hogar",
  familia_id: familiaMuestraId,
  tipo: "hogar",
  nombre: m.hogar,
  cumple_dia: null,
  cumple_mes: null,
  anio_nacimiento: null,
  va_al_colegio: false,
  color: "var(--persona-hogar)",
  icono: "puerta",
  archivada_en: null,
  revision: 0,
};
export function crearAlmacenMuestra() {
  const almacen = new BaseMemoria().paraFamilia(familiaMuestraId);
  const preparado = almacen.crear("personas_a_cargo", hogarMuestra);
  return { almacen, preparado };
}
// Datos de QA, solo accesibles dentro del recorrido que se identifica como muestra.
export const personasEjemplo: PersonaACargo[] = [
  {
    ...hogarMuestra,
    id: "emilia",
    tipo: "hija_hijo",
    nombre: "Emilia",
    cumple_dia: 12,
    cumple_mes: 3,
    va_al_colegio: true,
    color: "var(--persona-1)",
    icono: "persona",
  },
  {
    ...hogarMuestra,
    id: "toby",
    tipo: "mascota",
    nombre: "Toby",
    color: "var(--persona-2)",
    icono: "mascota",
  },
];
