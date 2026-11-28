import type {PuertoZonaCaptura} from "../core/usecases/fecha-captura";
// IANA runtime timezone data, no current-clock dependency. Not wired into production.
export const desfaseSantiagoIANA:PuertoZonaCaptura=({fecha,hora,segundo})=>{
 try{
  const valor=new Date(fecha+"T"+hora+":"+String(segundo).padStart(2,"0")+"Z");
  if(!Number.isFinite(valor.getTime()))return null;
  const f=new Intl.DateTimeFormat("en-US",{timeZone:"America/Santiago",timeZoneName:"longOffset"});
  const z=f.formatToParts(valor).find(p=>p.type==="timeZoneName")?.value;
  if(z==="GMT")return 0;
  const m=/^GMT([+-])(\d{2}):(\d{2})$/.exec(z??"");
  return m?(m[1]==="-"?-1:1)*(Number(m[2])*60+Number(m[3])):null;
 }catch{return null;}
};
