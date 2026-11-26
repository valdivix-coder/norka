// Calendario civil puro. No reloj del entorno, no zona horaria implícita.
export type FechaCivil={anio:number;mes:number;dia:number};
const bisiesto=(a:number)=>a%4===0&&(a%100!==0||a%400===0);
function diasMes(a:number,m:number){return m===2?(bisiesto(a)?29:28):[4,6,9,11].includes(m)?30:31;}
export function leerFechaCivil(iso:string):FechaCivil|null{
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
 if(!m)return null;
 const [anio,mes,dia]=m.slice(1).map(Number);
 return anio>=1&&mes>=1&&mes<=12&&dia>=1&&dia<=diasMes(anio,mes)?{anio,mes,dia}:null;
}
const iso=(f:FechaCivil)=>[String(f.anio).padStart(4,"0"),String(f.mes).padStart(2,"0"),String(f.dia).padStart(2,"0")].join("-");
export function sumarDiasCivil(fecha:string,n:number):string|null{
 const f=leerFechaCivil(fecha);
 if(!f||!Number.isSafeInteger(n)||Math.abs(n)>3660)return null;
 let {anio,mes,dia}=f;
 for(let i=0;i<Math.abs(n);i++){
  if(n>0){if(++dia>diasMes(anio,mes)){dia=1;if(++mes>12){mes=1;anio++;}}}
  else if(--dia<1){if(--mes<1){mes=12;anio--;}dia=diasMes(anio,mes);}
 }
 return anio>=1&&anio<=9999?iso({anio,mes,dia}):null;
}
const meses=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const semana=["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
function diaSemana(f:FechaCivil){const a=f.anio-(f.mes<3?1:0);return (a+Math.floor(a/4)-Math.floor(a/100)+Math.floor(a/400)+[0,3,2,5,0,3,5,1,4,6,2,4][f.mes-1]+f.dia)%7;}
// Recibe SOLAMENTE una expresión temporal aislada, nunca una captura completa.
// Si no hay interpretación inequívoca, devuelve null. El llamador decidirá revisión.
export function resolverExpresionTemporal(fechaLocal:string,expresion:string):string|null{
 const f=leerFechaCivil(fechaLocal);if(!f)return null;
 const s=expresion.normalize("NFD").replace(/\p{M}/gu,"").trim().toLowerCase().replace(/\s+/g," ");
 if(s==="hoy")return fechaLocal;
 if(s==="manana")return sumarDiasCivil(fechaLocal,1);
 if(s==="pasado manana")return sumarDiasCivil(fechaLocal,2);
 if(s==="ayer")return sumarDiasCivil(fechaLocal,-1);
 let m=/^en (\d{1,3}) dias?$/.exec(s);
 if(m)return sumarDiasCivil(fechaLocal,Number(m[1]));
 m=/^(?:el |este |proximo |el proximo )?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)$/.exec(s);
 if(m){const delta=(semana.indexOf(m[1])-diaSemana(f)+7)%7;return sumarDiasCivil(fechaLocal,delta||7);}
 m=/^(?:el )?(\d{1,2}) de ([a-z]+)(?: de (\d{4}))?$/.exec(s);
 if(m){const mes=meses.indexOf(m[2])+1,dia=Number(m[1]);if(!mes)return null;
  let anio=m[3]?Number(m[3]):f.anio;let valor=iso({anio,mes,dia});
  if(!m[3]&&valor<fechaLocal){anio++;valor=iso({anio,mes,dia});}
  return leerFechaCivil(valor)?valor:null;
 }
 return null;
}
