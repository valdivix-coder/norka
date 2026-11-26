import type { PuertoVoz, PuertoVibracion } from "@/core/ports/voz";
type Resultado={0:{transcript:string};isFinal:boolean};
type Reconocimiento={
  lang:string;continuous:boolean;interimResults:boolean;
  onresult:((e:{results:ArrayLike<Resultado>})=>void)|null;
  onend:(()=>void)|null;onerror:(()=>void)|null;
  start():void;stop():void;abort():void;
};
function constructorVoz(){
  if(typeof window==="undefined")return undefined;
  const w=window as unknown as {SpeechRecognition?:new()=>Reconocimiento;webkitSpeechRecognition?:new()=>Reconocimiento};
  return w.SpeechRecognition??w.webkitSpeechRecognition;
}
export const vozWeb:PuertoVoz={
  disponible:()=>!!constructorVoz(),
  iniciar(eventos){
    const C=constructorVoz();if(!C)throw new Error("VOZ_NO_DISPONIBLE");
    const r=new C();r.lang="es-CL";r.continuous=true;r.interimResults=true;
    let texto="",cerrada=false;
    r.onresult=e=>{if(cerrada)return;texto=Array.from(e.results).map(x=>x[0].transcript).join(" ").trim();eventos.texto(texto);};
    r.onend=()=>{if(!cerrada){cerrada=true;eventos.fin(texto);}};
    r.onerror=()=>{if(!cerrada){cerrada=true;eventos.error(texto);}};
    r.start();
    return {terminar(){if(!cerrada)try{r.stop();}catch{cerrada=true;eventos.error(texto);}},cancelar(){if(!cerrada){cerrada=true;try{r.abort();}catch{/* ya terminó */}}}};
  }
};
export const vibracionWeb:PuertoVibracion={corta(){try{navigator.vibrate?.(10);}catch{/* opcional */}}};
