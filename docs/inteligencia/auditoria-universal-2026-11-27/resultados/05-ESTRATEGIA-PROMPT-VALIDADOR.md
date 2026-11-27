# 05 · Estrategia de prompt y validador

## 1. Decisión: V7.7 «solo validador y evaluador», con el prompt intacto

Se evaluaron tres opciones.

**a) Consolidar V7.6 tal como está.**
- Rechazada para el examen.
- Su base 7.4 tiene cuatro correcciones que inventan o cambian fechas y horas (P1-01 a P1-04).
- No tiene una vía de aceptación (P1-10).
- Su única mejora es el caso que la motivó.

**b) V7.7 = solicitud V7.5 sin cambios, validador 7.7 que solo se abstiene y evaluador con contador por acción.**
- Recomendada.
- Beneficios:
  - Corrige riesgos deterministas sin tocar la salida bruta. Las puertas brutas siguen siendo comparables con todo lo medido para V7.5 y V7.6.
  - Costo de tokens: cero.
  - Se prueba sin proveedor (replay de 173 respuestas y pruebas unitarias).
- Riesgo: no arregla errores brutos (pagos ya hechos, condiciones, consultas). Esos se miden en la corrida B del plan de pruebas antes de decidir V7.8.

**c) Arquitectura experimental («plan v1» con referencias e intenciones, 03 §3).**
- No ahora.
- Cambia la solicitud y el esquema. Obliga a rehacer el desarrollo y el examen.
- Agrega tokens de salida.
- No tiene manejadores de fase 3 contra los que proponer.
- Se adopta cuando existan los servicios `preparar` y `aplicar` de fase 3.

## 2. Validador 7.7: cambios mínimos y su ablación

Archivo nuevo `src/core/usecases/validar-interpretacion-v7-7.ts`. Envuelve a 7.6 y no lo modifica: 7.4 y 7.6 quedan congeladas. Cada cambio es una función pura, con su prueba y su motivo de ajuste propio.

| Paso | Cambio | Regla | Hallazgo |
| --- | --- | --- | --- |
| A0 | Base | V7.6 (`328515d1…`) | — |
| A1 | Lecturas múltiples | Si un fragmento tiene más de un día de la semana, más de un número de día, «o», o una corrección («no», «perdón», «mejor») entre dos marcas → fecha null y motivo `fecha_alternativa`. Nunca se elige una | P1-01, P1-02 |
| A2 | Día de la semana con número | Si hay «<día> N»: el número manda si coincide con el día; si no coincide → null y `fecha_contradictoria` | P1-03 |
| A3 | Medianoche | «12 de la noche» → 00:00 con fecha ambigua (null y marca) o la fecha que la decisión D-33 apruebe. Nunca 12:00 | P1-04 |
| A4 | Hora desconocida | Si el fragmento tiene algo con forma de hora que el léxico no reconoce (`\d{1,2}[.:h]\d{2}`, «am/pm», «a eso de», «como a las», «tipo»), se conserva la hora del modelo y se marca `hora_no_verificada` | P2-01 |
| A5 | Repetición | «cada mes», «de cada», «todos los meses» en el fragmento: no crean plazo | P2-02 |
| A6 | Jardín | En pagos, «jardin» no es ancla de El hogar. Con El hogar → marcar `hogar_ambiguo` y confianza baja (no anular, porque puede ser el jardín de la casa) | P2-03 |
| A7 | Acción realizada | «ya» más pretérito o «ayer» más pretérito en la cláusula del título → marca `posible_accion_realizada`, confianza baja. No se borra | P1-08 |

Protocolo de la ablación (todo sin proveedor):

1. Cada paso se aplica de forma acumulada (A0, A0+A1, A0+A1+A2…) sobre las 173 respuestas, con el mismo flujo de `replay-v7-6.yml`.
2. Exigencias para cada paso:
   - cero empeorados en principal y estricta;
   - cero empeorados en el contador por acción;
   - informar cuántas veces se activa la regla.
