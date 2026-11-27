# 01 · Informe ejecutivo

Auditoría independiente de la inteligencia universal de norka, 27-nov-2026. Se trabajó en la rama separada `claude/beautiful-knuth-9zau24`. No se llamó a Gemini, no se tocó producción y no se usaron datos reales. No se modificó ningún candidato, el corpus oficial ni las expectativas. Nada se fusionó y ninguna fase se declara aprobada.

## Qué se comprobó

- El arnés corre en verde: 303 de 303 pruebas.
- Las cifras del paquete coinciden con los registros de GitHub Actions:
  - 142, 155 y 156 de 173 en el replay de V7.6;
  - 367 acciones y 274 listas en la revisión universal;
  - la huella del laboratorio.
- El corpus oficial y el prompt V6 siguen intactos.

## Hallazgos principales

1. **El corrector automático de fechas y horas a veces empeora lo que el modelo hizo bien.** Lo reproduje con pruebas en cuatro casos:
   - «el viernes o el sábado» queda como viernes;
   - «el jueves, no, mejor el sábado» puede quedar como jueves;
   - «el lunes 15» se cambia a otro lunes;
   - «a las 12 de la noche» se cambia a mediodía.

   Además, borra horas escritas como «17.30» o «5 pm». V7.6 se apoya en este corrector.
2. **La medición puede contar como acierto una acción cambiada por otra.** No compara títulos: si una acción inventada reemplaza a una omitida con los mismos campos, cuenta como correcta. La regla oficial no cambia; propongo un contador adicional que lo detecte.
3. **«367 de 367 preservadas» no mide fidelidad, solo que la copia funciona.** La medición nueva que hice dice otra cosa. En versiones antiguas, una de cada seis acciones que llegan «listas para confirmar» está equivocada, y dos de cada tres «por completar» estaban bien. Para V7.5 y V7.6 falta medirlo; la prueba queda preparada para CI.
4. **Brechas que bloquean el uso real:**
   - el sistema no conoce la fecha de la captura;
   - no hay filtro que impida enviar a la IA teléfonos o dosis de remedios (§11);
   - «ya pagué la luz» puede convertirse en una tarea pendiente;
   - las responsabilidades pierden la hora («todos los lunes a las 8»).
5. **V7.6 no puede ir al examen como está.** No tiene una vía de aceptación. Su única mejora es justamente el caso para el que se diseñó, y su regla casi nunca se activa en los datos existentes.

Total: 0 problemas críticos activos, 10 altos, 12 medios y 5 menores. El detalle, con archivo, línea y contraejemplo, está en `02-AUDITORIA-TECNICA.md`.

## Decisión recomendada

- **V7.7:** el mismo prompt de V7.5 (sin costo nuevo de tokens), con un corrector que solo se abstiene (nunca elige ni agrega fechas, horas o personas) y con el contador por acción.
- **Ablación:** se prueba paso a paso sobre las 173 respuestas existentes, sin llamar a Gemini.
- **Uso de cuota, con tu autorización:**
  1. 52 solicitudes con los 54 casos nuevos que escribí (contrastivos, sin frases oficiales);
  2. el examen oficial contra V6.
- **Cambiar el prompt (V7.8):** solo si esa corrida muestra errores repetidos en pagos ya hechos, consultas o condiciones.
- **No adoptar ahora una arquitectura nueva:** más llamadas encarecen y ponen en riesgo la meta de 8 segundos.

## Camino más corto y responsable a fase 3

1. V7.7 y su replay, sin cuota.
2. Fecha de la captura y filtro de privacidad, como pruebas puras.
3. Corrida B.
4. Examen oficial.
5. Conjunto ciego tuyo y de Belén.
6. Tus mediciones de tiempo en el teléfono.
7. Tu «apruebo la fase 2».

Los servicios de fase 3 se diseñan para servir igual a la pantalla manual y a la voz (ver `03-ARQUITECTURA-OPERACIONES.md`).

## Qué necesito de ti

Nueve decisiones breves, en `08-DECISIONES-PROPIETARIO.md`. La primera es autorizar V7.7. Además:

- escribir con Belén las 50 frases ciegas, 25 cada uno, sin mostrárselas a ningún modelo;
- hacer el pilotaje y medir los tiempos.

## Avance

- Fase 3: 0 de 11 tareas.
- Plan transversal: sigue en 4 de 30 hitos. Esta auditoría no completa hitos nuevos; aporta diagnóstico y pruebas.

## Paradas

Detener y consultarte si ocurre cualquiera de estas situaciones:

- haría falta tocar una versión congelada, el corpus o el contrato;
- una corrección agrega un dato;
- aparece una regresión o una alerta de la candidata;
- la cuota responde 429;
- hay un costo mayor que cero;
- se piden datos reales.
