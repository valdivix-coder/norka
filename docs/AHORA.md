# Ahora

**Actualizado:** 25 de noviembre de 2026.

**Estado:** Fase 0 aprobada; fase 1 con sus nueve tareas implementadas, pendiente de aceptación y revisión final. Rama `fase-1`. No hay autorización de fusionar main ni iniciar fase 2. Última migración aplicada: 0004.

**Vista previa de código comprobada:** https://norka-anjeoshv4-neuralia1.vercel.app/ (READY, `f4a4f05`). Enlace estable de la rama: https://norka-git-fase-1-neuralia1.vercel.app/ . Vercel Authentication sigue activa; no se cambió la protección.

**Tarea 1.9 — entrega técnica**
- Recorrido autenticado: Hoy, Familia, Capturar (hoja informativa, sin guardar hasta fase 2), Equilibrio, Actividad, Buscar personas, Avisos, Perfil real y ficha de persona a cargo. Marco y marca compartidos con la muestra; ninguna ruta autenticada usa datos de ejemplo.
- Cabecera ligada a 0–48 px, navegación con transiciones y cancelación de transición ante toques rápidos, regreso desde el borde y preferencia de movimiento reducido. Transición compartida de ficha en navegadores compatibles; fallback si la carga es lenta. Tema durante la navegación.
- Cargando con silueta, error con reintento, sin conexión con aviso y salida. Cada ruta lee con sesión y pertenencia activa. No se agrega captura real, tareas ni sugerencias fuera de fase 1.
- [Arnés 45655348451](https://github.com/valdivix-coder/norka/actions/runs/45655348451): **118/118 pruebas, tipos y linter aprobados**.
- [Navegador 45655348697](https://github.com/valdivix-coder/norka/actions/runs/45655348697): **9 vistas a 360 px sin desbordamiento, 6 controles funcionales, 9 revisiones axe WCAG A/AA sin infracciones y 0 errores de JavaScript**. Se usó Chromium móvil emulado y REST TLS local con una familia ficticia, no Supabase real ni Google. [Capturas, resultados y grabación](https://github.com/valdivix-coder/norka/actions/runs/45655348697/artifacts/15042048974).
- En la muestra se conservan los recorridos históricos (9 recorridos, 24 revisiones axe, 200 % comprobado en la entrega de muestra del 24 de noviembre). No se confunde esa evidencia con la entrega autenticada.

**Base real**
- Supabase norka: `yplhlooidqzqhrjbwrdp`. 0001, 0002, 0003 y 0004 aplicadas y verificadas; RLS y aislamiento comprobados. No reaplicar. Migración paralela con funciones `norka_*`: no retirada.
- Variables Vercel verificadas el 24 de noviembre, sin leer ni imprimir valores: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` en producción, vista previa y desarrollo. No pedir que se ingresen de nuevo.
- Google habilitado; Apple y Facebook desactivados. 1.5 entregada; falta entrar y salir con Google en teléfono. 1.7 entregada; falta prueba de dos cuentas y teléfonos. 1.8 entregada técnicamente; falta CRUD y persistencia con una sesión real.
- La guía gráfica original se abrió y verificó (45 páginas; blob `af1133fb4184e7a000d7d5f1a7db16b15a3aa111`); SVG originales intactos.

**Sigue, en orden**
1. Completar revisión del catálogo 1.3; verificar recorrido autenticado con texto al 200 %, gesto físico, transición compartida y fluidez de 60 fps en teléfono. Compactar la sección de personas a cargo (duplicación de etiqueta de hogar y tarjetas altas) sin alterar la guía. El arnés de navegador está en CI independiente, pero `npm run arnes -- --completo` aún no está implementado.
2. Simón prueba 1.5, 1.7, 1.8 y 1.9 en teléfono con cuentas reales. Antes de datos reales, reemplazar credenciales privadas compartidas mediante paneles protegidos; verificar que el dominio de vista previa esté permitido en la redirección de Google/Supabase.
3. Solo tras validar y recibir «apruebo la fase 1», considerar fusión en main y fase 2.

**Autorización vigente:** el asistente puede aplicar migraciones de norka con verificaciones antes/después e historial. No autoriza fusionar main ni pasar a fase 2. No se modificaron migraciones, datos, variables, configuración del proyecto, marca ni prompt maestro en 1.9. Se agregó un flujo CI de navegador aislado, sin credenciales, en el repositorio. Ver [Fase 1](fases/FASE-1.md).
