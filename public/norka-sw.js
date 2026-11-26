/* Solo recursos públicos de emergencia. Nunca guardar HTML/RSC autenticado, APIs, cookies ni respuestas con datos. */
const CACHE="norka-captura-offline-v1";
const RECURSOS=["/sin-conexion.html","/sin-conexion.css","/sin-conexion.js","/fuentes/figtree.ttf","/fuentes/bricolage.ttf"];
self.addEventListener("install",evento=>{
  evento.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    // No aceptar una redirección de autenticación como recurso offline.
    const recursos=await Promise.all(RECURSOS.map(async ruta=>{
      const respuesta=await fetch(new Request(ruta,{cache:"reload",credentials:"same-origin",redirect:"error"}));
      if(!respuesta.ok||new URL(respuesta.url).pathname!==ruta)throw new Error("RECURSO_OFFLINE_INVALIDO");
      return {ruta,respuesta};
    }));
    await Promise.all(recursos.map(({ruta,respuesta})=>cache.put(ruta,respuesta)));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate",evento=>{
  evento.waitUntil((async()=>{
    await Promise.all((await caches.keys()).filter(k=>k.startsWith("norka-captura-offline-")&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch",evento=>{
  const r=evento.request,u=new URL(r.url);
  if(r.method!=="GET"||u.origin!==self.location.origin)return;
  if(RECURSOS.includes(u.pathname)&&!u.search){
    evento.respondWith((async()=>{const c=await caches.open(CACHE);return (await c.match(u.pathname))??fetch(r);})());
    return;
  }
  if(r.mode==="navigate"&&/^\/familia\/[0-9a-f-]{36}(?:\/|$)/i.test(u.pathname)){
    evento.respondWith((async()=>{
      try{return await fetch(r);}catch{
        const c=await caches.open(CACHE);return (await c.match("/sin-conexion.html"))??Response.error();
      }
    })());
  }
});
