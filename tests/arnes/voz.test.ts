import {describe,it,expect,vi,afterEach} from "vitest";
import {vozWeb,vibracionWeb} from "../../src/data/voz-web";
class ReconocimientoPrueba{
 static ultima:ReconocimientoPrueba;
 lang="";continuous=false;interimResults=false;
 onresult:((e:{results:{0:{transcript:string};isFinal:boolean}[]})=>void)|null=null;
 onend:(()=>void)|null=null;onerror:(()=>void)|null=null;
 constructor(){ReconocimientoPrueba.ultima=this;}
 start(){}
 stop(){this.onend?.();}
 abort(){this.onend?.();}
}
afterEach(()=>vi.unstubAllGlobals());
describe("Puerto de voz",()=>{
 it("usa español de Chile, conserva transcripción y finaliza una sola vez",()=>{
  vi.stubGlobal("window",{webkitSpeechRecognition:ReconocimientoPrueba});
  const texto=vi.fn(),fin=vi.fn(),error=vi.fn();
  expect(vozWeb.disponible()).toBe(true);
  const s=vozWeb.iniciar({texto,fin,error});const r=ReconocimientoPrueba.ultima;
  expect(r.lang).toBe("es-CL");expect(r.interimResults).toBe(true);
  r.onresult?.({results:[{0:{transcript:"comprar pan"},isFinal:true}]});s.terminar();r.onend?.();
  expect(texto).toHaveBeenCalledWith("comprar pan");expect(fin).toHaveBeenCalledExactlyOnceWith("comprar pan");
 });
 it("cancelar no confirma el dictado",()=>{
  vi.stubGlobal("window",{SpeechRecognition:ReconocimientoPrueba});
  const fin=vi.fn(),error=vi.fn();const s=vozWeb.iniciar({texto:vi.fn(),fin,error});
  s.cancelar();expect(fin).not.toHaveBeenCalled();expect(error).not.toHaveBeenCalled();
 });
 it("sin soporte no inicia; vibración opcional",()=>{
  vi.stubGlobal("window",{});vi.stubGlobal("navigator",{});
  expect(vozWeb.disponible()).toBe(false);expect(()=>vozWeb.iniciar({texto:vi.fn(),fin:vi.fn(),error:vi.fn()})).toThrow("VOZ_NO_DISPONIBLE");expect(()=>vibracionWeb.corta()).not.toThrow();
 });
});
