import {test,expect} from "vitest";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {huellasV77} from "./comparacion-v7-7";
test("congelación previa V7.7: ninguna llamada; huellas exactas",()=>{const f=JSON.parse(readFileSync("docs/inteligencia/CONGELACION-V7.7.json","utf8")) as {huellas:ReturnType<typeof huellasV77>;archivos:Record<string,string>;estado:string};expect(f.estado).toBe("congelacion_previa_desarrollo_sin_autorizacion_de_proveedor");expect(huellasV77()).toEqual(f.huellas);expect(Object.keys(f.archivos)).toHaveLength(22);for(const [p,h] of Object.entries(f.archivos))expect(createHash("sha256").update(readFileSync(p)).digest("hex"),p).toBe(h);console.log("CONGELACION_V77_OK",Object.keys(f.archivos).length);});
