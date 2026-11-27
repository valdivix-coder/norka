# 03 · Arquitectura recomendada y operaciones tipadas

Propuesta de diseño. No es implementación ni autoriza fase 3, cambios de contrato §6.2, migraciones ni IA con datos reales. Se respetan §6.2, §11 y el orden de fases. Todo esquema de este documento es candidato para el sandbox.

## 1. Decisión de arquitectura

Se recomienda **una sola llamada a Gemini por captura, que produce intenciones con evidencia literal**, seguida de etapas deterministas. No se recomienda una cadena de varias llamadas (segmentar, luego clasificar, luego resolver), por tres razones:

- Duplica latencia y cuota con un presupuesto adicional cero.
- Pone en riesgo la meta de voz de §12 (8 s).
- La evidencia de V7.x muestra que los errores dominantes se corrigen mejor con reglas deterministas y revisión que con más pasos del modelo.

Flujo propuesto:

```
captura (texto|voz) ─► guardar original + fecha civil y zona de la captura (siempre, sin IA)
   └─► prefiltro §11 local ──(teléfono, RUT, dosis…)──► sin clasificar, NO se envía
   └─► contexto mínimo autorizado (servidor) ─► Gemini (1 llamada, esquema cerrado)
        └─► validación determinista por acción (calendario, montos, refs, catálogo)
             └─► borradores tipados (lista | por_completar | no_disponible | conflicto)
                  └─► revisión (misma hoja; edición por referencia opaca)
                       └─► confirmación ─► servidor revalida (permiso, versión, hash) ─► transacción
                            └─► outbox (avisos tras commit) ─► recibo por acción ─► deshacer acotado
```

La IA nunca ejecuta, nunca recibe identificadores reales, nunca genera SQL, URL ni selectores DOM, y nunca ve otra familia.

## 2. Contexto mínimo autorizado (lo construye el servidor)

```ts
type Ref = `p${number}` | `i${number}` | `a${number}` | `o${number}`; // opacas, válidas solo en esta captura
type ContextoIA = {
  fecha_local: string;            // AAAA-MM-DD de la CAPTURA en America/Santiago (no de proceso)
  hora_local: string;             // HH:MM de la captura
  zona: "America/Santiago";
  calendario: { hoy: string; manana: string; proximos: Record<string, string>; proximo_mismo_dia: Record<string, string> };
  personas: { ref: Ref; nombre: string; alias?: string[]; tipo?: "hijo" | "mascota" | "hogar" }[];
  integrantes: { ref: Ref; nombre: string }[];          // sin teléfonos, sin correos, sin roles sensibles
  ambitos: { ref: Ref; nombre: string; clase?: ClaseAmbito }[]; // clase = equivalencia estándar declarada por la familia
  objetos?: { ref: Ref; tipo: "tarea" | "responsabilidad" | "ficha_pago"; titulo: string; fecha?: string }[]; // ≤10, solo si hay intención de modificar o completar
  operaciones: OperacionId[];     // solo las habilitadas en la fase vigente
};
```

Reglas del contexto:

- **Nunca entran:** tratamientos, comentarios, reacciones ni teléfonos (§11); montos de presupuesto; datos de otras familias.
- **Objetos existentes:** se envían solo tras una búsqueda determinista por texto y fecha, limitada a la familia y con un tope.
- **Referencias:** se generan por captura y se resuelven en el servidor. No se persisten en la IA ni se reutilizan entre capturas.

## 3. Salida de la IA (contrato interno candidato, «plan v1»)

```ts
type PlanIA = {
  descartes: { evidencia: string; motivo: "negacion" | "correccion" | "instruccion" | "realizada" | "condicion_no_cumplida" }[];
  intenciones: {
    local: string;                                  // "a0", "a1"… para dependencias
    clase: "crear" | "modificar" | "completar" | "consultar" | "navegar" | "preparar_envio" | "no_soportada" | "nota";
    operacion: OperacionId | null;                  // del catálogo habilitado; null si no_soportada o nota
    evidencia: string;                              // fragmento LITERAL de la captura
    campos: Partial<{
      titulo: string;
      persona: { ref: Ref | null; base: "nombrada" | "referida" | "ninguna" };
      ambito: Ref | null;
      tiempo: { fragmentos: string[]; alcance: "propio" | "hereda" | "comun" | "ninguno" };
      recurrencia: { fragmento: string } | null;    // el código calcula la regla
      monto: { fragmento: string } | null;          // el código calcula CLP entero
      destinatario: Ref | null;
      objeto: Ref | null;                           // para modificar/completar
      destino: DestinoId | null;                    // para navegar: enum cerrado
    }>;
    depende_de: string[];                           // locales: «hereda», «común», «después de»
    dudas: { campo: string; motivo: "ambiguo" | "fuera_de_lista" | "dos_candidatos" | "no_representable" }[];
  }[];
};
```

