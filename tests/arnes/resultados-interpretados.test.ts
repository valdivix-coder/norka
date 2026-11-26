import {describe,it,expect,vi} from "vitest";
import {gestionarResultadosInterpretados} from "../../src/data/resultados-interpretados-supabase";
import {cambiosResultados,type CambiosResultados} from "../../src/core/contracts/resultados-interpretados";
const id="00000000-0000-4000-8000-000000000001",cap="00000000-0000-4000-8000-000000000002";
const config={url:"https://qa.example",claveServicio:"qa",familiaId:"f",cuentaId:"c"};
const entrada:CambiosResultados={capturaId:cap,deshacer:false,cambios:[{id,tipo:"tarea",revision:1,revision_propuesta:null,titulo:"QA"}]};
describe("Resultados interpretados: contrato y adaptador",()=>{
 it("rechaza duplicados, título vacío y revisiones no válidas antes de enviar",()=>{
  expect(cambiosResultados.safeParse({...entrada,cambios:[...entrada.cambios,...entrada.cambios]}).success).toBe(false);
  expect(cambiosResultados.safeParse({...entrada,cambios:[{...entrada.cambios[0],titulo:" "}]}).success).toBe(false);
  expect(cambiosResultados.safeParse({...entrada,cambios:[{...entrada.cambios[0],revision:-1}]}).success).toBe(false);
 });
 it("aplica solamente IDs, familia y revisiones de la operación solicitada",async()=>{
  const solicitar=vi.fn(async(_u:RequestInfo|URL,init?:RequestInit)=>{
   expect(JSON.parse(String(init?.body))).toMatchObject({p_familia:"f",p_cuenta:"c",p_captura:cap,p_cambios:entrada.cambios,p_deshacer:false});
   return Response.json([{id,tipo:"tarea",revision:2}]);
  });
  expect(await gestionarResultadosInterpretados({...config,solicitar},entrada)).toEqual([{id,tipo:"tarea",revision:2}]);
 });
 it("no reintenta conflictos ni acepta respuesta de otro objeto",async()=>{
  const solicitar=vi.fn(async()=>Response.json({message:"CONFLICTO_REVISION"},{status:400}));
  await expect(gestionarResultadosInterpretados({...config,solicitar},entrada)).rejects.toMatchObject({motivo:"conflicto"});
  expect(solicitar).toHaveBeenCalledTimes(1);
  await expect(gestionarResultadosInterpretados({...config,solicitar:vi.fn(async()=>Response.json([{id:cap,tipo:"tarea",revision:2}]))},entrada)).rejects.toMatchObject({motivo:"respuesta"});
 });
});
