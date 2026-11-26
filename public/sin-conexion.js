/* Pantalla pública, sin nombres, sesión ni datos del servidor en caché.
   El contexto solo existe en la pestaña previamente autenticada.
   La cola IndexedDB usa exactamente las mismas claves que la app. */
(function(){
  "use strict";
  const clave="norka-contexto-captura-v1";
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const $=id=>document.getElementById(id);
  let contexto=null,ocupada=false;
  try{
    const c=JSON.parse(sessionStorage.getItem(clave)||"null");
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
  async function contar(){
    if(!contexto)return;
    const prefijo=contexto.cuentaId+":"+contexto.familiaId+":";
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
    $("ayuda").textContent="Conéctate a internet para entrar con tu cuenta. No se muestran datos familiares sin verificar la sesión.";
    return;
  }
  $("captura").hidden=false;
  contar().catch(()=>{$("estado").textContent="No se pudo abrir el almacenamiento local.";});
  $("form").addEventListener("submit",async e=>{
    e.preventDefault();
    const texto=$("texto").value;
    if(ocupada||!texto.trim())return;
    if(Date.now()>=contexto.hasta){$("estado").textContent="Vuelve a entrar con tu cuenta antes de guardar.";return;}
    ocupada=true;$("guardar").disabled=true;
    try{
      const id=crypto.randomUUID(),p={id,texto,origen:"texto",cuentaId:contexto.cuentaId,familiaId:contexto.familiaId};
      await operar("readwrite",s=>s.put({...p,llave:[p.cuentaId,p.familiaId,p.id].join(":")}));
      $("texto").value="";$("estado").textContent="Guardada en este teléfono. Se enviará cuando sea posible.";
      await contar();
      if(navigator.onLine){ocupada=false;volver();}
    }catch{$("estado").textContent="No se pudo guardar. Conservamos el texto: vuelve a intentarlo.";}
    finally{ocupada=false;$("guardar").disabled=false;}
  });
})();
