import {leerFechaCivil,sumarDiasCivil} from "./calendario-captura";
// Explicit input and explicit offset port; no clock, Date, or hardcoded future DST rules in core.
export type PuertoZonaCaptura=(utc:{fecha:string;hora:string;segundo:number})=>number|null;
export function fechaCaptura(iso:string,desfaseSantiago:PuertoZonaCaptura){
 const m=/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(iso);
 if(!m||!leerFechaCivil(m[1]))return null;
 const h=Number(m[2]),min=Number(m[3]),segundo=Number(m[4]),z=m[5],zh=z==="Z"?0:Number(z.slice(1,3)),zm=z==="Z"?0:Number(z.slice(4));
 if(h>23||min>59||segundo>59||zh>14||zm>59||zh===14&&zm!==0||z==="-00:00")return null;
 const offset=(z.startsWith("-")?-1:1)*(zh*60+zm);
 const civil=(fecha:string,minutos:number)=>{const dia=Math.floor(minutos/1440),t=((minutos%1440)+1440)%1440,f=sumarDiasCivil(fecha,dia);return f?{fecha:f,hora:String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0")}:null;};
 const utc=civil(m[1],h*60+min-offset);if(!utc)return null;
 const d=desfaseSantiago({...utc,segundo});
 if(d===null||!Number.isSafeInteger(d)||d< -840||d>840)return null;
 const local=civil(utc.fecha,Number(utc.hora.slice(0,2))*60+Number(utc.hora.slice(3))+d);
 return local?{...local,zona:"America/Santiago" as const,desfaseMinutos:d}:null;
}
