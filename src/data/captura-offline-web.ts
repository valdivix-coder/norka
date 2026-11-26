// Adaptador de navegador. No almacenar tokens ni contenido familiar en Cache Storage.
const CLAVE="norka-contexto-captura-v1";
export async function prepararCapturaSinConexion(cuentaId:string,familiaId:string):Promise<void>{
 if(typeof window==="undefined")return;
 // La sesión offline no autentica ni permite leer datos privados. Solo identifica la cola local.
 try{sessionStorage.setItem(CLAVE,JSON.stringify({cuentaId,familiaId,hasta:Date.now()+24*60*60*1000}));}catch{return;}
 if(!("serviceWorker" in navigator))return;
 try{await navigator.serviceWorker.register("/norka-sw.js",{scope:"/",updateViaCache:"none"});}catch{/* La captura en la página abierta conserva la cola existente. */}
}
export function olvidarContextoCaptura():void{
 try{sessionStorage.removeItem(CLAVE);}catch{/* almacenamiento no disponible */}
}
