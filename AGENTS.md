# norka · instrucciones para cualquier agente

**Antes de hacer nada, lee `docs/AHORA.md` (una página) y después `docs/PROMPT-MAESTRO.md` completo.** Dicen dónde quedó el trabajo, qué sigue y qué no se negocia. La guía gráfica `docs/marca/GUIA-GRAFICA.pdf` manda en todo lo visual: léela completa antes de tocar una pantalla.

## Lo esencial, por si solo lees esto

- **Producto:** «norka», siempre en minúsculas. El repositorio se llamó «parentis»; es el mismo proyecto.
- **Propietaria:** habla con ella **en español**, claro y paso a paso. No programa.
- **Una tarea numerada por respuesta** (por ejemplo «1.4»). Terminas, muestras evidencia y te detienes. No pasas a la fase siguiente hasta que ella escriba «apruebo la fase N».
- **La primera respuesta es solo la Fase 0 (sección 13.0 del prompt maestro), sin código.**
- **Nunca inventes** datos, APIs, precios ni políticas. Lo que no pudiste comprobar va como «NO VERIFICADO: …» con la forma de comprobarlo. Nunca digas «listo» sin evidencia.
- Si algo no está escrito, **pregunta** (regla 0.7 del prompt maestro). No lo decidas solo.
- **Ramas:** cada fase va en su rama (`fase-0`, `fase-1`, …). Nada se fusiona en `main` sin su aprobación escrita.
- **Marca:** logotipo «norka» e isotipo «Órbita», ya decididos. Se copian de los archivos de `docs/marca/svg/` (son el código de la sección 3.4 de la guía; no copies el código desde el PDF, porque se corta). Nunca se redibujan, optimizan ni modifican. Todo se dibuja con el componente `Marca`.
- **Reacciones:** son 5 y todas de apoyo. No existe «Tengo una duda» ni la cara con monóculo.
- **Buen trato:** la app habla de tareas, no de personas, y no toma partido. Sirve igual a adultos separados. Palabras prohibidas y reglas: sección 6.19.
- **Sin APIs de OpenAI, Anthropic ni otros proveedores: la única IA de la aplicación es Gemini, desde el servidor. Presupuesto adicional cero.** Nada de secretos en el repositorio, el navegador ni los registros.
- **Arnés:** antes de entregar, corre las comprobaciones que defina la Fase 1. Si una se pone en rojo, se arregla el código, no la prueba.
- **Next.js:** esta es una versión que puede diferir de lo que conoces. Antes de escribir código de Next.js, lee la guía de la versión instalada en `node_modules/next/dist/docs/` y respeta los avisos de obsolescencia.
- Al terminar cada tarea, actualiza `docs/IMPLEMENTATION_STATUS.md`, `docs/AHORA.md` y el documento de la fase en `docs/fases/`, con evidencia, límites y vuelta atrás.
