import {describe,it,expect,vi} from "vitest";
import {listarCapturasPendientes} from "../../src/data/capturas-supabase";
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
