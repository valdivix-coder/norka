/* Pantalla pública, sin nombres, sesión ni datos del servidor en caché.
   El contexto identifica exclusivamente el destino de la cola, no autentica.
   La cola IndexedDB usa exactamente las mismas claves que la app. */
(function(){
  "use strict";
  const clave="norka-contexto-captura-v1";
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const $=id=>document.getElementById(id);
  let contexto=null,ocupada=false;
  try{
    let c=null;
    // Si la pestaña se reconstruye, recuperar el destino persistente.
    // Un destino explícito distinto no puede utilizar el de otra familia.
    try{c=JSON.parse(localStorage.getItem(clave)||"null");}catch{/* usar alternativa */}
    if(!c)try{c=JSON.parse(sessionStorage.getItem(clave)||"null");}catch{/* borrador sin destino */}
    const familia=location.pathname.split("/")[2];
    const entrada=["/","/cuenta","/cuenta/","/entrar","/entrar/"].includes(location.pathname);
    if(c&&uuid.test(c.cuentaId)&&uuid.test(c.familiaId)&&(familia===c.familiaId||entrada)&&Date.now()<c.hasta)contexto=c;
  }catch{/* Sin contexto: no guardar para una cuenta desconocida. */}
  function abrir(){
    return new Promise((resolve,reject)=>{
      const r=indexedDB.open("norka-capturas",1);
      r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains("pendientes"))r.result.createObjectStore("pendientes",{keyPath:"llave"});};
      r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error("bloqueado"));
    });
  }
  async function operar(modo,hacer){
    const db=await abrir();
    try{return await new Promise((resolve,reject)=>{
      const tx=db.transaction("pendientes",modo),r=hacer(tx.objectStore("pendientes"));
      tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
    });}finally{db.close();}
  }
  const sinDestino={cuentaId:"sin-contexto",familiaId:"sin-contexto"};
  async function contar(){
    const destino=contexto??sinDestino;
    const prefijo=destino.cuentaId+":"+destino.familiaId+":";
    const n=await operar("readonly",s=>s.count(IDBKeyRange.bound(prefijo,prefijo+"\uffff")));
    $("pendientes").textContent=n===1?"1 captura por enviar":n+" capturas por enviar";
  }
  function volver(){
    if(ocupada||$("texto").value.trim()){
      $("estado").textContent="Guarda el texto antes de volver.";return;
    }
    if(!navigator.onLine){$("estado").textContent="Todavía no hay conexión.";return;}
    if(contexto&&location.pathname.split("/")[2]!==contexto.familiaId)location.replace("/familia/"+contexto.familiaId+"/hoy");else location.reload();
  }
  $("volver").addEventListener("click",volver);
  window.addEventListener("online",()=>{$("estado").textContent="Volvió la conexión. Vuelve a tu familia para enviar las capturas.";if(!ocupada&&!$("texto").value.trim())volver();});
  if(!contexto){
    $("ayuda").textContent="Puedes capturar ahora. Tus borradores quedan en este teléfono hasta que confirmes su destino al volver a entrar.";
  }
  $("captura").hidden=false;
  contar().catch(()=>{$("estado").textContent="No se pudo abrir el almacenamiento local.";});
  $("form").addEventListener("submit",async e=>{
    e.preventDefault();
    const texto=$("texto").value;
    if(ocupada||!texto.trim())return;
    if(contexto&&Date.now()>=contexto.hasta)contexto=null;
    const destino=contexto??sinDestino;
    ocupada=true;$("guardar").disabled=true;
    try{
      const id=crypto.randomUUID(),p={id,texto,origen:"texto",cuentaId:destino.cuentaId,familiaId:destino.familiaId};
      await operar("readwrite",s=>s.put({...p,llave:[p.cuentaId,p.familiaId,p.id].join(":")}));
      $("texto").value="";$("estado").textContent=contexto?"Guardada en este teléfono. Se enviará cuando sea posible.":"Borrador guardado en este teléfono. Confirma su destino al entrar.";
      await contar();
      if(navigator.onLine){ocupada=false;volver();}
    }catch{$("estado").textContent="No se pudo guardar. Conservamos el texto: vuelve a intentarlo.";}
    finally{ocupada=false;$("guardar").disabled=false;}
  });
})();
