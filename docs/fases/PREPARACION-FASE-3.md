# Preparación de fase 3 — Centro de control

Documento de planificación, no ejecución de la fase. Fuente de verdad: PROMPT-MAESTRO.md §13.3, §6.1, §6.3–6.8, §6.11, §6.16–6.17, §8.1 y guía gráfica. Puerta previa: §13.2 cumplido y aprobación escrita. Sin cambios en main, sin nuevas dependencias, sin aplicar migraciones.

## Orden de implementación (11 tareas)

1. **3.1 Catálogo de 60 plantillas.** Extraer las plantillas de las secciones pertinentes y cubrir los ámbitos y tipos de persona a cargo; activar con elección de titular, un integrante único sin pregunta. No asumir nombres, fechas ni gastos de familias reales. Validar recuento y reglas de buen trato.
2. **3.2 Recurrencia.** Núcleo puro con puerto reloj y horizonte 14 días; casos diaria/semanal/mensual/anual/cada_n, fin de mes y bisiesto. Generación idempotente y proceso diario 06:00 America/Santiago; verificar límites del alojamiento antes de configurar cron. No se crea proceso ahora.
3. **3.3 Plazos y recordatorios.** Validar ámbitos que exigen plazo; persistir recordatorios y listarlos. No Web Push hasta 4.3.
4. **3.4 Avance.** Implementar cálculo del §6.8 con cuadratura y ejemplo Emilia, sin comparaciones personales.
5. **3.5 Hoy.** Construir centro de control con gestos y deshacer, respuesta inmediata, accesibilidad; Se viene y Tomas de hoy reservados para fases 5/6.
6. **3.6 Modo Resolver.** Recorrido del §6 correspondiente, no inventar estados o acciones.
7. **3.7 Familia.** Ficha y anillos por ámbito, edición contextual y plantillas propias; cambios de titular mediante propuesta, no asignación directa a otra persona.
8. **3.8 Pagos.** Fichas y pagos manuales, montos CLP enteros, puerto sin proveedor bancario. FK pendiente de responsabilidad a ficha de pago; migración aditiva con antes/después y rollback. No usar datos bancarios reales en pruebas.
9. **3.9 Buscar.** Extender búsqueda de personas a objetos de fase 3, siempre ámbito familiar.
10. **3.10 Contacto.** Hoja de persona, tel: y wa.me según contexto, Pedir su número; no entregar teléfonos a Gemini o analítica.
11. **3.11 Semana simulada.** Familia sintética de tres integrantes y dos personas a cargo, siete días, crear/completar/posponer/pagar. Evidencia de aislamiento, idempotencia y cuadratura. No aprobar hasta que el recorrido pase.

## Dependencias y riesgos

- 0007 incluye solo infraestructura de propuestas y actividad requerida desde fase 2. No anticipa pantallas de fase 4/8. La numeración de las migraciones siguientes usa el próximo identificador libre y el historial real, no el número histórico del prompt.
- Las capturas deben seguir funcionando sin IA. Los resultados múltiples necesitan edición y deshacer sin borrar el original ni sobrescribir cambios ajenos.
- El cron diario y avisos exigen verificar límites gratuitos; presupuesto adicional cero. No activar servicios pagos sin permiso.
- Antes de cada pantalla, leer íntegramente la guía gráfica correspondiente y documentación Next instalada. Mantener marca exacta, tokens, palabras del glosario y roles.

Estado: 0/11 implementadas en fase 3. Preparación de secuencia y criterios, no avance de código ni aceptación.


## Plan transversal de inteligencia familiar por voz
Nuevo plan docs/inteligencia/PLAN-INTELIGENCIA-FAMILIAR-POR-VOZ.md: 6 niveles, 30 hitos verificables, pesos 15/20/20/20/15/10. Base 1/30 hitos, 3% ponderado del nuevo objetivo (no avance total app); V7.5 80% y laboratorio previo 90% estimado. Primera parte: resistencia iniciada 20de483, run 46039721333, pendiente de resultado. Laboratorio ampliado 105/254 validado en 46037861623; artefacto 15217737998. Auditoría sobre 367 acciones: 13 con cambios de campos/tipo/título al aplicar, 5 horas y 2 recurrencias no preservadas; 93 por revisar. Propuesta de arquitectura tipada, revisión antes de ejecución y expansión por fase funcional. §6.2 hoy guarda y crea antes de editar; requiere decisión explícita para cambiar a guardar original/revisar/confirmar acciones. Fase 3 0/11, preparación permitida, ejecución solo con puerta y aprobación escrita. Sin cambios a contrato, BD, proveedor, presupuesto ni main. No se inicia aceptación oficial en esta etapa.


## Preparación de auditoría avanzada y catálogo de operaciones
Paquete docs/inteligencia/auditoria-universal-2026-11-27/ con encargo, manifiesto, catálogo de diseño 26 operaciones (ninguna habilitada para IA), puertas/entregables y pilotaje separado. Modelo avanzado trabaja rama independiente desde bdccc7c, no cambia corpus ni ejecuta Gemini. Auditoría pendiente. App familiar sin ruta Laboratorio; usar HTML autónomo verificado y entorno familiar ficticio solo si acceso comprobado. No fase 3, no cambio de contrato, BD, main, versión o presupuesto. L1 1/5, L2 3/5, 4/30 hitos, 15% ponderado; preparación no cuenta como nuevo hito. Navegador 46070603317 y arnés 46070783265 aprobados. Dos pruebas de integridad de catálogo añadidas; resultado pendiente. Próximo: piloto humano, auditoría y puerta de fase 2.


## Cierre preparación de auditoría universal · 27-nov-2026
Paquete docs/inteligencia/auditoria-universal-2026-11-27/ (6 archivos) creado en 1dda9d2, precisión de revisión/privacidad en 95d2687. Base de código a auditar bdccc7c, modelo avanzado trabaja en rama independiente desde 1dda9d2, leer actualización de paquete en fase-2. Catálogo diseño 26 operaciones: 5 manuales existentes en código, 4 borradores sintéticos, 15 futuras y 2 reservadas al tratamiento local; ninguna habilitada para IA. Dos controles de integridad aprobados: arnés 303/303, 34 archivos, run 46074550110. Navegador completo pendiente 46074550120; anterior 46070603317 aprobado. 286 archivos técnicos previos comparados, 0 modificados. Main 75f8600545dc6a7bc5a920a840146f33b880b21c intacta. Laboratorio descargado de nuevo y ZIP/HTML verificados (15232343591); ninguna ruta integrada, acceso de Belén y revisión desplegada NO VERIFICADO. Web Speech puede procesar voz fuera del dispositivo: solo frases ficticias. No nueva generación Gemini, no datos reales, no cambios de código de producto, contrato ni BD. L1 1/5, L2 3/5, 4/30 hitos, 15% ponderado; preparación de catálogo/encargo no cumple nuevo hito, fase 3 0/11. Próximo: recibir auditoría independiente y resultados humanos; definir corrección financiera bruta/temporal y acceso protegido solo con autorización. Informe: docs/inteligencia/INFORME-PREPARACION-AUDITORIA-UNIVERSAL.md. Reversión: retirar paquete y test nuevo, sin efecto en app.
