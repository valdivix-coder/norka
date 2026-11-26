import {
  ConflictoRevision,
  FueraDeFamilia,
  RegistroAusente,
  type DatosFamilia,
} from "../core/domain/familia";
import type { AlmacenFamilia, TablaFamilia } from "../core/ports/almacen";

export class BaseMemoria {
  private readonly tablas: {
    [T in TablaFamilia]: Map<string, DatosFamilia[T]>;
  } = { personas_a_cargo: new Map(), ambitos: new Map() };

  paraFamilia(familiaId: string): AlmacenFamilia {
    if (!familiaId.trim()) throw new FueraDeFamilia();
    const tablas = this.tablas;
    function comprobar<T extends TablaFamilia>(registro: DatosFamilia[T]) {
      if (registro.familia_id !== familiaId) throw new FueraDeFamilia();
    }
    function obtener<T extends TablaFamilia>(
      tabla: T,
      id: string,
    ): DatosFamilia[T] {
      const registro = tablas[tabla].get(id);
      if (!registro) throw new RegistroAusente();
      comprobar(registro);
      return structuredClone(registro) as DatosFamilia[T];
    }
    return {
      async listar<T extends TablaFamilia>(tabla: T) {
        return structuredClone(
          [...tablas[tabla].values()].filter((r) => r.familia_id === familiaId),
        ) as DatosFamilia[T][];
      },
      async obtener<T extends TablaFamilia>(tabla: T, id: string) {
        return obtener(tabla, id);
      },
      async crear<T extends TablaFamilia>(tabla: T, registro: DatosFamilia[T]) {
        comprobar(registro);
        const mapa = tablas[tabla] as Map<string, DatosFamilia[T]>;
        if (mapa.has(registro.id)) throw new Error("REGISTRO_DUPLICADO");
        if (registro.revision !== 0)
          throw new Error("REVISION_INICIAL_INVALIDA");
        mapa.set(registro.id, structuredClone(registro));
        return structuredClone(registro);
      },
      async actualizar<T extends TablaFamilia>(
        tabla: T,
        registro: DatosFamilia[T],
      ) {
        comprobar(registro);
        const actual = obtener(tabla, registro.id);
        if (actual.revision !== registro.revision)
          throw new ConflictoRevision(actual);
        const siguiente = { ...registro, revision: registro.revision + 1 };
        (tablas[tabla] as Map<string, DatosFamilia[T]>).set(
          registro.id,
          structuredClone(siguiente),
        );
        return structuredClone(siguiente);
      },
    };
  }
}
