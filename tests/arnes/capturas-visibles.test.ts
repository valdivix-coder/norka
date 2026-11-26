import {describe,it,expect,vi} from "vitest";
import {listarCapturasPendientes,editarResultadoCaptura,revisionCaptura,ErrorEdicionCaptura} from "../../src/data/capturas-supabase";
describe("Acciones de capturas persistidas",()=>{
 it("solo permite gestionar capturas propias pendientes y no expone el autor al cliente",async()=>{
 const base={id:"t",familia_id:"f",titulo:"QA",revision:0,captura_id:"c"};
 const solicitar=vi.fn(async()=>Response.json([
 {...base,capturas:{autor_id:"yo",estado:"pendiente"}},
 {...base,id:"t2",capturas:{autor_id:"otro",estado:"pendiente"}},
 {...base,id:"t3",capturas:{autor_id:"yo",estado:"interpretada"}}]));
 const filas=await listarCapturasPendientes({url:"https://qa.example",claveServicio:"qa",familiaId:"f",integranteId:"yo",solicitar});
 expect(filas.map(f=>f.editable)).toEqual([true,false,false]);
 expect(filas.every(f=>!("capturas" in f))).toBe(true);
 });
});

describe("Edición de capturas contra REST",()=>{
 const config={url:"https://qa.example",claveServicio:"qa",familiaId:"f",cuentaId:"c"};
 const dato={capturaId:"cap",tareaId:"t",revision:2,titulo:"Nuevo",descartar:false};
 it("normaliza bigint serializado como texto sin perder control de concurrencia",async()=>{
  expect(revisionCaptura("2")).toBe(2);expect(()=>revisionCaptura("x")).toThrow();
  const resultado={familia_id:"f",id:"t",captura_id:"cap",revision:"3",titulo:"Nuevo",estado:"pendiente"};
  const solicitar=vi.fn(async()=>Response.json(resultado));
  expect((await editarResultadoCaptura({...config,solicitar},dato)).revision).toBe(3);
 });
 it("distingue conflicto sin reintentar ni sobrescribir cambios",async()=>{
  const solicitar=vi.fn(async()=>Response.json({message:"CONFLICTO_REVISION"},{status:400}));
  await expect(editarResultadoCaptura({...config,solicitar},dato)).rejects.toMatchObject({motivo:"conflicto"});
  expect(solicitar).toHaveBeenCalledTimes(1);
 });
 it("rechaza respuesta con revisión o estado inesperado",async()=>{
  const solicitar=vi.fn(async()=>Response.json({familia_id:"f",id:"t",captura_id:"cap",revision:3,titulo:"Nuevo",estado:"descartada"}));
  await expect(editarResultadoCaptura({...config,solicitar},dato)).rejects.toBeInstanceOf(ErrorEdicionCaptura);
 });
});
