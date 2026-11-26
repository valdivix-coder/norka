import {describe,it,expect} from "vitest";
import {guardarCaptura,sincronizarCapturas} from "../../src/core/usecases/capturas";
import type {CapturaPendiente} from "../../src/core/domain/captura";
import {crearAlmacenCaptura} from "../../src/data/capturas-supabase";
const id="00000000-0000-4000-8000-000000000001";
const p:CapturaPendiente={id,texto:"  Comprar pan  ",origen:"texto",cuentaId:"a",familiaId:"f"};
describe("Captura 2.2/2.3",()=>{
  it("conserva texto original y no admite texto vacío",async()=>{
    const guardar=async(d:typeof p)=>({captura_id:d.id,tarea_id:d.texto});
    const a={guardar:guardar as Parameters<typeof guardarCaptura>[1]["guardar"]};
    expect((await guardarCaptura(p,a)).tarea_id).toBe(p.texto);
    await expect(guardarCaptura({...p,texto:" "},a)).rejects.toThrow("CAPTURA_INVALIDA");
  });
  it("no elimina pendientes si el servidor falla y no envía otra cuenta",async()=>{
    let filas=[p,{...p,cuentaId:"b"}];let llamadas=0;
    const cola={guardar:async()=>{},listar:async()=>filas,quitar:async(d:CapturaPendiente)=>{filas=filas.filter(x=>x!==d);}};
    expect((await sincronizarCapturas(cola,"a","f",{guardar:async()=>{throw Error("red");}})).enviadas).toBe(0);
    expect(filas).toHaveLength(2);
    expect((await sincronizarCapturas(cola,"a","f",{guardar:async()=>{llamadas++;return {captura_id:id,tarea_id:id};}})).enviadas).toBe(1);
    expect(llamadas).toBe(1);expect(filas[0].cuentaId).toBe("b");
  });
  it("el adaptador no usa familia o autor del cuerpo recibido",async()=>{
    const a=crearAlmacenCaptura({url:"https://qa.example",claveServicio:"qa",familiaId:"f",cuentaId:"a",solicitar:(async(_u:URL,init:RequestInit)=>{
      const body=JSON.parse(String(init.body));expect(body.p_familia).toBe("f");expect(body.p_cuenta).toBe("a");expect(body.p_texto).toBe(p.texto);
      return Response.json({captura_id:id,tarea_id:id});
    }) as typeof fetch});
    expect((await guardarCaptura(p,a)).captura_id).toBe(id);
  });
});
