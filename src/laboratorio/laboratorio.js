"use strict";
const datos=JSON.parse(document.getElementById("datos").textContent),$=id=>document.getElementById(id);
const nod=(tag,txt,cls)=>{const x=document.createElement(tag);if(txt!==undefined)x.textContent=String(txt);if(cls)x.className=cls;return x;};
const fill=(s,op,preferred)=>{s.replaceChildren(...op.map(([v,t])=>{const x=nod("option",t);x.value=v;return x;}));if(op.some(([v])=>v===preferred))s.value=preferred;};
const fmt=v=>v===null||v===undefined||v===""?"Sin asignar":typeof v==="object"?v.tipo?([v.tipo,"cada "+v.cada,(v.dias||[]).join(", ")].filter(Boolean).join(" · ")):JSON.stringify(v):String(v);
const campos=[["tipo","Tipo"],["persona_a_cargo","Beneficiario"],["ambito","Ámbito"],["plazo_fecha","Fecha"],["plazo_hora","Hora"],["recurrencia","Recurrencia"],["dirigida_a","Destinatario"],["confianza","Confianza"]];
let copia=[],historial=[],clave="";
function fixture(){return datos.find(x=>x.fuente.run===$("corpus").value)}
function caso(){return fixture().casos.find(x=>String(x.id)===$("caso").value)}
function grupos(){const g=[...new Set(fixture().casos.flatMap(c=>c.grupos||[]))];fill($("grupo"),[["todos","Todos"],...g.map(x=>[x,x.replaceAll("_"," ")])],"todos");casos();}
function casos(){let lista=fixture().casos.filter(c=>$("grupo").value==="todos"||(c.grupos||[]).includes($("grupo").value));fill($("caso"),lista.map(c=>[String(c.id),c.id+" · "+c.texto.slice(0,100)]),$("caso").value);versiones();}
function versiones(){const c=caso(),v=Object.keys(c.brazos);fill($("a"),v.map(x=>[x,"V"+x]),"6.0");fill($("b"),v.map(x=>[x,"V"+x]),v.at(-1));render();}
function elementos(b,layer){return b?.estado==="valida"?(b[layer]?.elementos||[]):[]}
function card(v,other,layer){const f=fixture(),c=caso(),b=c.brazos[v],o=c.brazos[other],s=f.resumen[v];const box=nod("article",undefined,"version");box.append(nod("h3","V"+v));if(!b||b.estado!=="valida"){box.append(nod("p","No disponible: "+(b?.causa||b?.estado||"no ejecutada"),"aviso-pendiente"));return box;}if(s){const n=layer==="bruta"?s.estrictaBruta:s.estrictaNormalizada;box.append(nod("p",layer==="aplicable"?"Precisión de propuesta: no medida":n+"/"+s.total+" · "+(100*n/s.total).toFixed(1).replace(".",",")+" %","metricas"),nod("p","Cobertura: "+s.validas+"/"+s.total+" · "+(b.ms===null?"latencia no disponible":b.ms+" ms"),"suave"))}const es=elementos(b,layer),otros=elementos(o,layer);const cov=b.cobertura?.[layer];if(cov){box.append(nod("p",cov.entregadas+" de "+cov.esperadas+" acciones de referencia · "+(cov.cantidadCompleta?"Cantidad completa":"Cantidad por revisar"),cov.cantidadCompleta?"suave":"aviso-pendiente"));if(!cov.cantidadCompleta)box.append(nod("p",cov.deficit?"Faltan "+cov.deficit+" acciones según el conjunto sintético.":"Sobran "+cov.excedente+" acciones según el conjunto sintético.","aviso-pendiente"));}if(!es.length)box.append(nod("p","Esta capa no tiene elementos disponibles.","aviso-pendiente"));es.forEach((e,i)=>{const a=nod("div",undefined,"accion");a.append(nod("h4",e.titulo));for(const [k,t] of campos){const valor=e[k],otra=otros[i]?.[k];const fila=nod("div",undefined,"fila"+(JSON.stringify(valor)!==JSON.stringify(otra)?" cambio":""));fila.append(nod("span",t),nod("span",fmt(valor)));a.append(fila)}if(layer==="aplicable"&&b.resultado?.elementos[i]?.plazo_hora&&!e.plazo_hora)a.append(nod("p","Hora sugerida: "+b.resultado.elementos[i].plazo_hora+"; el contrato actual no la conserva sin fecha.","aviso-pendiente"));const ajustes=(b.ajustes||[]).filter(x=>x.indice===i);if(ajustes.length&&layer!=="bruta")a.append(nod("p","Ajustes: "+ajustes.map(x=>x.campo+" · "+x.motivo.replaceAll("_"," ")).join("; "),"ajustes"));box.append(a);});return box;}
function render(){const f=fixture(),c=caso(),a=$("a").value,b=$("b").value,l=$("capa").value;$("contexto").textContent="Fecha de referencia: "+f.contexto.fecha+" · "+f.contexto.personas_a_cargo.join(", ");$("texto").textContent=c.texto;$("referencia").replaceChildren(nod("p","Referencia sintética: "+c.esperadas+" acciones","suave"),...c.referencia.map(t=>nod("p",t,"suave")));$("resultados").replaceChildren(card(a,b,l),card(b,a,l));$("fuente").replaceChildren(nod("p","Run "+f.fuente.run+" · artefacto "+f.fuente.artefacto),nod("p","Modelo: "+(f.fuente.modelo||"no disponible")+" · corpus: "+f.fuente.corpus),nod("p","SHA-256 JSON: "+f.fuente.sha256Json,"fuente suave"),nod("p","Versiones evaluadas en esta corrida: "+Object.keys(c.brazos).join(", "),"suave"));const k=[f.fuente.run,c.id,a].join("/");if(clave!==k){clave=k;reiniciar(false);iniciarUniversal()}}
function boton(t,fn){const b=nod("button",t,"secundario");b.type="button";b.addEventListener("click",fn);return b}
function reiniciar(aviso=true){copia=elementos(caso().brazos[$("a").value],"resultado").map(e=>({titulo:e.titulo,estado:"Pendiente",origen:"Respuesta validada"}));historial=[];fill($("accion-referencia"),caso().referencia.map((t,i)=>[String(i),t]),"0");$("recuperacion").open=false;revision();if(aviso)$("estado").textContent="Revisión local reiniciada.";}
function mutar(i,change,msg){historial.push(structuredClone(copia));Object.assign(copia[i],change);revision();$("estado").textContent=msg;}
function revision(){const cont=$("revision-items");cont.replaceChildren();if(!copia.length)cont.append(nod("p","Sin resultados para revisar."));copia.forEach((e,i)=>{const a=nod("div",undefined,"accion");a.append(nod("h3",e.titulo),nod("p",e.origen,"suave"),nod("p",e.estado,"estado-local"));const acts=nod("div",undefined,"acciones");acts.append(boton("Confirmar",()=>mutar(i,{estado:"Confirmada (simulación)"},"Confirmación local; no se guardó nada.")),boton("Editar",()=>{const label=nod("label","Título de la tarea");const inp=nod("input");inp.value=e.titulo;inp.maxLength=180;label.append(inp);const save=boton("Aplicar cambio",()=>{const t=inp.value.trim();if(!t){$("estado").textContent="Escribe un título.";return}mutar(i,{titulo:t,estado:"Editada (simulación)"},"Cambio local; no se guardó nada.")});a.append(label,save);inp.focus();}),boton("Descartar",()=>mutar(i,{estado:"Descartada (simulación)"},"Descarte local; puedes deshacerlo.")));a.append(acts);cont.append(a);});$("deshacer").disabled=!historial.length;const activas=copia.filter(e=>!e.estado.startsWith("Descartada"));$("revision-resumen").textContent=activas.length+" acciones en revisión local · referencia: "+caso().esperadas+". La cantidad no garantiza equivalencia."; }
$("deshacer").addEventListener("click",()=>{if(historial.length){copia=historial.pop();revision();$("estado").textContent="Último cambio deshecho."}});
$("reiniciar").addEventListener("click",()=>reiniciar());
$("agregar-referencia").addEventListener("click",()=>{const titulo=caso().referencia[Number($("accion-referencia").value)];if(!titulo)return;if(copia.some(e=>e.titulo===titulo&&!e.estado.startsWith("Descartada"))){$("estado").textContent="Ya hay una acción con ese título en la revisión.";return;}historial.push(structuredClone(copia));copia.push({titulo,estado:"Pendiente",origen:"Añadida manualmente · referencia sintética"});revision();$("estado").textContent="Acción recuperada manualmente. La respuesta original no cambió.";});
$("tema").addEventListener("click",()=>{const claro=document.documentElement.dataset.tema!=="claro";document.documentElement.dataset.tema=claro?"claro":"oscuro";$("tema").textContent=claro?"Modo oscuro":"Modo claro";$("tema").setAttribute("aria-pressed",String(claro));});
$("corpus").addEventListener("change",grupos);$("grupo").addEventListener("change",casos);$("caso").addEventListener("change",versiones);$("comparar").addEventListener("click",render);$("capa").addEventListener("change",render);$("a").addEventListener("change",render);$("b").addEventListener("change",render);

