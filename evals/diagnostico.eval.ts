import {readFileSync,writeFileSync} from "node:fs";
import {test,expect} from "vitest";
import {crearGeminiSintetico,MODELOS_GEMINI,type ContextoSintetico,type IntentoGemini} from "../src/data/gemini-sintetico";
const corpus=JSON.parse(readFileSync("evals/captura-cl.json","utf8")) as ContextoSintetico;
test("Diagnóstico aislado: una frase ficticia por modelo",async()=>{
 const clave=process.env.GEMINI_API_KEY;
 if(process.env.GEMINI_EVAL_ACTIVA!=="1"||!clave)throw new Error("Falta secreto o activación");
 const resultados:{modelo:string;intentos:IntentoGemini[];valida:boolean}[]=[];
 // Se comprueba acceso al modelo sin enviar contenido familiar.
 for(const modelo of MODELOS_GEMINI){
   const intentos:IntentoGemini[]=[];
   const ia=crearGeminiSintetico({clave,modelo,corpus,observar:i=>intentos.push(i)});
   let valida=false;
   try{await ia.evaluar(2);valida=true;}catch{/* detalle seguro en observar */}
   resultados.push({modelo,intentos,valida});
   console.log(JSON.stringify(resultados.at(-1)));
 }
 writeFileSync("evals/diagnostico.json",JSON.stringify(resultados,null,2));
 expect(resultados.some(x=>x.valida)).toBe(true);
},150000);
