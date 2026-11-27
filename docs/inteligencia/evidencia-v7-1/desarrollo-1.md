# Desarrollo 1 · corpus desarrollo-v7-1 (39 frases) · NO es aceptación

Run https://github.com/valdivix-coder/norka/actions/runs/45922944781 · commit `15d7568` · artefacto 15165543123 (ZIP SHA-256 `49faf07d8a96d396bc429d9c39018faf3c2aa5a05f6614d0ba50ebf058f836a8`). `gemini-3.5-flash-lite`, sin respaldos, temperatura 0, semilla 20261127, orden balanceado, 39/39 válidas por brazo, 0 fallos, 78 `finishReason` STOP. Instrucción 7.1 evaluada: SHA-256 `db06ba42…` (versión previa a los ajustes; no es la congelada).

| Métrica (n = 39) | V6 | 7.1 |
|---|---:|---:|
| Principal bruta / normalizada | 32 / 32 | 35 / 35 |
| Estricta bruta / normalizada | 30 / 31 | 33 / 35 |
| Discrepancias por acción bruta / normalizada | 10 / 9 | 7 / 5 |
| Campos brutos discrepantes (contador histórico) | 7 | 5 |
| Casos corregidos / empeorados por validador | [30] / [] | [13, 30] / [] |
| Tasa Por revisar (elementos) | 5/47 (10,6 %) | 10/47 (21,3 %) |
| Tokens entrada / salida totales | 109.035 / 3.565 | 118.287 / 5.099 |
| Por solicitud entrada / salida | 2.796 / 91 | 3.033 / 131 |
| Mediana / p95 ms | 770 / 926 | 867 / 1.270 |

Lectura por caso (auditoría propia, una pasada; no es auditoría independiente):

- 7.1 acierta y V6 falla: 14 (V6 convierte «Rodrigo va a…» en propuesta), 27 (V6: retirar del jardín → Crianza diaria), 28 (V6 inventa 19:00 para «a las siete»), 29 (V6 asigna El hogar a «comprar leche» sin casa nombrada: beneficiario no respaldado).
- Regresión bruta 7.1: 13 (petición a un nombre que no está en integrantes → propuesta bruta; el validador la convierte en nota). Motivó el ajuste de la regla 2.
- Ambos fallan: 7 (dividen «remedios para X y para Y» en dos acciones; convención discutible del etiquetado), 8 («ordenar la pieza de X» → Hogar; etiqueta Crianza diaria discutible), 18 (7.1 clasifica «cortarle el pelo» como Mascotas; V6 calcula mal la autocorrección: 03-04), 30 («cada 15 días»: V6 `cada_n`, 7.1 «mensual»; ambos corregidos por el validador), 32 (tareas escolares → Crianza diaria; etiqueta Colegio discutible).
- H1 (alcance): casos 1, 2, 3 correctos en ambas capas, con `alcance` hereda / ninguno / común declarado correctamente. H2 (beneficiario): 29 y 38 con `persona_base` ninguna → null, sin invención. H4 (pago): 4, 6, 21, 31 correctos. Muestra pequeña; no se infiere superioridad estadística.
- Mayor tasa Por revisar en 7.1: parte por marcas del validador (franja «todas las tardes» marcada sin plazo: falso positivo, corregido), parte por confianza baja legítima (convención de mismo día, nombre desconocido) y parte porque V6 rellena beneficiarios (caso 29).
- Ningún monto alterado (caso 21 conserva «45 lucas»). Alertas automáticas de invención: 0 en ambos brazos.
