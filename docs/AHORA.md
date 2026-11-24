# Ahora

**Actualizado:** 24 de noviembre de 2026.

**Estado:** Fase 0 aprobada. Fase 1 en curso, rama `fase-1`. Última migración aplicada: **0002**, el 21 de noviembre. No hay aprobación de la fase 1 ni fusión en `main`.

**Avance visual de esta entrega**
- La raíz ya presenta la entrada de la **muestra de diseño**. `/muestra/pantallas/hoy` permite recorrer Hoy, Familia, Equilibrio, Actividad, Buscar y Perfil; Capturar abre su hoja. Avisos se abre desde la cabecera.
- Cabecera ligada al desplazamiento de 0 a 48 px; navegación de cinco destinos, transiciones, modos oscuro/claro, hojas inferiores con cierre y restauración del foco.
- En la muestra se puede agregar, editar, archivar y deshacer personas a cargo, con cumpleaños y colores; «El hogar» no se archiva. Perfil permite probar rol, participación y teléfono. Se usa el almacén en memoria acotado a una familia de ejemplo. **No guarda en Supabase; se reinicia al recargar.**
- 33 pruebas del arnés aprobadas y compilación aprobada. 9 recorridos de navegador aprobados; 24 revisiones axe sin infracciones; siete pantallas sin desbordamiento horizontal a 360 px y texto al 200 %. Capturas, grabación y resultados en [Fase 1](fases/FASE-1.md).
- Se corrigió la proporción del conjunto vertical de la marca según guía 3.4. SVG originales intactos. La revisión general del catálogo 1.3 continúa pendiente.

**Base real ya comprobada**
- Supabase norka: `yplhlooidqzqhrjbwrdp`. Migraciones 0001 y 0002 aplicadas, con RLS y aislamiento del almacén probado.
- Google habilitado; Apple y Facebook desactivados. El código de entrada y sesión propia de 1.5 sigue pendiente.
- Variables Vercel verificadas el 24 de noviembre, sin leer ni imprimir valores: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY`, para producción, vista previa y desarrollo. **No volver a pedirle a Simón que las ingrese.** Falta probar su uso desde una sesión real.

**Sigue, en orden**
1. Completar 1.5: identidad, Google, cookie propia httpOnly y pruebas de entrada/salida. La muestra visual no sustituye este paso.
2. Integrar 1.6 con la familia de sesión; completar 1.7 (crear familia e invitaciones reales).
3. Conectar las pantallas de 1.8 al servidor; completar 1.9 con el recorrido autenticado, gestos y prueba en teléfono.
4. Completar revisión de 1.3 y arnés de accesibilidad/navegador en integración continua. `npm run arnes -- --completo` todavía no está implementado.
5. Simón prueba la entrada desde su teléfono y aprueba la fase 1 antes de pasar a fase 2.

**De Simón ahora:** no se requiere una nueva decisión ni repetir la configuración técnica para avanzar en código. Más adelante: prueba real con las dos cuentas y un teléfono. Antes de datos reales, reemplazar las credenciales privadas que se compartieron en la conversación mediante los paneles protegidos.

**Fuera de esta entrega:** marca en INAPI y consolas de tiendas; significado del nombre sin confirmar (no publicarlo). No se modificó el prompt maestro, el PDF, las migraciones ni la configuración de GitHub.
