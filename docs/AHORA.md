# Ahora

**Actualizado:** 24 de noviembre de 2026.

**Estado:** Fase 0 aprobada. Fase 1 en curso, rama `fase-1`. 1.4 completada, última migración aplicada 0002 (21 de noviembre). Núcleo de almacén de 1.6 implementado y probado. Migración 0002 de 1.8 aplicada y verificada en Supabase; faltan las pantallas de personas. 1.5 necesita configurar Google, que está desactivado en Supabase. Referencia del proyecto `yplhlooidqzqhrjbwrdp`.

**Hecho**
- Prompt maestro v7 en `docs/PROMPT-MAESTRO.md`.
- Guía gráfica v2.0 en `docs/marca/GUIA-GRAFICA.pdf`.
- Marca decidida: logotipo «norka» e isotipo «Órbita».
- Repositorio renombrado a «norka» (20 de noviembre de 2026).
- Archivos SVG exactos de la marca en `docs/marca/svg/`.
- Instrucciones para agentes (`AGENTS.md`) y guía de arranque (`docs/ARRANQUE.md`).
- Documento de [Fase 0](fases/FASE-0.md), con fuentes, mapa de pantallas y preguntas. Última migración: 0002.
- Siete decisiones de Simón registradas en el apartado 2 de la Fase 0. El prompt maestro se acepta como base general.

- Estructura de 9.1, glosario con 37 términos y base Next.js comprobada con HTTP 200. Evidencia y vuelta atrás en [Fase 1](fases/FASE-1.md).

**Auditoría actual:** repositorio sincronizado con `33b2977`. Supabase activo, 0002 verificada con dos resultados OK. Vercel tiene proyecto norka y despliegue READY desde fase-1 en `norka-kappa.vercel.app`. Solo figura SUPABASE_URL entre sus variables. Google, Apple y Facebook siguen desactivados. Arnés local: 33 pruebas aprobadas. Compilación aprobada.

**Sigue, en orden**
1. 1.5: implementar reglas de identidad, sesión y pruebas mientras Simón configura Google en Supabase. Usar configuración privada del servidor. Entrada real en teléfono pendiente.
2. 1.6: integrar almacén con la familia de sesión y probarlo contra Supabase.
3. 1.7: crear familia e invitación de un uso con caducidad, y probar con dos cuentas.
4. 1.8: completar pantallas de agregar, editar y archivar personas a cargo.
5. 1.9: navegación, cabecera, estados vacíos y recorridos de teléfono.
6. Antes de cerrar: completar revisión de 1.3 (valores visuales fuera de tokens) y arnés de navegador/accesibilidad. Simón recorre el producto y aprueba la fase 1.
7. La aplicación de 0002 y su historial ya están resueltos. La fase 2 requiere aprobación escrita de la fase 1.

**Pendiente fuera del código**
- Verificar el registro de marca en INAPI y el título exacto en las consolas de tiendas. La Fase 0 documenta los dominios y coincidencias encontrados.
- Confirmar con una persona hablante de mapuzungun el significado del nombre antes de publicarlo.
