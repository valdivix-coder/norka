import {describe,it,expect,vi} from "vitest";
import {crearColaInterpretacionSupabase} from "../../src/data/interpretacion-supabase";
const f="10000000-0000-4000-8000-000000000001",c="20000000-0000-4000-8000-000000000001",cap="30000000-0000-4000-8000-000000000001",a="40000000-0000-4000-8000-000000000001";
const config={url:"https://qa.example",claveServicio:"qa",familiaId:f,cuentaId:c,capturaId:cap};
describe("Cola Supabase acotada",()=>{
 it("reserva antes de leer contexto y no lee nada si no hay reserva",async()=>{
  const solicitar=vi.fn(async()=>Response.json(null));
  expect(await crearColaInterpretacionSupabase({...config,solicitar}).reservar()).toBeNull();
  expect(solicitar).toHaveBeenCalledTimes(1);
 });
 it("rechaza respuesta de otra familia antes de entregar texto",async()=>{
  const solicitar=vi.fn(async(u:RequestInfo|URL)=>new URL(String(u)).pathname.endsWith("/reservar_interpretacion")?
    Response.json({revision:1,intentos:1}):Response.json([{id:a,familia_id:"otra",cuenta_id:c,consentimiento_ia:true}]));
  await expect(crearColaInterpretacionSupabase({...config,solicitar}).reservar()).rejects.toThrow("RESPUESTA_FUERA_DE_FAMILIA");
  expect(solicitar).toHaveBeenCalledTimes(2);
 });
 it("proyecta contexto mínimo y aplica a la reserva exacta, no a otra captura",async()=>{
  const solicitar=vi.fn(async(u:RequestInfo|URL,init?:RequestInit)=>{
   const url=new URL(String(u)),ruta=url.pathname.split("/").at(-1);
   if(ruta==="reservar_interpretacion")return Response.json({revision:1,intentos:1});
   if(ruta==="aplicar_interpretacion"){expect(JSON.parse(String(init?.body))).toMatchObject({p_familia:f,p_cuenta:c,p_captura:cap,p_revision:1});return Response.json({estado:"sin_clasificar"});}
   expect(url.searchParams.get("familia_id")).toBe("eq."+f);
   if(ruta==="capturas")return Response.json([{id:cap,familia_id:f,autor_id:a,texto_original:"QA",estado:"pendiente"}]);
   if(ruta==="integrantes"&&url.searchParams.has("cuenta_id"))return Response.json([{id:a,familia_id:f,cuenta_id:c,consentimiento_ia:true}]);
   if(ruta==="integrantes")return Response.json([{id:a,familia_id:f,cuentas:{nombre:"QA"},telefono:"NO ENVIAR"}]);
   return Response.json([{id:"qa",familia_id:f,nombre:"QA",telefono:"NO ENVIAR"}]);
  });
  const cola=crearColaInterpretacionSupabase({...config,solicitar});
  const r=await cola.reservar();expect(r).not.toBeNull();
  expect(JSON.stringify(r)).not.toContain("NO ENVIAR");expect(r?.contexto.texto).toBe("QA");
  await expect(cola.aplicar({...r!},null,true)).rejects.toThrow("RESERVA_INVALIDA");
  expect((await cola.aplicar(r!,null,true)).estado).toBe("sin_clasificar");
 });
});
