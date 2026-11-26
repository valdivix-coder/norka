# Estado de la implementación

Se actualiza al cerrar cada tarea, con evidencia. Estados: pendiente · en curso · entregada (espera aprobación) · aprobada.

| Fase | Contenido | Estado | Evidencia | Documento |
| --- | --- | --- | --- | --- |
| 0 | Descubrimiento y diseño (sin código) | aprobada | Aprobación escrita de Simón el 20 de noviembre de 2026. Guía de 45 páginas, fuentes fechadas, siete respuestas de Simón en el apartado 2 y verificación documental en el apartado 9 | [FASE-0.md](fases/FASE-0.md) |
| 1 | Base | aprobada | PR #1 fusionado 75f8600, Vercel READY; 10/10 pruebas reales, vídeo revisado y arnés completo aprobado c2e33b6. | [FASE-1.md](fases/FASE-1.md) |
| 2 | Captura | en curso | v6 agrupada 48/50 (96%) principal y estricto; 2 discrepancias por acción; 175/175 arnés de la revisión evaluada; 180/180 arnés posterior y recorrido aprobado. Evaluación individual, privacidad, multiresultado pendientes. | [FASE-2.md](fases/FASE-2.md) |
| 3 | Centro de control | pendiente | Preparación documental de 11 tareas; puerta fase 2 no cumplida. | [PREPARACION-FASE-3.md](fases/PREPARACION-FASE-3.md) |
| 4 | Reparto | pendiente | — | `docs/fases/FASE-4.md` |
| 5 | Anticipación | pendiente | — | `docs/fases/FASE-5.md` |
| 6 | Tratamientos | pendiente | — | `docs/fases/FASE-6.md` |
| 7 | Presupuesto conjunto | pendiente | — | `docs/fases/FASE-7.md` |
| 8 | Vida familiar | pendiente | — | `docs/fases/FASE-8.md` |
| 9 | Pulido | pendiente | — | `docs/fases/FASE-9.md` |
| 10 | Beta | pendiente | — | `docs/fases/FASE-10.md` |

El detalle y los criterios de «hecho cuando» de cada tarea están en la sección 13 de `docs/PROMPT-MAESTRO.md`. Si esta tabla y el prompt maestro difieren, manda el prompt maestro.

Tarea 1.6: entregada técnicamente; integración de acciones de creación/invitación en 1.7 y de pantallas con datos reales en 1.8. La prueba real de Google de 1.5 fue aprobada por el propietario. Evidencia: `docs/fases/evidencia-1-6/`.

[Informe global por fases y tareas](INFORME-IMPLEMENTACION.md).


## V7.0 · Auditoría independiente — punto de parada

Paquete de cinco documentos recibido en 78a37c6, V6 y corpus oficial intactos. Pruebas reproducidas en CI aislado: https://github.com/valdivix-coder/norka/actions/runs/45913820767 (69/69, 72/72, 20/22 mutaciones detectadas, oficial/desarrollo 50/50, contrato 50/50). Contraejemplo adicional confirmado en rojo: «mañana a las 09:30» produce 09:00, clase inequívoca. PUNTO DE PARADA: no integrar ni llamar a Gemini. Ver docs/inteligencia/AUDITORIA-RECEPCION-V7.md para hallazgos, decisiones y reversión. Esperar respuesta del propietario para corregir prototipo sin editar originales. V6 sigue operativa, fase 2 abierta.