Diferencias con el contrato interno v7-1:

1. Referencias en vez de nombres: los homónimos se resuelven en el servidor (P2-05).
2. El tiempo, el monto y la recurrencia son **fragmentos**. El código los calcula y nunca acepta una fecha calculada por el modelo como verdad (P1-01 a P1-04).
3. Evidencia y dependencias explícitas (P2-07).
4. `clase` permite representar consultar, navegar, modificar o completar sin crear tareas falsas (N01 a N04 del conjunto nuevo).
5. `realizada` y `condicion_no_cumplida` en descartes (P1-08).

Costo: más campos de salida. Se mitiga omitiendo nulos en el esquema (ya se hace en las demostraciones) y se mide antes de adoptarlo. NO VERIFICADO su efecto en tokens y latencia.

## 4. Borrador, revisión y confirmación

```ts
type Procedencia = "ia" | "regla" | "persona";
type Borrador = {
  captura_id: string; local: string; operacion: OperacionId; version_esquema: number;
  campos: Record<string, { valor: unknown; procedencia: Procedencia; evidencia?: string }>;
  estado: "lista" | "por_completar" | "no_disponible" | "conflicto";
  pendientes: string[];                // fecha_para_hora solo si la operación EXIGE fecha (no en responsabilidades)
  depende_de: string[];
  hash: string;                        // sha-256 del borrador canónico
};
type Confirmacion = { captura_id: string; revision_lote: number; acciones: { local: string; hash: string }[]; clave_idempotencia: string };
type Recibo = { local: string; resultado: "aplicada" | "ya_aplicada" | "conflicto" | "rechazada"; objeto?: { tipo: string; id: string; revision: number }; deshacer_hasta?: string };
```

Reglas de la revisión:

- **Confianza.** Una persona no «eleva la confianza»: confirma. El recibo registra `procedencia: "persona"` en los campos que tocó y una marca de revisión del lote.
- **Dependencias.** No se permite confirmar una acción con `depende_de` sin su origen, salvo que la persona fije el valor heredado (P2-07).
- **Preselección.** Se preseleccionan solo las listas con todos sus campos de procedencia «ia» y evidencia literal. Mientras M-1 muestre más de 5 % de listas equivocadas en desarrollo, conviene preseleccionar solo cuando el lote tenga una acción. Requiere decisión (D-39) porque afecta la meta de un toque.
- **Hora en recurrencias.** Una responsabilidad con hora y sin fecha es válida. La regla de recurrencia (3.2) guarda la hora. Requiere un cambio de contrato y de esquema (D-34).

## 5. Ejecución en el servidor

- **Revalidar al confirmar:** sesión, pertenencia, permiso por operación, versión del objeto (`revision`), hash del borrador y catálogo vigente. Si algo cambió, el recibo dice `conflicto` y la acción vuelve a revisión.
- **Idempotencia:** clave por captura, acción y confirmación. Un reintento devuelve `ya_aplicada` sin duplicar.
- **Transacción:** las acciones confirmadas de un lote se aplican juntas o ninguna.
- **Outbox:** los avisos y envíos se registran en la misma transacción y se despachan después del commit. Un reintento es idempotente. Deshacer no puede «retirar» una comunicación entregada.
- **Concurrencia:** control optimista por `revision`. Nunca se sobrescribe una edición manual ajena (CONTRATO-PROCESAMIENTO).
- **Deshacer acotado:** solo el último recibo, dentro de una ventana, si no hay cambios posteriores sobre los objetos. Se registra como evento, no como borrado silencioso.
- **Navegación:** `destino` es un enum (`persona.ficha`, `tarea.detalle`, `hoy`, `buscar`…) más una referencia. El servidor lo traduce a una ruta permitida y la IA no genera URL.
- **Consultas:** filtros tipados de solo lectura, como `{tipo:"pendientes", ambito?, rango}`. Los números y estados los calcula el servicio. La IA nunca redacta cifras.

