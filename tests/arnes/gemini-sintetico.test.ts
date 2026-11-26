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

describe("Respaldo de modelos gratuitos",()=>{
 it("Hydrogen saturado pasa a Flash y luego a Lite; no repite modelo agotado",async()=>{
  const llamadas:string[]=[];
  const solicitar=vi.fn(async(u:RequestInfo|URL)=>{
   const url=String(u);llamadas.push(url);
   if(url.includes("gemini-4-hydrogen"))return new Response("",{status:429});
   if(url.includes("gemini-3.8-flash"))return new Response("",{status:503});
   return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(resultado)}]}}]});
  });
  const ia=crearGeminiSintetico({clave:"qa",modelo:"gemini-4-hydrogen",respaldos:["gemini-3.8-flash","gemini-3.5-flash-lite"],corpus,solicitar});
  expect(await ia.evaluar(1)).toEqual(resultado);expect(ia.modeloUsado()).toBe("gemini-3.5-flash-lite");
  expect(llamadas).toHaveLength(3);
  await ia.evaluar(1);expect(llamadas.filter(x=>x.includes("gemini-4-hydrogen"))).toHaveLength(1);
 });
 it("no usa respaldos ante un error de credencial y bloquea modelos no permitidos",async()=>{
  const solicitar=vi.fn(async()=>new Response("",{status:403}));
  const ia=crearGeminiSintetico({clave:"qa",modelo:"gemini-4-hydrogen",respaldos:["gemini-3.8-flash"],corpus,solicitar});
  await expect(ia.evaluar(1)).rejects.toBeInstanceOf(ErrorGemini);expect(solicitar).toHaveBeenCalledTimes(1);
  expect(()=>crearGeminiSintetico({clave:"qa",modelo:"gemini-4-argon",corpus,solicitar})).toThrow();
 });
});

describe("Gemma 4 como último respaldo",()=>{
 it("rota en orden y adapta configuración y JSON de Gemma sin relajar Zod",async()=>{
  const llamadas:string[]=[];
  const solicitar=vi.fn(async(u:RequestInfo|URL,init?:RequestInit)=>{
   const modelo=String(u).split("/").at(-1)?.split(":")[0]??"";
   llamadas.push(modelo);
   if(modelo!=="gemma-4-26b-a4b-it")return new Response("",{status:429});
   const body=JSON.parse(String(init?.body));
   expect(body.generationConfig.responseMimeType).toBeUndefined();
   expect(body.generationConfig.thinkingConfig.thinkingLevel).toBe("minimal");
   return Response.json({candidates:[{content:{parts:[{thought:true,text:"razonamiento"},{text:"```json\n"+JSON.stringify(resultado)+"\n```"}]}}]});
  });
  const ia=crearGeminiSintetico({clave:"qa",modelo:"gemini-4-hydrogen",respaldos:["gemini-3.8-flash","gemini-3.5-flash-lite","gemma-4-26b-a4b-it"],corpus,solicitar});
  expect(await ia.evaluar(1)).toEqual(resultado);
  expect(ia.modeloUsado()).toBe("gemma-4-26b-a4b-it");
  expect(llamadas).toEqual(["gemini-4-hydrogen","gemini-3.8-flash","gemini-3.5-flash-lite","gemma-4-26b-a4b-it"]);
 });
 it("Gemma no admite texto arbitrario ni JSON fuera del contrato",async()=>{
  for(const texto of ["explicación "+JSON.stringify(resultado),"```json\n{}\n```"]){
   const ia=crearGeminiSintetico({clave:"qa",modelo:"gemma-4-26b-a4b-it",corpus,solicitar:vi.fn(async()=>Response.json({candidates:[{content:{parts:[{text:texto}]}}]}))});
   await expect(ia.evaluar(1)).rejects.toThrow();expect(ia.modeloUsado()).toBeNull();
  }
 });
});

it("clasifica errores sin registrar cuerpos o credenciales",async()=>{
 const intentos:unknown[]=[];const ia=crearGeminiSintetico({clave:"qa",modelo:"gemini-4-hydrogen",corpus,observar:i=>intentos.push(i),solicitar:vi.fn(async()=>Response.json({candidates:[{content:{parts:[{text:"{}"}]}}]}))});
 await expect(ia.evaluar(1)).rejects.toThrow();expect(intentos).toEqual([expect.objectContaining({modelo:"gemini-4-hydrogen",resultado:"fallida",motivo:"contrato_zod"})]);
});

it("suspende un respaldo que falla dos veces consecutivas y conserva la prioridad de los demás",async()=>{
 const llamadas:string[]=[];const solicitar=vi.fn(async(u:RequestInfo|URL)=>{const modelo=String(u).split("/").at(-1)?.split(":")[0]??"";llamadas.push(modelo);if(modelo==="gemini-4-hydrogen")return new Response("",{status:503});return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(resultado)}]}}]});});
 const ia=crearGeminiSintetico({clave:"qa",modelo:"gemini-4-hydrogen",respaldos:["gemini-3.8-flash"],corpus,solicitar});
 for(let i=0;i<3;i++)await ia.evaluar(1);
 expect(llamadas).toEqual(["gemini-4-hydrogen","gemini-3.8-flash","gemini-4-hydrogen","gemini-3.8-flash","gemini-3.8-flash"]);
});

it("no permite nombres ajenos al catálogo de personas a cargo",async()=>{
 const falso={elementos:[{...resultado.elementos[0],persona_a_cargo:"QA",ambito:"Inventado"}]};
 const ia=crearGeminiSintetico({clave:"qa",modelo:"gemini-3.8-flash",corpus,solicitar:vi.fn(async()=>Response.json({candidates:[{content:{parts:[{text:JSON.stringify(falso)}]}}]}))});
 const salida=await ia.evaluar(1);expect(salida.elementos[0]).toMatchObject({persona_a_cargo:null,ambito:null,confianza:"baja"});
});
