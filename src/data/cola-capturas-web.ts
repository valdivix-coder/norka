import type { CapturaPendiente } from "../core/domain/captura";
import type { ColaCapturas } from "../core/ports/captura";
const llave=(p:CapturaPendiente)=>[p.cuentaId,p.familiaId,p.id].join(":");
async function abrir():Promise<IDBDatabase> {
  return new Promise((resolve,reject)=>{
    const r=indexedDB.open("norka-capturas",1);
    r.onupgradeneeded=()=>r.result.createObjectStore("pendientes",{keyPath:"llave"});
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
    r.onblocked=()=>reject(new Error("ALMACEN_BLOQUEADO"));
  });
}
async function operacion<T>(modo:IDBTransactionMode, hacer:(s:IDBObjectStore)=>IDBRequest<T>):Promise<T>{
  const db=await abrir();
  try{return await new Promise<T>((resolve,reject)=>{
    const tx=db.transaction("pendientes",modo);const r=hacer(tx.objectStore("pendientes"));
    tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });}finally{db.close();}
}
export const colaCapturasWeb:ColaCapturas={
  async guardar(p){await operacion("readwrite",s=>s.put({...p,llave:llave(p)}));},
  async listar(cuentaId,familiaId){
    const prefijo=cuentaId+":"+familiaId+":";
    const r=await operacion("readonly",s=>s.getAll(IDBKeyRange.bound(prefijo,prefijo+"\uffff"))) as (CapturaPendiente & {llave:string})[];
    return r.filter(p=>p.cuentaId===cuentaId&&p.familiaId===familiaId).map(({id,texto,origen,cuentaId,familiaId})=>({id,texto,origen,cuentaId,familiaId}));
  },
  async quitar(p){await operacion("readwrite",s=>s.delete(llave(p)));},
};
