// Adaptador de navegador: comprobar el control efectivo y los tres recursos de emergencia.
const CLAVE="norka-contexto-captura-v1";
export type EstadoCapturaOffline="preparando"|"lista"|"no_disponible";
export async function prepararCapturaSinConexion(cuentaId:string,familiaId:string):Promise<EstadoCapturaOffline>{
 if(typeof window==="undefined")return "no_disponible";
 try{sessionStorage.setItem(CLAVE,JSON.stringify({cuentaId,familiaId,hasta:Date.now()+24*60*60*1000}));}catch{return "no_disponible";}
 if(!("serviceWorker" in navigator))return "no_disponible";
 try{
   const reg=await navigator.serviceWorker.register("/norka-sw.js",{scope:"/",updateViaCache:"none"});
   void reg.update().catch(()=>{});
   const sw=navigator.serviceWorker;
   const limite=Date.now()+12000;
   while(Date.now()<limite){
     const controlador=sw.controller;
     if(controlador){
       const lista=await new Promise<boolean>(resolver=>{
         const canal=new MessageChannel();
         const cerrar=(v:boolean)=>{clearTimeout(reloj);canal.port1.close();resolver(v);};
         const reloj=setTimeout(()=>cerrar(false),800);
         canal.port1.onmessage=e=>cerrar(e.data?.version==="norka-captura-offline-v2"&&e.data?.lista===true);
         controlador.postMessage({tipo:"COMPROBAR_CAPTURA_OFFLINE"},[canal.port2]);
       });
       if(lista)return "lista";
     }
     await new Promise(r=>setTimeout(r,250));
   }
 }catch{/* mostrar estado, no prometer disponibilidad */}
 return "no_disponible";
}
export function olvidarContextoCaptura():void{
 try{sessionStorage.removeItem(CLAVE);}catch{/* almacenamiento no disponible */}
}
export function escucharSalidaCaptura():()=>void{
 const salir=(e:Event)=>{
  const f=e.target;
  if(f instanceof HTMLFormElement&&new URL(f.action,location.origin).origin===location.origin&&new URL(f.action,location.origin).pathname==="/api/salir")olvidarContextoCaptura();
 };
 document.addEventListener("submit",salir,true);
 return ()=>document.removeEventListener("submit",salir,true);
}
