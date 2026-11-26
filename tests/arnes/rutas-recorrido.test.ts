import { describe, expect, it } from "vitest";
import { destinoRecorrido, movimientoEntre, rutaRecorrido, gestoVolver, personaDeRuta } from "../../src/lib/rutas-recorrido";
const base = "/familia/00000000-0000-4000-8000-000000000001";
describe("Navegación 1.9",()=>{
  it("solo usa IDs válidos de fichas reales para la transición compartida",()=>{
    const id="00000000-0000-4000-8000-000000000002";
    expect(personaDeRuta(base+"/persona?id="+id)).toBe(id);
    expect(personaDeRuta(base+"/persona?id=inválido")).toBeNull();
    expect(personaDeRuta("/muestra/pantallas/persona?id="+id)).toBeNull();
  });
  it("solo confirma un gesto horizontal al superar la mitad del ancho",()=>{
    expect(gestoVolver(181,10,360)).toBe(true);
    expect(gestoVolver(180,10,360)).toBe(false);
    expect(gestoVolver(200,210,360)).toBe(false);
    expect(gestoVolver(-200,0,360)).toBe(false);
  });
  it("reconoce la familia autenticada y su raíz como pestaña Familia",()=>{
    expect(rutaRecorrido(base)).toEqual({base,pantalla:"familia",real:true});
    expect(destinoRecorrido(base,"familia")).toBe(base);
    expect(rutaRecorrido(base+"/perfil?guardado=1")?.pantalla).toBe("perfil");
  });
  it("no mezcla rutas de muestra, entrada e invitaciones con las reales",()=>{
    expect(rutaRecorrido("/muestra/pantallas/hoy")?.real).toBe(false);
    expect(rutaRecorrido("/familia/nueva")).toBeNull();
    expect(rutaRecorrido("/invitacion/codigo")).toBeNull();
    expect(destinoRecorrido("/muestra/pantallas","familia")).toBe("/muestra/pantallas/familia");
  });
  it("determina dirección de pestañas y vuelta desde detalle",()=>{
    expect(movimientoEntre("hoy","familia")).toEqual({detalle:false,sentido:1});
    expect(movimientoEntre("familia","hoy")).toEqual({detalle:false,sentido:-1});
    expect(movimientoEntre("perfil","familia")).toEqual({detalle:true,sentido:-1});
    expect(movimientoEntre("familia","perfil")).toEqual({detalle:true,sentido:1});
  });
});
