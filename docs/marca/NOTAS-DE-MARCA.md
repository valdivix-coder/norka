# Decisiones de la tarea 1.3

- Simón eligió las medidas tipográficas específicas de las fichas 7.4, 7.16 y 7.26. La sección 5 rige los demás textos.
- Simón eligió 18 px de margen lateral a 360 px según la sección 6.1.
- Para conciliar 7.26 con la accesibilidad de la sección 12, Simón delegó el criterio técnico. La tira mantiene los 14 días en orden, en una fila desplazable. Cada celda visual mide 18 × 28 px y su botón mide al menos 44 × 44 px. Cada día se abre con un toque o con teclado.
- En claro, la pastilla de casa usa tinta para leer el nombre y conserva el color de la casa en el borde. La sección 12 pide contraste de texto también en claro.
- Fuentes variables Figtree y Bricolage Grotesque distribuidas con sus licencias OFL en `public/fuentes`. Se cargan desde la aplicación.
- La sección 7.24 muestra un botón de ejemplo deshabilitado. El recurso gráfico de Google se copió del paquete oficial sin editar. [Pautas de Google](https://developers.google.com/identity/branding-guidelines)

## Recorrido visual de fase 1 · 24 de noviembre

Simón pidió avanzar con la implementación gráfica de las pantallas y delegó las decisiones técnicas, manteniendo el prompt y la guía como base oficial. Se conserva el alcance de fase 1: estados vacíos y formularios de personas, sin adelantar captura, actividad, carga ni tratamientos reales.

- Se corrige solo la composición CSS del conjunto vertical: lado del isotipo = 2h, separación = 0,5h, donde h es el alto del logotipo. Ningún SVG cambia.
- Cabecera: alturas 56/44 px, recorrido 48 px, fondo al 85 %, desenfoque 16 px; botones de 44 px. Barra de 80 px y Capturar de 64 px.
- Las ilustraciones de estados vacíos son geometrías originales de círculos, arcos y trazos, según 8.2; no son variantes de la marca. Una señal lima por ilustración.
- Se reutiliza el límite de columna de 42rem del catálogo para pantallas grandes. A 360 px se conservan los 18 px aprobados. No se crea una retícula de escritorio distinta.
- El hogar conserva #A7A3C2 también en claro (guía 4.4), para mantener contraste del ícono noche.
- Se mantienen las dos fuentes locales. Las dimensiones, colores y movimiento de los nuevos componentes salen de `tokens.css`; geometrías SVG en su lienzo propio según 8.1/8.2.
- La muestra identifica explícitamente los datos de ejemplo. Capturar y la invitación explican su disponibilidad; no muestran confirmaciones de guardado real ni generan invitaciones falsas.

Pendiente antes de declarar fidelidad completa: revisión de valores sueltos del catálogo antiguo; gesto de volver desde el borde; transición compartida de tarjeta a detalle; medición de 60 fps en teléfono real. No se declara cerrada la revisión visual de toda la aplicación.
