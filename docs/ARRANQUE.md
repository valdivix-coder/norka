# Cómo comenzar la implementación de norka

Guía para la propietaria. No necesitas programar: cada paso es copiar, pegar o pulsar.

## Qué necesitas

- Este repositorio, con `docs/PROMPT-MAESTRO.md` y `docs/marca/GUIA-GRAFICA.pdf` ya subidos (están).
- Un agente de código con acceso al repositorio (por ejemplo Claude Code). Debe poder leer PDF y escribir en el repositorio.
- Tiempo para responder preguntas: el ejecutor se detiene a preguntarte antes de cada decisión que no está escrita.

## Paso a paso

1. **Abre el agente de código en este repositorio.**
2. **Pega el contenido completo de [`PROMPT-DE-ARRANQUE.md`](PROMPT-DE-ARRANQUE.md)** como primer mensaje. Es corto: manda al ejecutor a leer el prompt maestro y la guía.
3. **Espera la Fase 0.** El ejecutor entrega un documento (`docs/fases/FASE-0.md`, en la rama `fase-0`) con 9 apartados y **no escribe código**.
4. **Lee el documento y responde sus preguntas.** La primera es sobre la lista de palabras de pausa de comentarios (sección 6.19). La marca no se pregunta: ya está elegida.
5. **Cuando estés conforme, escribe: `apruebo la fase 0`.** Solo entonces el ejecutor pasa a la Fase 1. Con cada fase repites lo mismo: `apruebo la fase N`.

## Lo que tienes que hacer tú, fuera del código

El ejecutor te lo pedirá cuando llegue el momento. Ten presente que se necesitan cuentas tuyas:

| Cuándo | Qué | Para qué |
| --- | --- | --- |
| Fase 1 | Cuenta de Supabase y de Vercel | Base de datos y publicación |
| Fase 2 | Clave de Gemini (servidor) | La única IA de la app |
| Fase 1 (tarea 1.5) | Credenciales de entrada con Google, Apple y Facebook | Iniciar sesión (los costos de Apple y Facebook los verifica la Fase 0) |
| Fase 10 | Cuentas de Google Play y App Store, según la ruta que apruebes en la Fase 0 | Publicar |

Las migraciones de base de datos las aplicas tú en Supabase; el ejecutor te las deja listas con su vuelta atrás.

## Reglas que no se negocian

- Una tarea por respuesta, con evidencia. Si el ejecutor dice «listo» sin pegar evidencia, pídesela.
- Nada se fusiona en `main` sin tu «apruebo la fase N».
- Si el ejecutor te dice «NO VERIFICADO», significa que no pudo comprobarlo. No lo des por cierto.
- No se agrega ningún servicio de pago ni otra IA que no sea Gemini.
- El significado del nombre «norka» (palabras del mapuzungun) no se publica en la app ni en las tiendas hasta que lo confirmes con una persona hablante.

## Si algo sale mal

- **El ejecutor no encuentra la guía o el prompt:** comprueba que estén en `docs/PROMPT-MAESTRO.md` y `docs/marca/GUIA-GRAFICA.pdf`.
- **El ejecutor empieza a escribir código en la primera respuesta:** detenlo y pégale: «Ejecuta solo la Fase 0 (sección 13.0), sin código».
- **Cambió algo de la marca o de los textos:** la fuente de verdad es el PDF y el prompt maestro. Si quieres cambiar algo, se cambia primero ahí.
