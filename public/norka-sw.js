/* Solo recursos públicos de emergencia. Nunca cachear respuestas autenticadas. */
const CACHE="norka-captura-offline-v3";
const RECURSOS=["/sin-conexion.html","/sin-conexion.css","/sin-conexion.js"];
const FUENTES=["/fuentes/figtree.ttf","/fuentes/bricolage.ttf"];
const PUBLICOS=[...RECURSOS,...FUENTES];
const url=r=>new URL(r,self.location.origin).href;
async function recurso(cache,ruta){
  const respuesta=await fetch(url(ruta),{cache:"reload",credentials:"same-origin",redirect:"error"});
  if(!respuesta.ok||new URL(respuesta.url).pathname!==ruta)throw new Error("RECURSO_OFFLINE_INVALIDO");
  await cache.put(url(ruta),respuesta);
}
self.addEventListener("install",evento=>{
  evento.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.all(RECURSOS.map(r=>recurso(cache,r)));
    // Una fuente no disponible no debe impedir la instalación de la captura.
    await Promise.allSettled(FUENTES.map(r=>recurso(cache,r)));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate",evento=>{
  evento.waitUntil((async()=>{
    await self.clients.claim();
    await Promise.all((await caches.keys()).filter(k=>k.startsWith("norka-captura-offline-")&&k!==CACHE).map(k=>caches.delete(k)));
  })());
});
function esPagina(p){return p==="/"||p==="/cuenta"||p==="/cuenta/"||p==="/entrar"||p==="/entrar/"||/^\/familia\/[0-9a-f-]{36}(?:\/|$)/i.test(p);}
async function emergencia(){
  const c=await caches.open(CACHE),r=await c.match(url("/sin-conexion.html"));
  // Una respuesta nueva no cambia la URL de navegación al recurso precacheado.
  if(r)return new Response(await r.text(),{status:200,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
  return new Response("<!doctype html><html lang='es-CL'><meta charset='utf-8'><title>Sin conexión</title><h1>Sin conexión</h1><p>Vuelve a conectarte para preparar la captura local.</p></html>",{status:503,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
}
self.addEventListener("fetch",evento=>{
  const r=evento.request,u=new URL(r.url);
  if(r.method!=="GET"||u.origin!==self.location.origin)return;
  if(PUBLICOS.includes(u.pathname)&&!u.search){
    evento.respondWith((async()=>{const c=await caches.open(CACHE);return (await c.match(url(u.pathname)))??fetch(r);})());
    return;
  }
  if((r.mode==="navigate"||r.destination==="document")&&esPagina(u.pathname)){
    evento.respondWith((async()=>{
      if(self.navigator.onLine===false)return emergencia();
      const abortar=new AbortController(),reloj=setTimeout(()=>abortar.abort(),4500);
      try{
        const respuesta=await fetch(r,{cache:"no-store",signal:abortar.signal});
        if(respuesta.status>=500)return emergencia();
        return respuesta;
      }catch{return emergencia();}
      finally{clearTimeout(reloj);}
    })());
  }
});
self.addEventListener("message",evento=>{
 if(evento.data?.tipo!=="COMPROBAR_CAPTURA_OFFLINE"||!evento.ports[0])return;
 evento.waitUntil((async()=>{
   const c=await caches.open(CACHE);
   const existe=await Promise.all(RECURSOS.map(r=>c.match(url(r))));
   evento.ports[0].postMessage({version:CACHE,lista:existe.every(Boolean)});
 })());
});
