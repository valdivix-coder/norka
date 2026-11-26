import {describe,it,expect,vi} from "vitest";
import {crearGeminiSintetico,ErrorGemini} from "../../src/data/gemini-sintetico";
const corpus={fecha:"2026-11-26T12:00:00-03:00",zona_horaria:"America/Santiago",personas_a_cargo:["El hogar"],integrantes:["QA"],autor:"QA",ambitos:["Compras"],casos:[{id:1,texto:"Comprar pan",esperado:"NO ENVIAR"}]};
const resultado={elementos:[{tipo:"tarea",titulo:"Comprar pan",persona_a_cargo:"El hogar",ambito:"Compras",plazo_fecha:null,plazo_hora:null,recurrencia:null,dirigida_a:null,confianza:"alta"}]};
describe("Adaptador Gemini sintético",()=>{
 it("usa solo el caso conocido y campos permitidos, valida respuesta",async()=>{
  const solicitar=vi.fn(async(_url:RequestInfo|URL,init?:RequestInit)=>{
   const body=String(init?.body);expect(body).toContain("Comprar pan");expect(body).not.toContain("NO ENVIAR");expect(body).not.toContain("clave-qa");
   expect((init?.headers as Record<string,string>)["x-goog-api-key"]).toBe("clave-qa");
   return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(resultado)}]}}]});
  });
  const ia=crearGeminiSintetico({clave:"clave-qa",modelo:"gemini-3.8-flash",corpus,solicitar});
  expect(await ia.evaluar(1)).toEqual(resultado);
  await expect(ia.evaluar(2)).rejects.toThrow("CASO_FUERA_DEL_CORPUS");
  expect(solicitar).toHaveBeenCalledTimes(1);
 });
 it("rechaza respuestas inválidas y devuelve estado sin cuerpo de error",async()=>{
  const ia=crearGeminiSintetico({clave:"qa",modelo:"gemini-3.8-flash",corpus,solicitar:vi.fn(async()=>new Response("privado",{status:429}))});
  await expect(ia.evaluar(1)).rejects.toBeInstanceOf(ErrorGemini);
  const mal=crearGeminiSintetico({clave:"qa",modelo:"gemini-3.8-flash",corpus,solicitar:vi.fn(async()=>Response.json({candidates:[{content:{parts:[{text:"{}"}]}}]}))});
  await expect(mal.evaluar(1)).rejects.toThrow();
 });
});
