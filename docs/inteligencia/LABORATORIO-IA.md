# Laboratorio de IA · norka
Autorización 27-nov-2026, entrega independiente. Implementación aislada: no es una ruta de Next, ni se incorpora a la navegación o public; se genera un HTML portátil solo al ejecutar con NORKA_LABORATORIO=1. Sin despliegue público, sin API, sin persistencia. CSP bloquea conexiones, formularios y recursos externos. Las respuestas son reales ya obtenidas; solo la revisión local es simulación. No se permite captura libre ni dictado. No se habilita IA para familias reales.
## Uso
En un checkout de fase-2: npm ci; NORKA_LABORATORIO=1 npx vitest run --config evals/vitest.laboratorio.mts; abrir /tmp/norka-laboratorio/laboratorio-norka.html. Por defecto 61 capturas/122 respuestas de los tres fixtures históricos. El workflow laboratorio-sintetico descarga además el artefacto de desarrollo V7.3 (run 45994191002), suma 22 capturas/66 respuestas, y exporta HTML con 83 capturas y 188 respuestas. Para replicar localmente, descomprime ese artefacto en una carpeta y establece NORKA_REPLAY_V73 a ella. No se usa el corpus oficial ni se cambia el replay histórico (su test requiere 61 internas).
Elige conjunto, módulo y captura, selecciona versiones y capa bruta traducida/normalizada/aplicable. La tercera se calcula con planInterpretacion vigente y muestra pérdida de hora si no tiene fecha. No mide precisión de la propuesta. Contraste por orden, no alineación semántica. Revisión local de primera versión: confirmar, editar, descartar, deshacer y reiniciar. Recargar borra estado. La fuente incluye run, artefacto y SHA-256 del JSON.
## Diseño
Guía gráfica secciones 4, 5, 6, 7, 11, 12, 13: tokens existentes, noche principal, modo claro, tamaños, contraste, controles táctiles, foco, etiqueta sintética. Página portátil no usa el logotipo ni lo redibuja, usa la palabra norka en texto contextual (no como marca gráfica); fuentes de sistema cuando no están instaladas localmente, no se cargan archivos externos. La revisión visual completa de todos los patrones de navegación y las fuentes originales no está certificada: no es pantalla de producción. Para una integración visual nativa, usar Marca y componentes existentes en una futura decisión explícita.
## Verificación y reversión
Pruebas de exportación, contratos y navegador; verificar run y artefacto antes de declarar entrega aprobada. Archivo fuera de public, sin rutas nuevas. Si se revierte el commit del laboratorio se elimina el generador y la UI, sin afectar datos ni IA. No hay URL pública; descarga o abre el HTML local. La capacidad de abrir archivos HTML interactivos en iOS depende del visor; no afirmar una preview protegida hasta comprobarla.

## Actualización V7.4
Se agrega el artefacto 15215444062 de desarrollo (run 46034647175) mediante NORKA_REPLAY_V74. El generador acepta únicamente la corrida y corpus de desarrollo conocidos; espera 12 pares completos, 36 respuestas. El workflow incluye ahora 95 capturas/224 respuestas, sujeto a la validación de la nueva exportación. No incluye examen oficial.


## Cobertura de acciones · V7.5
El laboratorio presenta la cantidad de acciones entregadas y esperadas, con aviso si faltan o sobran, y permite consultar la referencia sintética. No confunde igualdad de cantidades con equivalencia de significado. No añade acciones automáticamente ni altera las salidas originales. Se prueba sobre el caso histórico V7.4 que omitía el pago y V6 que duplicaba la matriculación. Es una mejora de la experiencia de revisión experimental, no un oráculo disponible para capturas reales.

La revisión permite recuperar manualmente una acción de referencia ficticia mediante un selector. Se marca como añadida por el usuario, se puede deshacer y nunca modifica el resultado original ni sus métricas. El contador local excluye descartadas, y no certifica equivalencia semántica. No es una reparación automática ni una función habilitada para familias reales.

## V7.5 · respuestas nuevas
El workflow incluye la corrida 46037265864, 10 capturas/30 respuestas. La exportación ampliada espera 105 capturas y 254 respuestas; pendiente de nueva prueba de navegador. No incluye datos reales ni examen oficial.