3. Además, cada paso debe pasar sus pruebas A2 del plan de pruebas y convertir su `test.fails` en `test` para 7.7.
4. Si un paso empeora algún caso, se retira ese paso (no se ajusta el caso) y se documenta.
5. Lo que el replay no puede mostrar, porque la regla nunca se activa, se declara «sin evidencia empírica, solo prueba unitaria».

Se excluye a propósito:

- Toda corrección que **agregue** datos (fecha, hora, persona, ámbito o monto) que el modelo no dio.
- Cambios a la regla financiera de V7.6.
- Equivalencias de catálogo propio.

## 3. Candidato de prompt V7.8 (solo si la corrida B lo justifica)

Condición: la corrida B muestra, en bruto, al menos 2 violaciones en la misma clase:

- pagos o acciones ya hechos (F04, F05, S04);
- consultas, navegación, modificación o completar (N01 a N04);
- condición (F11);
- petición a dos integrantes (S08).

Si no se cumple, no se toca el prompt.

Cambios de redacción candidatos. No se agregan demostraciones salvo que una regla sola no baste en la corrida B.

1. Regla 1: «Lo ya hecho ("ya pagué", "ayer llevé") no es acción: va a descartes (realizada); si no queda acción, nota sin_accion. Preguntas, pedidos de mostrar, cambiar o marcar algo existente: nota no_representable».
   - Requiere agregar `realizada` al enum de descartes del contrato interno. Es un contrato interno nuevo y obliga a un esquema nuevo.
   - Alternativa sin cambiar el esquema: usar `negacion`.
2. Regla 2: «Petición a dos o más integrantes: nota destinatario_no_valido».
3. Regla 1: «Condición ("si…"): conserva la acción con la condición en el título y confianza baja» (sujeto a D-31).
4. Demostración «Transferir 25 lucas del jardín → Renata»: reemplazarla por una sin ambigüedad («la mensualidad del jardín infantil de Renata»).

Presupuesto de tokens: V7.5 ya tiene +6,45 % de entrada frente a V6 (run 46039721333). Con un tope de +10 % quedan unos 100 tokens por solicitud, unos 350 a 400 caracteres. Es una estimación a partir de los conteos de desarrollo, no una medición. Los cuatro cambios deben caber ahí o compensarse compactando. Medir con `countTokens` antes de congelar.

Puertas de V7.8:

1. El mismo desarrollo B, con 3 brazos: V6, 7.7 y 7.8.
2. Cero regresiones frente a 7.7 en los 54 casos nuevos y en los conjuntos V7.4 y V7.5.
3. Resistencia temporal: el conjunto temporal anterior, que V7.5 nunca volvió a medir.
4. Después, congelación y el examen oficial contra V6.

## 4. Qué decide la IA y qué decide el código

| Lo decide la IA | Lo decide el código |
| --- | --- |
| Qué es una acción, en qué orden va y qué queda descartado | Si un nombre, un ámbito o un destinatario existe y es único (por referencia) |
| La clase de intención | La fecha y la hora desde fragmentos literales, solo si hay una sola lectura |
| El vínculo persona–acción (nombrada o referida) | El monto en CLP entero desde el fragmento |
| El ámbito por finalidad | La recurrencia desde el fragmento |
| El alcance temporal (propio, hereda o común) | El prefiltro de §11, los permisos y la versión del objeto |
| Las dudas declaradas | La revalidación al confirmar, la idempotencia, la transacción y la outbox |

## 5. Puertas, congelación y vuelta atrás

- **Congelar antes de cualquier solicitud:**
  - hashes de la instrucción y los sufijos,
  - el esquema,
  - el validador 7.7 y su base (7.6 y 7.4),
  - el adaptador,
  - el evaluador y la cobertura,
  - el corpus,
  - en un archivo `CONGELACION-V7.7.json` verificado en CI.
- **Puertas:** las de 04-PUERTAS, sin cambios. El contador por acción y las listas equivocadas se agregan como reporte.
- **Vuelta atrás:** no seleccionar 7.7. V6 sigue siendo la referencia por defecto. No hay datos, migraciones ni contrato público que deshacer.
