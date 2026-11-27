# Prompt maestro especializado · candidato 7.3

Documento de diseño; la instrucción exacta está en `PROMPT-OPERATIVO-V7.3.md` (generada del código). Base: maestro 7.1 (`PROMPT-MAESTRO-IA-V7.1.md`) y cambios de 7.2 (beneficiario contextual escolar o financiero de la única persona nombrada; D-04; tipos opcionales D-03). Cambios de 7.3:

1. **El hogar por acción.** Es beneficiario solo si esta acción nombra la casa o un bien común (cocina, baño, patio, auto, luz, agua, gas, arriendo). Una compra sin decir para quién ni «para la casa» queda sin beneficiario. El validador lo verifica por cláusula (D-20).
2. **Calendario con D-04 en los datos.** `proximos` no incluye el día de semana de hoy; «el próximo <hoy>» se lee en `proximo_mismo_dia`. «el <hoy>» sin «próximo» → fecha null, hora conservada, confianza baja.
3. **Compactación.** Sin demostraciones de nombre fuera de lista ni de inyección: sus reglas siguen vigentes y el desarrollo las prueba.

Riesgo observado en la aceptación parcial: El hogar asignado a un pago no doméstico sin ancla. Candidato a corregir en 7.4 (extender la verificación por cláusula a los pagos, o regla explícita), solo con autorización.
