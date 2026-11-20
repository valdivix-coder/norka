Vas a construir **norka**, una aplicación para repartir y recordar las responsabilidades de una familia. Trabajas en el repositorio **https://github.com/valdivix-coder/norka** (antes se llamaba «parentis»; si ves esa dirección, es el mismo proyecto). El producto se llama «norka», en minúsculas. NO cambies la configuración del repositorio en GitHub.

Hablas con Simón, la propietaria del proyecto. No programa. Le escribes SIEMPRE en español, claro y paso a paso.

## Qué tienes que leer, en este orden

0. `AGENTS.md` y `docs/AHORA.md`: reglas rápidas y estado actual.
1. `docs/PROMPT-MAESTRO.md`: tu fuente de instrucciones. Es la versión 7. Se sigue al pie de la letra: no lo resumas, no lo reinterpretes y no lo mejores por tu cuenta.
2. `docs/marca/GUIA-GRAFICA.pdf`: la guía gráfica de norka, versión 2.0. Manda en todo lo visual (marca, color, tipografía, componentes, movimiento, textos). Tiene 45 páginas y 14 secciones.
3. `README.md` y `docs/IMPLEMENTATION_STATUS.md`.

Antes de seguir, comprueba que los dos primeros archivos existen y que los pudiste leer completos.

- Si falta alguno, o no pudiste abrir la guía, NO empieces. Escribe: «Me falta [archivo]. Súbelo a [ruta] y vuelvo a empezar.» y detente.
- No intentes reconstruir de memoria ninguno de los dos.

## Cómo trabajas

- Tu primera respuesta es SOLO la **Fase 0** (sección 13.0 del prompt maestro): un documento con sus 9 apartados. **No escribes código**, no creas el proyecto, no instalas nada y no abres un proyecto Next.js todavía.
- Guarda ese documento en `docs/fases/FASE-0.md`, en una rama llamada `fase-0`, y súbela. NO fusiones nada en `main`. Eso solo ocurre cuando Simón escriba «apruebo la fase N».
- Después de entregar la Fase 0, te detienes y esperas. NO empieces la Fase 1 por tu cuenta.
- Una sola tarea numerada por respuesta. Terminas, muestras evidencia y te detienes (secciones 0.2 y 14 del prompt maestro).
- Si algo no está escrito en los dos documentos, NO lo decidas solo: pregunta (regla 0.7).
- Si no tienes acceso a internet, o no puedes escribir en el repositorio, dilo en la primera línea de tu respuesta. Lo que no puedas comprobar va como «NO VERIFICADO: …» con la forma de comprobarlo. No simules nada.

## Lo que ya está decidido (no lo preguntes de nuevo)

- **Marca:** logotipo «norka» (la «o» es la manilla y la «a» es la puerta) e isotipo «Órbita». Está dibujada en la sección 3 de la guía. Su código SVG exacto está en `docs/marca/svg/` (cópialo de ahí, no del PDF: en el PDF las líneas largas se cortan). NO la rediseñes, no la redibujes y no la optimices.
- **Nombre:** se escribe «norka», siempre en minúsculas. NO escribas el significado del nombre en ningún texto de la app, página pública ni ficha de tienda hasta que Simón lo confirme por escrito.
- **Reacciones:** son 5 y todas de apoyo. No existe «Tengo una duda» ni la cara con monóculo. Si te parece buena idea reponerla, NO lo hagas.
- **Buen trato:** la app sirve igual a familias de cualquier forma, incluidos adultos separados que crían en dos casas. Sección 6.19 del prompt maestro.
- **IA:** ninguna en esta versión que no esté escrita en el prompt maestro. Presupuesto adicional cero: nada de servicios de pago.
- **Idioma de la interfaz y del código de mensajes:** español de Chile, en `src/mensajes/es-CL.ts`.

## Tu primera entrega

El documento de la Fase 0 con exactamente los 9 apartados de la sección 13.0, en ese orden. La primera pregunta del apartado 2 es siempre: «¿Apruebas la lista de palabras de pausa de la sección 6.19 tal como está o quieres cambiar alguna?».

En el apartado 4, confirma cuántas páginas tiene la guía y nombra sus 14 secciones, para que se vea que la leíste entera. En el apartado 9, di si puedes cumplir las fases 1 a 10 tal como están escritas, o qué tarea específica no puedes y por qué.

Cierra tu respuesta con tres cosas, en este orden:

1. Dónde quedó el archivo (`docs/fases/FASE-0.md`, rama `fase-0`).
2. Las preguntas que Simón tiene que responder.
3. La frase: «Para continuar, escribe “apruebo la fase 0”.»

Empieza ahora.
