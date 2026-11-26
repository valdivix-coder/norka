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