## 6. Catálogo de operaciones · revisión de la versión 0.1 y propuesta 0.2

Problemas de la versión 0.1 (detalle en P2-11 de 02):

- Sin intención ni tipos.
- Nombres en vez de referencias.
- `ejecucionIA` ambiguo.
- Faltan navegar, consultar, no soportada, recordatorio y editar.
- Solapamiento entre pago y gasto.
- Precondición equivocada en `captura.guardar_original`.

Propuesta: cada operación declara los siguientes campos.

```ts
type Operacion = {
  id: OperacionId; fase: string; clase: PlanIA["intenciones"][number]["clase"];
  ia: "puede_proponer" | "solo_manual" | "nunca_enviar";      // reemplaza ejecucionIA
  esquema: string;                                            // nombre del esquema Zod versionado
  precondiciones: ("sesion" | "familia" | "permiso" | "revision_vigente" | "objeto_unico" | "consentimiento_ia" | "consentimiento_especifico")[];
  riesgo: "bajo" | "dinero" | "salud" | "terceros";          // dinero/salud/terceros: nunca preselección automática
  efectos: ("bd" | "outbox")[]; reversible: "deshacer" | "contraoperacion" | "no";
  prueba: string;
};
```

Asignación propuesta. La IA puede proponer únicamente; ejecutar siempre lo hace un manejador después de la confirmación.

- **Fase 2 (vigente):**
  - `captura.guardar_original` (sin IA y sin precondición de contexto).
  - `tarea.crear`, `responsabilidad.crear` y `propuesta.preparar`: la IA puede proponerlas.
  - `nota.conservar`.
  - Todo lo demás queda como `no_soportada` visible.
- **Fase 3:**
  - `tarea.modificar_plazo`, `tarea.completar` y `tarea.posponer`: requieren `objeto_unico` y revisión. Si hay más de un candidato, `conflicto` con elección.
  - `responsabilidad.editar`.
  - `plantilla.activar`: la elección de titular es manual. Un integrante único no lleva pregunta (3.1).
  - `recordatorio.crear` (3.3, nueva).
  - `pago.preparar_ficha`: el monto nunca se infiere sin un fragmento. Una «ficha pendiente» no es dinero transferido.
  - `pago.registrar_manual`: solo con una referencia a una ficha existente y el monto literal. Si no hay ficha, la intención queda `no_disponible` con el original.
  - `buscar.objetos`, `navegar.abrir` y `consultar.pendientes` (nuevas, de solo lectura).
  - `contacto.preparar`: la IA puede proponer «llamar a X» con referencia de integrante. El teléfono lo pone el servidor y nunca pasa por la IA.
- **Fase 4:** `propuesta.enviar` y `aviso.preparar`. Siempre con revisión, riesgo «terceros» y sin preselección.
- **Fase 5:** `plan.preparar`.
- **Fase 6:** `tratamiento.registrar_manual`, con `ia: "nunca_enviar"`. El prefiltro detiene el texto antes de la IA.
- **Fase 7:** `presupuesto.registrar_gasto`. Hasta entonces, «gasté X» es una nota.
- **Fase 8:** `actividad.preparar_comentario`, con `ia: "nunca_enviar"`.

Interfaces reutilizables: cada servicio de fase 3 expone `preparar(entrada) → Borrador` y `aplicar(confirmacion) → Recibo`. La pantalla manual y la voz llaman al mismo `preparar`, y la hoja de revisión es el mismo componente. Así la voz no agrega permisos ni caminos nuevos.

## 7. Dependencias y orden

1. Fijar la fecha civil y la zona en la captura (P1-06). Se puede hacer en fase 2 sin IA.
2. Prefiltro de §11 (P1-07). Es puro y comprobable en el arnés.
3. Validador 7.7 que solo se abstiene (05).
4. Evaluador con conteo por acción.
5. Examen oficial.
6. Puerta de fase 2.
7. Fase 3: servicios con `preparar` y `aplicar`, y luego el catálogo 0.2 habilitado operación por operación.
8. «Plan v1» con referencias: después de que existan los servicios de fase 3 contra los que proponer. No adelantarlo: hoy no hay manejadores reales.
