import {
  ConflictoPerfil,
  InvitacionNoValida,
  type Integrante,
} from "../core/domain/integrante";
import type {
  AlmacenFamilias,
  CambiosPerfil,
  NuevaFamilia,
  NuevaInvitacion,
  ResumenFamilia,
} from "../core/ports/familias";
import { repartoIgual } from "../core/domain/integrante";

type FamiliaFila = { id: string; nombre: string };
type InvitacionFila = NuevaInvitacion & { usada_en_ms: number | null };

// Para pruebas. Imita las funciones de 0004: mismas reglas, mismos errores.
export class FamiliasMemoria implements AlmacenFamilias {
  readonly familias: FamiliaFila[] = [];
  readonly integrantes: Integrante[] = [];
  readonly invitaciones: InvitacionFila[] = [];
  // En la base el nombre viene de cuentas; aquí se registra aparte.
  readonly nombres = new Map<string, string>();

  private color(familiaId: string) {
    const usados = new Set(
      this.integrantes.filter((i) => i.familia_id === familiaId).map((i) => i.color),
    );
    for (let k = 1; k <= 8; k++) if (!usados.has("persona-" + k)) return "persona-" + k;
    return "persona-" + (((usados.size) % 8) + 1);
  }
  private repartir(familiaId: string) {
    const cs = this.integrantes.filter(
      (i) => i.familia_id === familiaId && i.participacion === "corresponsable",
    );
    const reparto = repartoIgual(cs.length);
    cs.forEach((c, k) => {
      c.cuota_objetivo = reparto[k];
      c.revision += 1;
    });
  }
  private nuevo(
    familia_id: string,
    cuenta_id: string,
    base: Pick<Integrante, "rol_familiar" | "participacion" | "permiso"> &
      Partial<Pick<Integrante, "rol_etiqueta">>,
    cumple: { dia: number | null; mes: number | null },
    telefono: string | null,
  ): Integrante {
    const integrante: Integrante = {
      id: crypto.randomUUID(),
      familia_id,
      cuenta_id,
      nombre: this.nombres.get(cuenta_id) ?? "Integrante",
      rol_familiar: base.rol_familiar,
      rol_etiqueta: base.rol_etiqueta ?? null,
      permiso: base.permiso,
      participacion: base.participacion,
      cuota_objetivo: null,
      color: this.color(familia_id),
      icono: "inicial",
      cumple_dia: cumple.dia,
      cumple_mes: cumple.mes,
      telefono,
      revision: 0,
    };
    this.integrantes.push(integrante);
    return integrante;
  }

  async crearFamilia(d: NuevaFamilia) {
    const familia = { id: crypto.randomUUID(), nombre: d.nombre };
    this.familias.push(familia);
    const i = this.nuevo(
      familia.id,
      d.cuenta_id,
      { rol_familiar: d.rol_familiar, rol_etiqueta: d.rol_etiqueta, participacion: d.participacion, permiso: "administrador" },
      d.cumple,
      d.telefono,
    );
    this.repartir(familia.id);
    return { familia_id: familia.id, integrante_id: i.id };
  }
  async familiasDeCuenta(cuentaId: string): Promise<ResumenFamilia[]> {
    return this.integrantes
      .filter((i) => i.cuenta_id === cuentaId)
      .map((i) => ({
        familia_id: i.familia_id,
        nombre: this.familias.find((f) => f.id === i.familia_id)?.nombre ?? "",
        integrante_id: i.id,
        permiso: i.permiso,
      }));
  }
  async obtenerNombre(familiaId: string) {
    return this.familias.find((f) => f.id === familiaId)?.nombre ?? null;
  }
  async listarIntegrantes(familiaId: string) {
    return this.integrantes
      .filter((i) => i.familia_id === familiaId)
      .map((i) => structuredClone(i));
  }
  async crearInvitacion(d: NuevaInvitacion) {
    if (this.invitaciones.some((i) => i.hash_codigo === d.hash_codigo))
      throw new Error("HASH_REPETIDO");
    this.invitaciones.push({ ...d, usada_en_ms: null });
  }
  async vistaInvitacion(hash: string) {
    const inv = this.invitaciones.find((i) => i.hash_codigo === hash);
    if (!inv) return null;
    return {
      familia_nombre: this.familias.find((f) => f.id === inv.familia_id)?.nombre ?? "",
      rol_familiar: inv.rol_familiar,
      participacion: inv.participacion,
      caduca_en_ms: inv.caduca_en_ms,
      usada: inv.usada_en_ms !== null,
    };
  }
  async aceptarInvitacion(d: {
    hash_codigo: string;
    cuenta_id: string;
    ahora_ms: number;
    cumple: { dia: number | null; mes: number | null };
    telefono: string | null;
  }) {
    const inv = this.invitaciones.find((i) => i.hash_codigo === d.hash_codigo);
    if (!inv) throw new InvitacionNoValida("INVITACION_NO_EXISTE");
    if (inv.usada_en_ms !== null) throw new InvitacionNoValida("INVITACION_USADA");
    if (inv.caduca_en_ms <= d.ahora_ms) throw new InvitacionNoValida("INVITACION_CADUCADA");
    if (this.integrantes.some((i) => i.familia_id === inv.familia_id && i.cuenta_id === d.cuenta_id))
      throw new InvitacionNoValida("YA_ES_INTEGRANTE");
    const i = this.nuevo(
      inv.familia_id,
      d.cuenta_id,
      { rol_familiar: inv.rol_familiar, participacion: inv.participacion, permiso: "integrante" },
      d.cumple,
      d.telefono,
    );
    inv.usada_en_ms = Math.max(d.ahora_ms, inv.creada_en_ms);
    this.repartir(inv.familia_id);
    return { familia_id: inv.familia_id, integrante_id: i.id };
  }
  async actualizarPerfil(integrante: Integrante, c: CambiosPerfil) {
    const fila = this.integrantes.find(
      (i) => i.id === integrante.id && i.familia_id === integrante.familia_id,
    );
    if (!fila) throw new Error("REGISTRO_AUSENTE");
    if (fila.revision !== integrante.revision) throw new ConflictoPerfil(structuredClone(fila));
    fila.rol_familiar = c.rol_familiar;
    fila.rol_etiqueta = c.rol_etiqueta;
    fila.cumple_dia = c.cumple.dia;
    fila.cumple_mes = c.cumple.mes;
    fila.telefono = c.telefono;
    fila.revision += 1;
    return structuredClone(fila);
  }
}