let universal=null, seleccionUniversal=new Set();
const API=globalThis.NorkaRevision;
const etiquetasPendientes={beneficiario:"Beneficiario",ambito:"Ámbito",fecha_para_hora:"Fecha para la hora",recurrencia:"Recurrencia",destinatario:"Destinatario",tipo:"Tipo de acción",titulo:"Título",interpretacion:"Revisar interpretación"};
function iniciarUniversal(){
 const f=fixture(),c=caso(),ids=(xs,p)=>xs.map((nombre,i)=>({id:p+i,nombre})),integrantes=ids(f.contexto.integrantes,"i");
 const autorId=integrantes.find(x=>x.nombre===f.contexto.autor)?.id;
 const b=c.brazos[$("a").value];
 universal=b?.estado==="valida"&&autorId?API.iniciarRevision(b.resultado,{texto:c.texto,autorId,personas:ids(f.contexto.personas_a_cargo,"p"),ambitos:ids(f.contexto.ambitos,"a"),integrantes}):null;
 seleccionUniversal=new Set((universal?.items||[]).filter(i=>i.borrador.estado==="lista").map(i=>i.id));
 $("universal-estado").textContent="";renderUniversal();
}
function resumenUniversal(){
 const items=universal?.items||[],listas=items.filter(i=>i.estado==="pendiente"&&i.borrador.estado==="lista"),pendientes=items.filter(i=>i.estado==="pendiente"&&i.borrador.estado!=="lista");
 for(const id of seleccionUniversal)if(!listas.some(i=>i.id===id))seleccionUniversal.delete(id);
 $("universal-resumen").textContent=listas.length+" listas · "+pendientes.length+" por completar · "+items.filter(i=>i.estado==="confirmada").length+" confirmadas";
 $("universal-confirmar").disabled=!seleccionUniversal.size;
 $("universal-confirmar").textContent="Confirmar "+seleccionUniversal.size+" seleccionadas";
 $("universal-undo").disabled=!universal||universal.recibos.at(-1)?.revision!==universal.revision;
}
function operarUniversal(fn,msg){
 try{universal=fn();renderUniversal();$("universal-estado").textContent=msg;}
 catch{$("universal-estado").textContent="No se pudo aplicar el cambio. Revisa los datos y vuelve a intentarlo.";}
}
function campoUniversal(panel,nombre,control){const label=nod("label",nombre);label.append(control);panel.append(label);return control;}
function editorUniversal(item,host){
 if(host.querySelector(".editor-universal"))return;
 const e=structuredClone(item.actual),ctx=universal.contexto,form=nod("div",undefined,"campos editor-universal");
 const campo=(nombre,tipo,v)=>{const x=nod("input");x.type=tipo;x.value=v??"";return campoUniversal(form,nombre,x);};
 const elegir=(nombre,op,v)=>{const x=nod("select");fill(x,op,v??"");return campoUniversal(form,nombre,x);};
 const nombres=xs=>[["","Sin asignar"],...xs.map(x=>[x.nombre,x.nombre])];
 const titulo=campo("Título de la acción","text",e.titulo);titulo.maxLength=180;
 const tipo=elegir("Tipo de acción",[["tarea","Tarea"],["responsabilidad","Responsabilidad"],["propuesta","Propuesta"],["nota","Nota"]],e.tipo);
 const persona=elegir("Beneficiario",nombres(ctx.personas),e.persona_a_cargo);
 const ambito=elegir("Ámbito",nombres(ctx.ambitos),e.ambito);
 const fecha=campo("Fecha","date",e.plazo_fecha),hora=campo("Hora","time",e.plazo_hora);
 const destinatario=elegir("Destinatario",nombres(ctx.integrantes.filter(x=>x.id!==ctx.autorId)),e.dirigida_a);
 const periodo=elegir("Recurrencia",[["","Sin recurrencia"],["diaria","Diaria"],["semanal","Semanal"],["mensual","Mensual"],["anual","Anual"],["cada_n","Cada n (por revisar)"]],e.recurrencia?.tipo);
 const cada=campo("Cada cuántas unidades","number",e.recurrencia?.cada??1);cada.min="1";cada.step="1";
 const dias=["lunes","martes","miércoles","jueves","viernes","sábado","domingo"];
 const diasBox=nod("fieldset",undefined,"dias-universal");diasBox.append(nod("legend","Días de la semana"));
 const checks=dias.map(d=>{const l=nod("label",d),ch=nod("input");ch.type="checkbox";ch.checked=e.recurrencia?.dias.includes(d)||false;l.prepend(ch);diasBox.append(l);return ch;});form.append(diasBox);
 const revisar=nod("input");revisar.type="checkbox";revisar.checked=false;
 campoUniversal(form,"He revisado los datos de esta acción",revisar).className="confirmar-check";
 const error=nod("p",undefined,"aviso-pendiente");error.setAttribute("role","status");
 const save=boton("Guardar revisión",()=>{
  if(!revisar.checked){error.textContent="Marca que revisaste esta acción.";return;}
  if(!titulo.value.trim()||(periodo.value&&(!Number.isInteger(Number(cada.value))||Number(cada.value)<1))||(periodo.value==="semanal"&&!checks.some(x=>x.checked))){error.textContent="Completa el título y la recurrencia.";return;}
  const dato={tipo:tipo.value,titulo:titulo.value.trim(),persona_a_cargo:persona.value||null,ambito:ambito.value||null,plazo_fecha:fecha.value||null,plazo_hora:hora.value||null,dirigida_a:destinatario.value||null,recurrencia:periodo.value?{tipo:periodo.value,cada:Number(cada.value),dias:checks.flatMap((ch,i)=>ch.checked?[dias[i]]:[])}:null,confianza:"alta"};
  try{universal=API.editarRevision(universal,universal.revision,item.id,dato);
   const nuevo=universal.items.find(x=>x.id===item.id);if(nuevo.borrador.estado==="lista")seleccionUniversal.add(item.id);
   renderUniversal();$("universal-estado").textContent=nuevo.borrador.estado==="lista"?"Acción revisada y lista.":"Revisión guardada; quedan datos por completar.";
  }catch{error.textContent="Los campos no son válidos. Revisa la fecha, hora y recurrencia.";}
 });
 form.append(save,boton("Cancelar edición",()=>{form.remove();host.querySelector("button")?.focus();}),error);host.append(form);titulo.focus();
}
function renderUniversal(){
 const cont=$("universal-items");cont.replaceChildren();
 if(!universal){cont.append(nod("p","No hay una respuesta disponible."));resumenUniversal();return;}
 for(const i of universal.items){
  const a=nod("article",undefined,"accion universal-accion");a.dataset.accion=String(i.id);
  a.append(nod("h3",i.actual.titulo),nod("p",i.estado==="confirmada"?"Confirmada localmente":i.estado==="descartada"?"Descartada localmente":i.borrador.estado==="lista"?"Lista para confirmar":"Por completar","estado-local"));
  const camposVisibles=campos.filter(([k])=>k!=="confianza");
  for(const [k,n] of camposVisibles){const fila=nod("div",undefined,"fila");fila.append(nod("span",n),nod("span",fmt(i.actual[k])));a.append(fila);}
  if(i.estado==="pendiente"){
   if(i.borrador.pendientes.length)a.append(nod("p","Por completar: "+i.borrador.pendientes.map(p=>etiquetasPendientes[p]||p).join(", "),"aviso-pendiente"));
   if(i.borrador.estado==="lista"){const l=nod("label","Incluir en confirmación"),ch=nod("input");ch.type="checkbox";ch.checked=seleccionUniversal.has(i.id);ch.addEventListener("change",()=>{if(ch.checked)seleccionUniversal.add(i.id);else seleccionUniversal.delete(i.id);resumenUniversal();});l.prepend(ch);l.className="seleccion-universal";a.append(l);}
   const acts=nod("div",undefined,"acciones");acts.append(boton("Completar o editar",()=>editorUniversal(i,a)),boton("Descartar acción",()=>operarUniversal(()=>API.descartarRevision(universal,universal.revision,i.id),"Acción descartada; el original se conserva.")));a.append(acts);
  }
  const original=nod("details");original.append(nod("summary","Interpretación original"),nod("p",i.original.titulo,"suave"));for(const [k,n] of camposVisibles)original.append(nod("p",n+": "+fmt(i.original[k]),"suave"));a.append(original);cont.append(a);
 }
 resumenUniversal();
}
$("universal-confirmar").addEventListener("click",()=>operarUniversal(()=>API.confirmarRevision(universal,universal.revision,[...seleccionUniversal]),"Confirmación local realizada. No se guardó ni envió nada."));
$("universal-undo").addEventListener("click",()=>operarUniversal(()=>{const ids=universal.recibos.at(-1)?.ids||[];const n=API.deshacerConfirmacion(universal,universal.revision);ids.forEach(id=>seleccionUniversal.add(id));return n;},"Confirmación local deshecha."));
$("universal-reset").addEventListener("click",()=>{iniciarUniversal();$("universal-estado").textContent="Borrador reiniciado desde la respuesta original.";});

fill($("corpus"),datos.map(f=>[f.fuente.run,f.fuente.corpus.replaceAll("-"," ")+" · "+f.casos.length+" capturas"]),datos.at(-1).fuente.run);grupos();