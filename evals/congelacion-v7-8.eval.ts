import {test,expect} from "vitest";
import {readFileSync} from "node:fs";
import {huellas78} from "./huellas-v7-8.eval";
test("instantánea técnica V7.8 coincide con las huellas de CI",()=>{const f=JSON.parse(readFileSync("docs/inteligencia/CONGELACION-V7.8.json","utf8"));expect(f.estado).toBe("instantanea_previa_desarrollo_sin_autorizacion_proveedor");expect(huellas78()).toEqual(f.huellas);console.log("CONGELACION_V78_OK");});
