# Fase 1 — Base

## Tarea 1.1 — Estructura y arranque local

Entregada el 20 de noviembre de 2026 en la rama `fase-1`, creada desde la Fase 0 aprobada. La aprobación de la Fase 1 corresponde al final de sus nueve tareas.

### Qué se hizo

- Estructura de carpetas de la sección 9.1, con archivos `.gitkeep` para conservar en Git las carpetas vacías.
- Proyecto Next.js con App Router, React y TypeScript. Versiones exactas y archivo de instalación reproducible `package-lock.json`.
- Scripts `npm run dev`, `npm run build` y `npm start`.
- `docs/GLOSARIO.md` con los 37 términos de la tabla 5.1, copiados íntegramente.
- Actualización de `docs/AHORA.md` y `docs/IMPLEMENTATION_STATUS.md`.

Se verificaron los documentos existentes mediante sus identificadores Git. El prompt maestro conserva `342d249a085fb51dad50836c243a8059bb30465d`, la guía gráfica `af1133fb4184e7a000d7d5f1a7db16b15a3aa111` y AGENTS.md `35201db66e4860c9bee793dd74fe049ed1c7c703`.

### Versiones y documentación consultada

- Node.js 24.22.1 y npm 11.9.0 en el entorno de comprobación.
- Next.js 16.4.6, React y React DOM 19.3.1, TypeScript 7.0.2.
- Definiciones de tipos Node 24.19.2, React y React DOM 19.3.0.
- Next.js instalado, documentación `node_modules/next/dist/docs/01-app/01-getting-started/01-installation.md`, `03-api-reference/03-file-conventions/layout.md`, `03-api-reference/05-config/02-typescript.md` y `03-api-reference/05-config/01-next-config-js/agentRules.md`.
- Documentación README incluida en React, React DOM, TypeScript y los paquetes de tipos.

Se eligieron versiones estables consultadas en el registro npm. Las definiciones de Node corresponden a la versión principal del entorno. Son las herramientas de arranque del stack de la sección 2 y sus definiciones de tipos. Las herramientas de las tareas siguientes se incorporarán cuando corresponda.

### Cómo repetir el arranque

Desde la rama `fase-1`, con Node.js compatible con `package.json`, ejecutar estos comandos.

```sh
npm ci
npm run dev
```

El servidor informa su dirección local. La ruta `/` devuelve HTML con idioma `es-CL` y contenido vacío. La interfaz comienza en las tareas 1.3 y 1.9.

Para verificar la compilación y los tipos, ejecutar lo siguiente.

```sh
npm run build
./node_modules/.bin/tsc --noEmit
```

### Evidencia real

Última compilación con la configuración final, salida abreviada conservando los resultados.

```text
> norka@0.1.0 build
> next build

▲ Next.js 16.4.6 (Turbopack)
✓ Running next.config.mjs took 24ms
  Creating an optimized production build ...
✓ Compiled successfully in 333ms
  Running TypeScript ...
  Finished TypeScript in 556ms ...
  Collecting page data using 2 workers ...
  Generating static pages using 2 workers (0/3) ...
✓ Generating static pages using 2 workers (3/3) in 145ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```

`./node_modules/.bin/tsc --noEmit` terminó con código 0 y sin diagnósticos. `git diff --check` terminó con código 0.

Arranque inicial y comprobación final del servidor de desarrollo, respectivamente.

```text
> norka@0.1.0 dev
> next dev --hostname 127.0.0.1

▲ Next.js 16.4.6 (Turbopack)
- Local:         http://127.0.0.1:3000
✓ Ready in 319ms
```

```text
HTTP 200
Glosario: 37 términos coinciden con la tabla 5.1.
Documentos obligatorios: 4 de 4 presentes.
Respuesta HTML con idioma es-CL verificada.
```

Salida real al intentar el comando del arnés.

```text
npm error Missing script: "arnes"
```

El arnés se construye en la tarea 1.2. Esta entrega acredita el criterio específico de 1.1 mediante el arranque local, compilación y existencia de documentos. El arnés queda por implementar.

### Incidencias resueltas

- npm intentó usar una caché fuera del espacio de trabajo. La instalación se completó con `--cache /workspace/work/npm-cache`, fuera del repositorio.
- Next.js agregó automáticamente un bloque a AGENTS.md. Se configuró `agentRules: false`, siguiendo su documentación instalada. Next.js retiró ese bloque y se verificó que AGENTS.md coincide con el original. La lectura de las instrucciones propias del proyecto y de la documentación instalada sigue siendo obligatoria.
- Una segunda ejecución de desarrollo detectó el servidor ya activo y terminó con ese aviso. La comprobación final utilizó el servidor existente en el puerto 3000 y obtuvo HTTP 200.

### Límites y revisión

Nada visible en esta tarea. La página raíz vacía es la base técnica de arranque. Los tokens, mensajes, marca y componentes corresponden a 1.3 y las pantallas a 1.9.

NO VERIFICADO en teléfono o navegador visual. Se comprobará al incorporar la interfaz mediante capturas y recorridos de las tareas correspondientes.

La revisión de los archivos TSX confirmó componentes de servidor, importación de tipos y ausencia de estado o efectos de cliente. Las secciones visuales de la guía no se aplican a una interfaz en esta tarea.

### Lista de control de 14.2

1. Sí, solo la tarea 1.1.
2. No. El comando todavía no existe y se incorpora en 1.2. Su salida real está arriba.
3. Sí, el glosario copia la sección 5.1.
4. No aplica, sin datos de familias.
5. No aplica, sin funciones para integrantes.
6. No aplica, sin captura ni acciones implementadas.
7. No aplica, sin pantalla de producto.
8. No aplica, sin interfaz visual.
9. No aplica, sin textos de interfaz nuevos.
10. No aplica, sin valores visuales nuevos.
11. Sí, la base no guarda datos personales ni secretos.
12. Sí, estado y documento de fase actualizados.
13. No aplica, sin acciones frecuentes.
14. No aplica, sin anticipación.
15. No aplica, sin funciones de salud.
16. Sí para el nombre en minúsculas. El componente Marca corresponde a 1.3.
17. No aplica, sin reconocimiento.
18. No aplica, sin textos de interfaz nuevos.
19. No aplica, sin transiciones, cabecera ni sonidos.
20. No aplica, sin funciones ni textos de interfaz nuevos.

### Vuelta atrás y siguiente tarea

Revertir el cambio de la tarea 1.1 en la rama `fase-1` devuelve la estructura al estado anterior. Los documentos de la Fase 0 están en su rama aprobada. La siguiente tarea es 1.2, arnés mínimo.


## Tarea 1.2 — Arnés mínimo

### Alcance y autorización

Simón aprobó la opción A para agregar ESLint 10.15.0 y eslint-config-next 16.4.6. Vitest 5.1.1 forma parte del stack definido en el prompt maestro y quedó incluido en la consulta. Se registran las versiones exactas en package.json y package-lock.json.

El comando único es `npm run arnes`, usado también por `.github/workflows/arnes.yml` en cada push y pull request. Incluye generación de tipos de rutas con Next.js, TypeScript, linter sin advertencias permitidas y Vitest. El arnés detiene la ejecución con código distinto de cero al fallar un paso.

La regla de fronteras revisa el árbol de sintaxis del código. Permite rutas internas del núcleo y Zod en contratos, según 9.1. Detecta importaciones y reexportaciones, importaciones de tipos, llamadas dinámicas y require. Resuelve rutas relativas y el alias `@/` para detectar accesos desde el núcleo a otras capas. Las rutas dinámicas no verificables generan error. La prueba sobre los archivos reales no permite desactivar las reglas con comentarios de ESLint.

Hay 20 pruebas, que incluyen dependencias prohibidas, rutas internas permitidas y la excepción de contratos. Las pruebas que contienen importaciones prohibidas las presentan como texto a ESLint. El arnés no carga React en el núcleo para ejecutar esas pruebas.

### Compatibilidad y decisiones de implementación

Se detectó que typescript-eslint todavía rechaza TypeScript 7. La versión de TypeScript se ajustó a 6.0.3, compatible con el linter instalado, y se verificaron tipos y compilación. La instalación limpia con `npm ci` terminó con código 0. npm muestra advertencias de compatibilidad declarada entre ESLint 10 y algunos plugins incluidos por Next.js. La documentación instalada de Next.js indica soporte para ESLint 10 y advierte de estas declaraciones de plugins. Las comprobaciones ejecutadas pasaron.

El entorno de integración usa Node.js 24 y el proyecto declara Node.js 24 o superior para las herramientas instaladas. La configuración de integración solo tiene permiso de lectura del contenido del repositorio. GitHub señaló una advertencia de obsolescencia en las acciones v4 durante la primera comprobación. Se actualizaron a actions/checkout v7.0.1 y actions/setup-node v7.1.0, versiones estables verificadas en sus repositorios oficiales. Ambas declaran Node.js 24 en action.yml.

Se leyó la documentación incluida en los paquetes instalados, la configuración distribuida de eslint-config-next y las guías de Next.js para ESLint y `next typegen`. El linter recomendó nombrar el objeto exportado de la regla. Se corrigió ese archivo. También se reemplazó la propiedad obsoleta `argument` por `source` al revisar tipos de importación. Las pruebas conservaron sus expectativas.

### Evidencia local

Última ejecución del arnés después de retirar el archivo temporal, salida real abreviada.

```text
> norka@0.1.0 arnes
> node tests/arnes/ejecutar.mjs


Tipos de rutas
Generating route types...
✓ Types generated successfully

TypeScript

Linter

Pruebas

 RUN  v5.1.1 /workspace/work/norka


 Test Files  1 passed (1)
      Tests  20 passed (20)
   Start at  23:52:51
   Duration  1.80s (tests 94%, import 6%)


Arnés mínimo aprobado.
```

Fallo deliberado exigido por 1.2. Se creó temporalmente `src/core/domain/comprobacion-temporal.ts` con `import "react";` y se ejecutó el mismo arnés. El archivo se retiró en un bloque de limpieza garantizada y quedó fuera del cambio enviado.

```text
> norka@0.1.0 arnes
> node tests/arnes/ejecutar.mjs


Tipos de rutas
Generating route types...
✓ Types generated successfully

TypeScript

Linter

/workspace/work/norka/src/core/domain/comprobacion-temporal.ts
  1:8  error  El núcleo no puede importar react. Usa un puerto de src/core/ports  norka/fronteras

✖ 1 problem (1 error, 0 warnings)
Código de salida del fallo deliberado: 1
```

`npm run build` terminó con código 0 después del arnés. `git diff --check` terminó con código 0. Se comprobó que el archivo temporal ya no existe.

### Evidencia de integración continua

GitHub Actions terminó con resultado `success` en el commit `5d725d2`. Los pasos `npm ci` y `npm run arnes` terminaron correctamente en Ubuntu con Node.js 24. [Ver ejecución 44858323396](https://github.com/valdivix-coder/norka/actions/runs/44858323396).

```text
status: completed
conclusion: success
Run npm ci: success
Run npm run arnes: success
```

### Límites y vuelta atrás

Esta es la base mínima pedida por 1.2. Las pruebas de aislamiento se incorporan en 1.6 y las comprobaciones de interfaz y recorridos se amplían al construir las pantallas. Las reglas recomendadas de Next.js incorporan comprobaciones estáticas de accesibilidad. Los recorridos con navegador y el modo `--completo` todavía no están implementados. El comando rechaza opciones adicionales con código distinto de cero para evitar presentar una ejecución incompleta como aprobada.

Nada visible en esta tarea. La guía gráfica conserva su contenido y no se incorporaron pantallas ni valores visuales. No hay comprobación de teléfono aplicable a este cambio.

Para volver atrás, revertir los commits de 1.2 en la rama `fase-1` y reinstalar con `npm ci`. La siguiente tarea es 1.3. Las contradicciones visuales identificadas en el apartado 9 de Fase 0 necesitan resolverse antes de implementar sus valores.

### Lista de control de 14.2 para 1.2

1. Sí, solo 1.2.
2. Sí, arnés aprobado después de retirar el archivo temporal que provocó el fallo esperado. Las expectativas de las pruebas se conservaron.
3. Sí, vocabulario de producto conservado.
4. No aplica, sin datos de familias.
5. No aplica, sin funciones para integrantes.
6. No aplica, sin captura ni acciones de producto.
7. No aplica, sin pantallas nuevas.
8. No aplica, sin cambios visuales.
9. No aplica, sin textos de interfaz nuevos.
10. No aplica, sin valores visuales nuevos.
11. Sí, sin datos personales ni secretos.
12. Sí, documentos actualizados.
13. No aplica, sin acciones frecuentes.
14. No aplica, sin anticipación.
15. No aplica, sin tratamientos.
16. Sí para el nombre del producto. Sin cambios a la marca.
17. No aplica, sin reconocimiento.
18. No aplica, sin mensajes de interfaz.
19. No aplica, sin movimiento, cabecera ni sonidos.
20. No aplica, sin funciones ni textos de interfaz nuevos.

### Revisión antes de la tarea 1.3

Se revisó la versión `5d07b4c` de la rama `fase-1`. La fase 0 tiene sus nueve apartados y la aprobación registrada. La tarea 1.1 conserva sus documentos y la evidencia de arranque (HTTP 200). Se volvió a ejecutar el arnés mínimo: `Tests  20 passed (20)`. La compilación terminó correctamente y generó las tres páginas estáticas. La [ejecución de GitHub para esa versión](https://github.com/valdivix-coder/norka/actions/runs/44858464814) también terminó correctamente. El fallo deliberado está documentado arriba. Estos resultados respaldan los criterios de 1.1 y 1.2.

La guía fija una escala tipográfica cerrada en la sección 5 y medidas distintas en 7.4 (anillos), 7.16 (contador) y 7.26 (iniciales de los días). Queda pendiente la elección de Simón antes de aplicar esas medidas. Esta revisión solo actualiza documentación. Para deshacerla, revertir el cambio documental.

### Tarea 1.3 · Muestra de componentes

La ruta `/muestra` incluye un índice, las 28 fichas numeradas 7.1 a 7.28, un cambio de tema y la matriz de 4 piezas × 4 fondos. Las fuentes están alojadas en el proyecto. Los ejemplos usan datos ficticios en memoria. Los SVG se copian desde los archivos originales. La prueba de igualdad de contenido cubre los tres. El componente elige la variante reducida según el ancho disponible. Las elecciones tipográficas, el margen a 360 px y la tira de estadía quedaron documentados en [Notas de marca](../marca/NOTAS-DE-MARCA.md).

**Cómo probar.** Abrir `/muestra` con la aplicación en ejecución. En la ficha 7.11, abrir una hoja, elegir un plazo y cerrarla. En 7.26, recorrer los días de lado y tocar uno para cambiar la casa del ejemplo. En 7.28, enviar el texto de muestra, elegir «Revisar» o «Enviar igual». Los cambios de muestra se pierden al recargar.

**Evidencia a 360 px.** [Catálogo oscuro](evidencia-1-3/catalogo-oscuro.png) · [Catálogo claro](evidencia-1-3/catalogo-claro.png) · [Marca en oscuro](evidencia-1-3/marca-oscuro.png) · [Marca en claro](evidencia-1-3/marca-claro.png).

```text
Test Files  2 passed (2)
     Tests  25 passed (25)
Arnés mínimo aprobado.

✓ Generating static pages using 2 workers (5/5)
└ ○ /muestra
```

Chromium, ventana de 360 × 800 px: la página mide 360 px de ancho en ambos modos, tiene 18 px de margen a cada lado y carga sin errores de JavaScript. La prueba tocó una opción en una hoja inferior, escribió ocho dígitos, cambió una estadía y comprobó que la pausa conserva el comentario al revisar y al enviar igual. Axe-core 4.10.3, etiquetas WCAG 2 A/AA y 2.1 A/AA, devolvió cero infracciones en la vista inicial de cada tema.

**Íconos.** `npm run iconos` usa Inkscape instalado en el equipo de generación para convertir el SVG de tienda a PNG de 1024 × 1024. El favicon SVG y el PNG generados están incluidos en la rama. Ejecutar la aplicación y compilarla utiliza los archivos incluidos.

**Alcance.** La muestra permite probar presentación e interacciones locales. Los proveedores de entrada, la grabación de audio, los envíos reales, la persistencia y las vistas familiares completas corresponden a sus tareas posteriores. El botón de Google se presenta deshabilitado como ejemplo. NO VERIFICADO: funcionamiento con VoiceOver y TalkBack en teléfonos físicos. Comprobar en iOS y Android recorriendo los controles, abriendo las hojas y cambiando el día con lector de pantalla.

**Vuelta atrás.** Revertir el cambio de la tarea 1.3 en la rama de trabajo. La tarea no incluye migraciones ni cambios en servicios externos.

### Tarea 1.4 · Migración preparada, aplicación pendiente

Se entregan [0001_cuentas_y_familias.sql](../../supabase/migrations/0001_cuentas_y_familias.sql), la consulta [antes](../../supabase/verificaciones/0001_antes.sql), la consulta [después](../../supabase/verificaciones/0001_despues.sql) y [las instrucciones con vuelta atrás](../../supabase/verificaciones/0001_INSTRUCCIONES.md).

Las seis tablas usan RLS, cero políticas y acceso de lectura y escritura únicamente para el servidor. Las invitaciones tienen una relación compuesta que exige la misma familia que su creador. Se incluyen las once categorías de avisos, sus valores iniciales, revisiones para futuros controles de concurrencia y restricciones de unicidad y fechas. Las decisiones de representación están explicadas en las instrucciones.

Prueba aislada en PGlite 0.5.17 / PostgreSQL 18.7, fuera de Supabase y del proyecto de la aplicación. [Salida real](evidencia-1-4/prueba-sql.txt).

```text
OK: seis tablas protegidas, valores iniciales, lectura de servidor, 11 rechazos esperados y segunda ejecución sin pérdida de datos.
```

NO VERIFICADO: aplicación en Supabase. La tarea permanece pendiente hasta identificar el proyecto y recibir la confirmación de Simón, según el criterio de 1.4. La consulta después comprueba RLS, ausencia de políticas y permisos efectivos de los tres roles. El repositorio incluye todos los archivos para realizar ese paso.

La vuelta atrás conserva datos y protecciones. Antes del COMMIT se usa ROLLBACK. Después del COMMIT se vuelve al código anterior y se conserva el esquema aditivo. Las correcciones posteriores llevan una nueva migración.

Arnés local de la entrega, sin cambios en las pruebas existentes:

```text
Test Files  2 passed (2)
     Tests  25 passed (25)
Arnés mínimo aprobado.
```

Lista de control de 14.2 para esta tarea

1. Sí, solo 1.4.
2. Sí, arnés aprobado.
3. Sí, vocabulario del modelo de datos.
4. Parcial: relaciones familiares verificadas en la base temporal. El cerrojo del servidor corresponde a 1.6.
5. No aplica a esta entrega de esquema.
6. No aplica.
7. No aplica.
8. No aplica.
9. No aplica, sin textos de interfaz.
10. No aplica.
11. Sí, sin datos personales reales ni secretos.
12. Sí, documentos de estado y fase actualizados.
13. No aplica.
14. No aplica.
15. No aplica.
16. Sí, nombre norka en minúsculas. Sin uso nuevo de la marca.
17. No aplica.
18. No aplica.
19. No aplica.
20. Sí, las relaciones permiten distintos adultos y formas de familia.

#### Proyecto real preparado

Simón autorizó crear norka en Supabase. Se creó en Neuralia, región São Paulo, con el costo de creación informado de USD 0 mensuales y referencia `yplhlooidqzqhrjbwrdp`. Estado comprobado ACTIVE_HEALTHY, PostgreSQL 17.12.

Se ejecutaron consultas de solo lectura en el proyecto. Resultado de la comprobación previa:

```text
cuentas       existe=false
identidades   existe=false
familias      existe=false
integrantes   existe=false
invitaciones  existe=false
preferencias  existe=false
anon          bypassrls=false
authenticated bypassrls=false
service_role  bypassrls=true
```

La aplicación de 0001 continúa pendiente de Simón según 9.2.10. Se actualizó el instructivo con el enlace directo al proyecto.

Consulta de precios solicitada por Simón, 21 de noviembre de 2026. El plan pagado de entrada es Pro, USD 25 mensuales por organización, con USD 10 de crédito de cómputo. Un proyecto Micro consume aproximadamente USD 10 al mes. Tres proyectos Micro en la misma organización Pro cuestan aproximadamente USD 45 al mes antes de impuestos y consumos adicionales. Los precios de cómputo se calculan por hora. La organización conserva el plan gratuito.

Fuentes oficiales [precios](https://supabase.com/pricing) y [facturación](https://supabase.com/docs/guides/platform/billing-faq).

La documentación permite mantener una organización gratuita y otra pagada. Para tres proyectos pequeños, dos gratuitos en la primera y uno Micro en una organización Pro dan un total base de USD 25 mensuales. Los planes se aplican por organización. Esta alternativa requiere distribuir los proyectos entre ambas organizaciones y no se ha ejecutado.

#### Cierre de 1.4 · Migración aplicada y verificada

El 21 de noviembre de 2026 Simón confirmó la ejecución y entregó una captura con «Success. No rows returned». Se verificó directamente el proyecto norka. Las seis tablas devolvieron OK en la comprobación de RLS, ausencia de políticas, bloqueo de permisos a anon/authenticated y acceso del servidor. También se revisaron las restricciones y los índices, incluidos los de identidad única y familia de la invitación. [Evidencia remota](evidencia-1-4/verificacion-supabase.txt).

El asesor de seguridad devuelve seis avisos informativos rls_enabled_no_policy. Corresponden a la configuración requerida por la sección 9.2.2. [Descripción oficial](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

El arnés local pasó con 25 pruebas. La tarea 1.4 cumple su criterio de entrega. La vuelta atrás documentada conserva el esquema y los datos. Sigue 1.5, entrada y sesión propia, dentro de la autorización de continuidad de Simón. El aislamiento desde el servidor se comprobará en 1.6.

Lista de control del cierre
1. Sí, cierre de 1.4.
2. Sí, 25 pruebas aprobadas.
3. Sí.
4. No aplica al cierre documental. Las relaciones de familia están verificadas y el cerrojo del servidor corresponde a 1.6.
5. No aplica.
6. No aplica.
7. No aplica.
8. No aplica.
9. No aplica.
10. No aplica.
11. Sí.
12. Sí.
13. No aplica.
14. No aplica.
15. No aplica.
16. Sí, nombre norka. Sin cambios de marca.
17. No aplica.
18. No aplica.
19. No aplica.
20. Sí, sin cambios a reglas ni textos de coordinación.

### Avance autorizado de 1.5, 1.6 y 1.8

Simón autorizó agrupar el trabajo independiente dentro de la fase 1. Se mantiene la aprobación escrita como puerta de la fase 2.

**1.5, dependencia externa.** Se consultó el endpoint público de ajustes de Supabase y confirmó google=false, apple=false, facebook=false. El entorno local carece de las variables de acceso necesarias. Las búsquedas por norka y parentis en la conexión de Vercel no devolvieron proyectos. NO VERIFICADO: entrada real, salida, sesión y enlace de identidades. Se requiere habilitar Google y configurar las variables privadas antes de comprobar el recorrido.

**1.6, almacén.** Se creó el puerto AlmacenFamilia, el adaptador en memoria y el adaptador REST de Supabase para personas a cargo y ámbitos. El adaptador se crea con una familia fija, filtra cada consulta y verifica también las respuestas. Las actualizaciones exigen la revisión anterior y devuelven conflicto con la versión actual cuando existe. El adaptador en memoria evita compartir referencias mutables. Ocho pruebas nuevas cubren estos casos. Se usa fetch de la plataforma, sin dependencias adicionales.

El adaptador del servidor recibe su clave de servicio desde configuración privada. Sus errores no copian respuestas del servidor. .env.example incluye únicamente nombres de variables. NO VERIFICADO: integración contra las tablas reales, pendiente de 0002 y de configurar la clave privada en el servidor. La fábrica debe recibir la familia de la sesión verificada al conectar las pantallas. La tarea 1.6 tiene sus piezas y pruebas, y conserva pendiente esa integración.

**1.8, preparación.** Se entregó 0002 con sus consultas antes/después y vuelta atrás. Crea personas_a_cargo y ambitos, RLS y permisos de servidor, y un disparador transaccional que crea El hogar y los ocho ámbitos para cada familia. Incluye familias anteriores. Protege el hogar contra borrado, archivo y cambio de tipo. El núcleo valida cumpleaños y guarda con revisión. NO VERIFICADO: aplicación en Supabase y pantallas de agregar, editar y archivar. [Instrucciones de 0002](../../supabase/verificaciones/0002_INSTRUCCIONES.md).

**Evidencia**

```text
Test Files  3 passed (3)
     Tests  33 passed (33)
Arnés mínimo aprobado.
```

La primera ejecución de las pruebas nuevas encontró que Vitest no resolvía el alias de importación usado por los adaptadores. Se corrigieron los imports del código a rutas relativas. Las expectativas de las pruebas se conservaron.

[Pruebas del almacén](evidencia-1-6/almacen.txt) · [Prueba local de migración 0002](evidencia-1-8/prueba-0002.txt).

**Aplicación de 0002.** Aplicada y verificada en Supabase el 21 de noviembre de 2026 con autorización escrita de Simón. Resultado OK en ambas tablas, y prueba funcional revertida: una familia nueva recibe 1 hogar y 8 ámbitos, y el hogar no se puede borrar ni archivar. [Evidencia](evidencia-1-8/aplicacion-0002-supabase.txt).

**Historial.** Se registró 0001 en el historial de Supabase sin repetir su SQL, y los archivos del repositorio quedaron sin begin/commit para coincidir con lo guardado. Mapa en [HISTORIAL.md](../../supabase/migrations/HISTORIAL.md).

**Límites y vuelta atrás.** 0002 ya está aplicada. Las pantallas y recorridos autenticados necesitan 1.5. El trabajo de código se puede revertir mediante su commit. Tras aplicar 0002, conservar los datos y volver al código anterior, como detalla el SQL.

**Lista de control**
1. Sí, agrupación autorizada dentro de fase 1.
2. Sí, 33 pruebas.
3. Sí.
4. Sí en el almacén y pruebas locales. Integración con sesión pendiente.
5. No aplica, sin pantallas nuevas.
6. No aplica, sin captura nueva.
7. No aplica.
8. No aplica.
9. No aplica.
10. No aplica.
11. Sí.
12. Sí.
13. No aplica.
14. No aplica.
15. No aplica.
16. Sí, nombre norka.
17. No aplica.
18. No aplica, sin textos de interfaz.
19. No aplica.
20. Sí, sin textos de juicio ni cambios de trato.

### Auditoría de avance · 24 de noviembre de 2026

Se sincronizó el checkout con los commits remotos posteriores `848a066` y `33b2977`. Se verificó el proyecto Supabase activo y las tablas ambitos y personas_a_cargo con RLS, cero políticas y permisos esperados, ambas con resultado OK. Por tanto, la aplicación de 0002 está resuelta.

Vercel tiene proyecto norka, dominio verificado norka-kappa.vercel.app y despliegue READY de la rama fase-1, commit 33b2977. Se consultaron solo metadatos de variables: figura SUPABASE_URL. Google, Apple y Facebook aparecen false en los ajustes públicos de Supabase. NO VERIFICADO: acceso real, sesión y creación de familia. Se comprueba con el recorrido de teléfono una vez implementado y configurado.

Arnés local, ejecutado durante la auditoría:

```text
Test Files  3 passed (3)
     Tests  33 passed (33)
Arnés mínimo aprobado.
✓ Compiled successfully in 846ms
✓ Generating static pages using 2 workers (5/5)
```

Estado por tarea: 1.1 y 1.2 con comprobaciones técnicas aprobadas. 1.3 tiene catálogo y evidencia previa, pero requiere completar la revisión de valores sueltos en CSS y tamaños del conjunto de marca antes del cierre visual. 1.4 completada. 1.5 carece todavía de código de entrada/sesión. 1.6 tiene puerto y dos adaptadores con pruebas locales, falta integración real. 1.7 pendiente. 1.8 tiene migración y validación, faltan pantallas. 1.9 pendiente. La raíz devuelve null y la única pantalla construida es el catálogo /muestra.

La documentación anterior era demasiado amplia al presentar la base visual como cerrada. La evidencia demuestra un catálogo construido, y la revisión final de fidelidad sigue pendiente. El arnés actual tampoco ejecuta accesibilidad automática ni admite --completo. Las 33 pruebas no acreditan un recorrido autenticado completo.

Orden de trabajo: reglas y pruebas de identidad/sesión (1.5), integración de almacén (1.6), creación e invitación (1.7), personas (1.8), navegación y estados (1.9), revisión visual y recorridos de fase. Las credenciales externas bloquean la prueba real, pero permiten avanzar con reglas y pruebas independientes.

Acción de Simón: configurar Google mediante su cuenta en Google Cloud y Supabase, ingresando credenciales en los paneles protegidos. URL de retorno del proveedor: https://yplhlooidqzqhrjbwrdp.supabase.co/auth/v1/callback. Las variables privadas del servidor también deben configurarse en Vercel. El asistente prepara el código y verifica el resultado. Las decisiones de producto ya resueltas se conservan.

La auditoría actualiza documentación y estado. Para revertirla, revertir su commit documental.

#### Google habilitado · 24 de noviembre de 2026

Simón confirmó guardar la configuración de Google. Se consultó el endpoint público de ajustes de Supabase y devolvió google=true, apple=false, facebook=false. No se guardaron credenciales en el repositorio. Esta comprobación confirma la habilitación del proveedor. NO VERIFICADO: validez del secreto, acceso de una cuenta de prueba y regreso a la aplicación. Se comprueba con el recorrido real cuando esté implementado.

#### Actualización de claves de servidor

Se consultó la [guía oficial de migración de claves](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys). Para el servidor se usará una clave Secret (sb_secret_) mediante SUPABASE_SECRET_KEY. El adaptador REST envía la clave únicamente en apikey, compatible con la clave nueva y con el mecanismo anterior de API key. Se agregó una comprobación de encabezados para evitar enviar una clave opaca como JWT. La instrucción anterior de usar una clave Legacy queda reemplazada. Pendiente ingresar la clave privada en Vercel y verificar la conexión real. No se cambia el esquema de datos.

### Implementación gráfica y recorrido de muestra · 24 de noviembre de 2026

**Alcance autorizado.** Simón pidió avanzar con todas las tareas gráficas posibles dentro de fase 1 y retomar desde el punto de interrupción. Esta entrega desarrolla la presentación de 1.8 y 1.9 y corrige la composición de marca de 1.3. No declara completas 1.5, 1.7, 1.8 ni 1.9; falta el recorrido autenticado. No adelanta funcionalidades de fases posteriores.

**Qué se construyó**

- Entrada en `/` con el conjunto vertical oficial, frase de guía 10.8 y acceso al recorrido de diseño. Identificación explícita de muestra: no simula Google ni guardado en la familia real.
- `/muestra/pantallas/hoy`, `familia`, `equilibrio`, `actividad`, `buscar`, `avisos`, `perfil`, `persona`. Cinco destinos en la barra; Capturar abre hoja inferior.
- Cabecera fija, cambio continuo logotipo/isotipo entre 0 y 48 px, áreas seguras, tres acciones, flecha de regreso y navegación que conserva la familia de muestra.
- Transiciones nativas cuando el navegador las admite, coordinadas con la llegada de la página; alternativa de fundido/desplazamiento. Movimiento reducido respetado. Hojas con física 380/32/1, botón Cerrar, Escape y foco restaurado.
- Personas a cargo: nombre, tipo, cumpleaños, año opcional, colegio, color; agregar, editar, archivar y deshacer. Se reutilizan `guardarPersona`, `validarPersona` y el adaptador en memoria con cerrojo de familia. El hogar no se archiva. Se pueden cargar ejemplos explícitos.
- Perfil de ejemplo: nombre, rol y etiqueta propia, participación, teléfono con +56 9 o formato internacional, cambio de tema. Los cambios se conservan durante el recorrido, no al recargar.
- Buscar encuentra las personas del ejemplo sin distinguir mayúsculas o tildes. No se presenta como la búsqueda completa de fase 3.
- Controles de revisión para vacío, datos, cargando, error y sin conexión; límites indicados en los estados. En Hoy/Equilibrio/Actividad/Avisos no se inventan tareas, proporciones ni actividad real: siguen vacíos en fase 1.

**Guía aplicada:** 3.4–3.8, 4.1/4.4/4.6, 5, 6, 7.1/7.4/7.9–7.14/7.16/7.23, 8, 9.1/9.3, 10.6/10.8, 11, 12 y 13. Los archivos SVG se conservan idénticos a `docs/marca/svg/`. No se editó el PDF.

**Comprobación real**

```text
Test Files  3 passed (3)
     Tests  33 passed (33)
Arnés mínimo aprobado.
✓ Compiled successfully
✓ Generating static pages using 2 workers (5/5)
Recorridos de navegador: 9 aprobados
Revisiones axe-core 4.10.3: 24; infracciones: 0
Errores de ejecución en el navegador: 0
Texto al 200 %: 7 pantallas, ancho 360 px, sin desbordamiento horizontal
```

- [Arnés completo de esta ejecución](evidencia-1-9/arnes.txt) y [compilación](evidencia-1-9/compilacion.txt).
- [Resultados de navegador](evidencia-1-9/resultados.json), [medición de texto al 200 %](evidencia-1-9/texto-200.json) y [grabación del recorrido](evidencia-1-9/recorrido-360.webm).
- [Entrada](evidencia-1-9/entrada-oscuro-360.png), [Hoy](evidencia-1-9/hoy-oscuro-360.png), [Familia en claro](evidencia-1-9/familia-claro-360.png), [cabecera recogida](evidencia-1-9/cabecera-recogida-360.png), [hoja para agregar persona](evidencia-1-9/agregar-persona-360.png). El directorio incluye capturas oscuras/claras de las ocho vistas.
- Prueba reproducible: `NORKA_URL=http://localhost:3192 NORKA_AXE=/tmp/norka-axe.js PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/norka-playwright python tests/navegador/recorrido-fase-1.py`, con el servidor compilado, Playwright Python, Chromium y axe-core ya disponibles en este entorno. No se agregaron dependencias al proyecto. Para video se reutilizó `/usr/bin/ffmpeg` mediante un enlace en la caché del espacio de trabajo.
- La ejecución valida cumpleaños, crear/editar/archivar/deshacer, hogar protegido, búsqueda, teléfono, tema, Escape/foco y cabecera. Durante la preparación del guion se corrigieron un selector ambiguo que incluía el anunciador interno de rutas de Next y una espera de navegación antes de medir el desplazamiento. Se conservaron todas las expectativas. El linter detectó uso de una referencia durante render y un enlace interno sin Link; se corrigió el código, sin relajar comprobaciones.

**Infraestructura comprobada.** Los metadatos de Vercel confirman `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY` en los tres entornos. La clave secreta figura como sensible en producción y vista previa. No se leyeron ni imprimieron valores. La instrucción anterior de pedir estas variables queda resuelta. No se modificaron credenciales ni tablas en esta entrega.

**Límites**

- Es una muestra navegable, no una sesión real. Entrada, vinculación de identidades, creación/invitación de familia y persistencia en Supabase siguen pendientes. No introducir datos reales en el recorrido de ejemplo.
- No se guardan capturas ni se envían invitaciones. Las funciones de captura, actividad, equilibrio, avisos, logros y tratamientos se completan en sus fases.
- NO VERIFICADO: iPhone/Android reales, lector de pantalla real, 60 fps o metas de rendimiento. Se comprueba con los recorridos en dispositivos físicos al cerrar la fase.
- NO COMPLETADO: gesto de volver desde el borde, transición compartida tarjeta/detalle, revisión completa del catálogo antiguo y arnés de navegador/accesibilidad integrado en `npm run arnes -- --completo`. El guion Python es una comprobación adicional, no reemplaza ese requisito.
- El estado «con datos» solo muestra lo implementado en fase 1; no acredita cinco estados del producto completo. La vista de entrada corresponde a la muestra, no sustituye los botones oficiales de acceso de 1.5.
- No se ha medido con 1, 2, 3 y 6 integrantes reales. No se declara alcanzado un estándar de premios ni cerrada la fase 1.

**Lista de control 14.2**

1. **Sí:** tareas gráficas de fase 1 agrupadas por autorización de Simón.
2. **Sí:** 33 pruebas; sin cambios a las pruebas existentes para hacerlas pasar.
3. **Sí:** vocabulario de la interfaz centralizado.
4. **Sí en la muestra:** personas con familia_id y almacén acotado. **No** en sesión real, aún no implementada.
5. **No:** falta recorrido autenticado con diferentes cantidades de integrantes.
6. **No aplica** al guardado sin conexión de captura, que pertenece a fase 2. La muestra funciona sin IA.
7. **No:** estados visuales de revisión disponibles, pero faltan estados con datos reales de la aplicación.
8. **Sí en Chromium:** oscuro/claro, 360 px, axe y texto ampliado; teléfonos físicos no verificados.
9. **Sí:** textos sin juicio, presión ni estructura familiar supuesta.
10. **No para el conjunto del proyecto:** nuevos componentes usan tokens; catálogo antiguo pendiente de revisión completa.
11. **Sí:** sin datos prohibidos ni secretos en archivos o navegador.
12. **Sí:** AHORA, IMPLEMENTATION_STATUS y FASE-1 actualizados.
13. **No:** botones y deshacer local comprobados; faltan gestos completos del producto.
14. **No aplica:** no se agregó anticipación.
15. **Sí:** no se agregaron consejos ni campos de salud.
16. **Sí:** componente Marca, tres archivos SVG originales sin cambios de geometría, nombre en minúsculas.
17. **Sí:** no hay comparación, vigilancia ni contadores por integrante.
18. **Sí:** textos de interfaz en es-CL.ts; nombres de ejemplo identificados como datos de prueba.
19. **No como cierre de toda la tarea:** cabecera y transiciones construidas con tokens; quedan la transición compartida y el gesto de regreso. No se agregan sonidos.
20. **Sí:** textos compatibles con adultos separados, sin tomar partido ni exponer a nadie.

**Vuelta atrás.** Revertir el commit de esta entrega en `fase-1` y volver al despliegue anterior si se publicó la vista previa. No hay migraciones ni datos reales que revertir; el contenido de la muestra desaparece al recargar. `main` se conserva intacta.

**Siguiente trabajo autorizado:** 1.5 (entrada/sesión), después conexión real de 1.7 y 1.8. No hace falta que Simón repita la configuración ya realizada; la prueba en teléfono se solicita cuando exista el recorrido real.

**Publicación comprobada:** [vista previa del commit 66620bf](https://norka-7ezygypbv-neuralia1.vercel.app/) en estado READY. Entrada y Familia devolvieron HTTP 200 mediante el conector autenticado. [Evidencia del despliegue](evidencia-1-9/despliegue.txt). Vercel puede pedir acceso: la protección original se mantiene. No se promovió a producción ni se fusionó `main`.


## Tarea 1.5 · Entrada con Google y sesión propia

Entregada el 24 de noviembre de 2026 en la rama `fase-1`. **No está cerrada:** el criterio «se puede entrar y salir en el teléfono con Google» solo lo puede comprobar Simón. Hasta entonces la tarea queda en estado *entregada, espera prueba real*.

### Qué se hizo
- **Núcleo** (`src/core/`): dominio de cuentas e identidades, puertos de cuentas, sesiones y reloj, y los casos de uso `resolverEntrada` («una persona, una cuenta», 6.16), `unirIdentidad` (Perfil › Formas de entrar) y `abrirSesion`/`validarSesion`/`cerrarSesion`.
- **Flujo**: Supabase Auth hace de intermediario con Google (PKCE). norka lee quién es la persona y **descarta los tokens**; abre una sesión propia en cookie `httpOnly` (`norka_sesion`). Protocolo comprobado en el código fuente oficial de `@supabase/auth-js` 2.119.2: `GET /auth/v1/authorize` con `code_challenge` (s256) y `POST /auth/v1/token?grant_type=pkce`. No se agregó ninguna dependencia.
- **Rutas**: `/api/entrar/[proveedor]` (inicio), `/api/entrar/retorno` (vuelta), `/api/salir` (POST, solo desde este sitio). **Pantallas**: `/entrar` (botón solo si el proveedor está configurado) y `/cuenta` (quién eres, formas de entrar, «Salir»).
- **Migración 0003** `sesiones`: solo se guarda el hash SHA-256 del token; RLS sin políticas; permisos solo para el servidor. Aplicada y verificada: [evidencia](evidencia-1-5/aplicacion-0003-supabase.txt).
- **Variables**: `ENTRADA_GOOGLE=activa` cargada en Vercel (producción, vista previa y desarrollo). `.env.example` documenta `SUPABASE_PUBLISHABLE_KEY` y los tres interruptores, sin valores.

### Evidencia
- Arnés: tipos, linter, 61 pruebas (28 nuevas) y compilación aprobados: [salida](evidencia-1-5/arnes.txt).
- Pruebas del núcleo pedidas por 1.5: correo que ya existe con otro proveedor (se suma la identidad, una sola cuenta), correo distinto (cuenta nueva) y unir dos formas de entrar desde Perfil. Además: correo no confirmado (se rechaza), entradas simultáneas, normalización del correo, caducidad y cierre de sesión, vector de prueba RFC 7636, y que ni los registros ni los errores contienen tokens.

### Límites y NO VERIFICADO
- **NO VERIFICADO:** entrada real con Google de punta a punta. Este entorno no alcanza a Supabase ni a Google. Se comprueba al entrar desde el teléfono y revisando los registros de autenticación.
- **NO VERIFICADO:** que la URL del sitio y las URL de redirección estén guardadas en Supabase (`https://norka-kappa.vercel.app/**`). Sin ellas, Supabase no devuelve a la persona al sitio.
- La entrada solo funciona desde un dominio incluido en esa lista (no en cualquier URL de vista previa).
- Mientras «Vercel Authentication» siga activa, quien no sea del equipo de Vercel no podrá abrir el sitio.
- Apple y Facebook: el núcleo y las rutas los admiten tras su variable, pero **no hay botón** hasta contar con su recurso oficial (6.16 prohíbe dibujarlos).
- Unir dos cuentas con datos propias no está construido: si esa identidad ya pertenece a otra cuenta, se rechaza con un mensaje.
- Crear la cuenta y su identidad son dos pasos; si el segundo falla, el siguiente intento lo repara (se reconoce el correo confirmado).
- **Decisión pendiente de Simón:** duración de la sesión, hoy 30 días (`DURACION_SESION_MS`). Las sesiones caducadas se limpiarán con el proceso diario de la Fase 3.

### Vuelta atrás
Revertir el commit de 1.5 devuelve el código. La tabla `sesiones` puede quedar (no estorba); sin datos reales se elimina con `drop table public.sesiones;`. Quitar `ENTRADA_GOOGLE` en Vercel oculta el botón de inmediato.

## Tarea 1.6 · Almacén de familia autorizado por sesión

Entrega del 24 de noviembre de 2026 (Chile). Se conservan el puerto de almacén,
los adaptadores Supabase/memoria y el control de revisión existentes. Se añade
el enlace de autorización: cookie httpOnly → hash → sesión vigente → cuenta →
pertenencia activa a la familia → almacén acotado. No se recibe cuenta_id desde
el navegador. Una familia seleccionada no constituye autorización.

`src/lib/familia/servidor.ts` ofrece `almacenFamiliaActual(familiaId)` a las futuras
acciones de 1.7/1.8. La capa de núcleo valida sesión y pertenencia al abrirlo y
antes de cada lectura, creación o edición. Rechaza sesiones cerradas/caducadas,
integrantes retirados y accesos a otra familia. Una respuesta de red fallida
impide continuar. Se corrige también el rechazo de fechas de sesión no finitas
y respuestas cuyo hash no coincide. Las entradas de escritura se copian antes
de esperar, evitando mutaciones del objeto durante la autorización.

El adaptador de pertenencias consulta únicamente cuenta_id, familia_id y estado,
con filtros exactos y sin caché. No obtiene teléfonos ni perfiles. Solo el
servidor utiliza la clave secreta. No hay dependencia nueva ni cambio visual.

### Evidencia y alcance

- [Arnés](evidencia-1-6/arnes.txt): tipos, linter y 86 pruebas (25 nuevas).
- [Compilación](evidencia-1-6/compilacion.txt).
- [Supabase real](evidencia-1-6/supabase.txt): cuatro tablas con RLS, cero políticas,
  sin SELECT para anon/authenticated y SELECT para service_role.
- Pruebas nuevas: dos familias; IDs ajenos y manipulados; cuenta con varias
  pertenencias; retirada, cierre y caducidad después de abrir el almacén;
  fallo de red; respuestas inesperadas; ediciones concurrentes; cookie ausente;
  recorrido integrado cookie → hash → REST de sesión/pertenencia → datos acotados.
- Las pruebas existentes no se modificaron para hacerlas pasar.

**Límites:** no hay prueba con Google y dos cuentas reales todavía. Las pruebas
REST usan respuestas controladas. El acceso seguro está preparado para las
acciones de servidor; conectar la muestra con datos reales corresponde a 1.7/1.8.
La autorización y la operación REST son solicitudes sucesivas, no una única
transacción: una retirada simultánea entre ambas puede dejar terminar una
operación ya autorizada. Se vuelve a comprobar en la siguiente operación.
No se declara cerrada la fase 1 ni implementado el arnés `--completo`.

**Migraciones:** ninguna necesaria. Simón autorizó expresamente que el asistente
aplique las futuras migraciones de norka con consultas antes/después y evidencia;
se registra en AHORA. No se cambió el prompt maestro ni GitHub.

**Control 14.2:** 1 Sí, solo 1.6; 2 Sí, pruebas aprobadas; 3 Sí; 4 Sí, pertenencia y
almacén acotado; 5 Sí en pruebas de pertenencia, NO VERIFICADO recorrido con varias
cuentas reales; 6 No aplica, sin captura ni IA; 7 No aplica, sin pantalla nueva;
8 No aplica; 9 Sí; 10 No aplica, sin cambios visuales; 11 Sí; 12 Sí;
13 No aplica; 14 No aplica; 15 Sí; 16 No aplica, marca intacta;
17 Sí; 18 No aplica, sin textos nuevos de interfaz; 19 No aplica; 20 Sí.

**Vuelta atrás:** revertir el commit de 1.6. No hay datos ni migración que revertir.
**Siguiente tarea:** 1.7, crear familia y aceptar invitaciones con dos cuentas,
utilizando este punto de acceso. La prueba real de entrada/salida sigue pendiente
para cerrar 1.5 y, posteriormente, la fase 1.


## Tarea 1.7 · Familia, invitaciones y perfil

Entregada el 25 de noviembre de 2026 en `fase-1`. **No está cerrada:** el criterio «dos cuentas distintas quedan en la misma familia y cada una ve el teléfono de la otra» está probado en el núcleo y en la base, pero falta la prueba real con dos cuentas de Google.

### Qué se hizo
- **Núcleo**: crear familia (quien la crea es administrador), generar invitación (solo administrador; código en claro una sola vez, en la base solo su hash; caduca a los 7 días), aceptar invitación de un solo uso, ver familia (solo integrantes; así se ven los teléfonos) y editar el propio perfil con control de revisión. Reparto inicial de cuotas en partes iguales (suma 100).
- **Teléfono**: prefijo «+56 9» fijo con 8 dígitos exactos u «Otro país» con número internacional; se guarda como «+569XXXXXXXX». Cumpleaños: día y mes juntos, 29 de febrero válido.
- **Migración 0004**: cuatro funciones atómicas (crear familia con su administrador y aceptar invitación bloqueando la fila). Aplicada y verificada: [evidencia](evidencia-1-7/aplicacion-0004-supabase.txt).
- **Pantallas**: `/familia/nueva`, `/familia/[id]` (integrantes con teléfono, invitar), `/familia/[id]/perfil`, `/invitacion/[codigo]`; `/cuenta` enlaza a la familia. Tras entrar con Google se vuelve a la invitación (solo rutas de invitación; sin redirecciones abiertas).
- **Evidencia**: arnés con 107 pruebas, tipos, linter y compilación aprobados ([salida](evidencia-1-7/arnes.txt)).

### Límites y NO VERIFICADO
- **NO VERIFICADO:** flujo real con dos cuentas de Google en el teléfono.
- No incluye retirar integrantes, cambiar el nombre de la familia ni cambiar la participación desde el perfil (esto último toca las cuotas: tarea 4.5).
- Una cuenta con familia no puede crear otra desde la pantalla.
- Los enlaces de WhatsApp y llamada son de la tarea 3.10; aquí solo se muestra el número.
- Pasos 4 a 7 de la creación de familia (6.1) pertenecen a tareas posteriores.
- Existe una migración paralela `norka_*` (ver evidencia); su retiro está pendiente de confirmar.

### Vuelta atrás
Revertir el commit devuelve el código. Las funciones de 0004 solo se agregan: no estorban y se retiran con los `drop function` del pie de su SQL si no hay familias reales.

## Tarea 1.8 · Revisión de continuidad (25 de noviembre de 2026)

**En curso; no entregada.** Revisión independiente del commit `4bd3783` de `fase-1`.

- Supabase: historial real confirma 0002 (`20261121131915`) y 0004 (`20261125113029`). No volver a aplicarlas. Ambas tablas de 1.8 tienen RLS activa y SELECT denegado a anon/authenticated, permitido al servidor. Los disparadores `familias_inicializar` y `personas_proteger_hogar` están activos. Las cuatro funciones de 0004 y las dos funciones paralelas `norka_*` tienen EXECUTE restringido al servidor; no se retiraron funciones ni se alteraron datos.
- La evidencia previa de 0002 acredita un hogar automático, ocho ámbitos y rechazo del archivo del hogar. Las pruebas anteriores de 1.7 acreditan invitaciones y teléfonos con datos sintéticos; todavía falta el recorrido real de dos cuentas.
- GitHub Actions: [ejecución 45610637314](https://github.com/valdivix-coder/norka/actions/runs/45610637314), success para `4bd3783`. Vercel: [vista previa de 1.7](https://norka-qeypbp2lr-neuralia1.vercel.app/), READY para el mismo commit; no promovida a producción.
- La muestra usa `crearAlmacenMuestra` en `ContextoRecorrido.tsx`; sus cambios no persisten. Existe `almacenFamiliaActual(familiaId)` y `guardarPersona`. Siguiente implementación: conectar lectura de personas y ámbitos, creación, edición, archivo y deshacer a acciones de servidor autorizadas, mantener la revisión de concurrencia y el hogar protegido; comprobar persistencia al recargar, aislamiento entre familias y ausencia de datos de ejemplo en el recorrido real. Reutilizar los componentes y valores de marca existentes, sin cambiar la muestra de diseño ni adelantar la fase 2.
- **Bloqueo:** el PDF oficial `docs/marca/GUIA-GRAFICA.pdf` existe (blob `af1133fb4184e7a000d7d5f1a7db16b15a3aa111`), pero el conector devuelve contenido vacío en base64 y la descarga directa no está disponible. No se pudo abrir ni leer el PDF; el entorno local tampoco resuelve github.com para clonar e instalar. Según regla 0.11 no se modifican pantallas sin la guía. Se requiere el PDF adjunto o un entorno de ejecución con acceso al archivo y a las dependencias. No se realizó ningún cambio de código, de datos ni de configuración de despliegue; no se fusiona main.

Vuelta atrás: esta revisión solo modifica documentación.

## Tarea 1.8 · Conexión de personas y ámbitos reales (25 de noviembre)

**Implementación enviada; aceptación pendiente.** El propietario adjuntó la guía gráfica v2.0. Se abrió el PDF, se verificaron sus 45 páginas y su blob Git coincide exactamente con af1133fb4184e7a000d7d5f1a7db16b15a3aa111. Se reutilizan componentes y tokens de guía 4.3, 4.4, 7.1, 7.9, 7.11, 7.12, 8.1, 11 y 12; no se cambia la marca ni la muestra visual.

- Se conecta la pantalla autenticada de familia a `almacenFamiliaActual`: personas a cargo y ámbitos se consultan de Supabase sin usar ejemplos. Crear, editar y archivar invocan acciones de servidor; deshacer comprueba la revisión y no sobreescribe cambios concurrentes. Los campos y colores se validan en el servidor. El hogar conserva su color de marca y no se archiva. Los ámbitos se leen de la base; su edición completa corresponde a 3.7.
- Commit de núcleo `25df549`: seis nuevas pruebas, aislamiento, edición/archivo/restauración, validación, protección del hogar, conflicto y tokens; [CI 45649020178](https://github.com/valdivix-coder/norka/actions/runs/45649020178) reportó 113/113 pruebas, TypeScript y linter aprobados.
- Commit de interfaz `48d4d8b`: la compilación detectó cinco mensajes ubicados en el bloque incorrecto de es-CL. Corregidos en `ee2a7c4`; [Vercel preview READY](https://norka-li3yb5yf4-neuralia1.vercel.app/) para ese commit, compilación correcta. [CI 45649227357](https://github.com/valdivix-coder/norka/actions/runs/45649227357): success para el commit corregido ee2a7c4.
- No se necesitan migraciones adicionales: 0002 está aplicada y verificada. No se modificaron datos, variables de entorno ni permisos. No se eliminan funciones paralelas de 1.7.
- **NO VERIFICADO:** entrada con dos cuentas reales, persistencia de CRUD al recargar desde el teléfono, captura/recorrido autenticado, revisión a 360 px, texto al 200 %, cinco estados y fluidez de interfaz. La cabecera y navegación autenticadas completas son 1.9. No hay acceso local a GitHub/npm ni a una sesión real de Google. El formulario existente conserva su interacción de guardado; la respuesta optimista y revisión visual requieren comprobación. No se cierra 1.8 ni se fusiona main. Para volver atrás, revertir los commits de código y conservar las tablas y datos.

## Tarea 1.9 · Recorrido autenticado y movimiento (25 de noviembre de 2026)

**Implementación técnica entregada; aceptación en teléfono pendiente.** Se conserva el alcance de la sección 13.1 del prompt maestro: pantallas vacías de producto, sin implementar captura real, actividad, tareas ni cálculos de carga de fases futuras. Guía gráfica original de 45 páginas, hash Git coincidente. Secciones aplicadas: 3.8, 4.6, 6.4, 7.9, 7.11, 7.13, 7.14, 7.16, 8.2, 9.1–9.3, 10, 11 y 12.

### Código y diseño
- Marco compartido entre muestra y familia autenticada. En la familia real, pestañas Hoy/Familia/Equilibrio/Actividad; Capturar abre una hoja que explica que todavía no guarda. Buscar consulta personas a cargo reales, Avisos presenta estado vacío y Perfil conserva el formulario autorizado y ajustes de tema. Entrada de cuenta con familia enlaza a Hoy. Fichas de persona real autorizadas por sesión, pertenencia e ID, sin personas archivadas.
- Cabecera 56/44 px, recorrido 0–48 px, paralaje existente al 30 % anulado cuando se solicita movimiento reducido. Se conservan tokens 8 px/220 ms y 24 px/320 ms; se corrige sentido de regreso. Gesto de borde (solo subpantalla; no interfiere con formularios, evita gestos verticales; umbral elegido de mitad de ancho y resorte compartido 380/32/1); botón equivalente siempre visible. View Transition compartida de la ficha real cuando el navegador la admite y las vistas están disponibles; si se cancela o demora, no se bloquea la navegación. Se cancelan transiciones anteriores ante navegación rápida. No se redibuja la marca ni se cambian SVG.
- Estados de carga, error y sin conexión con salida; los datos de familia no se almacenan en una caché de navegador para simular uso sin conexión. Títulos de documento genéricos por pantalla, sin nombres privados en títulos.
- Cinco pruebas nuevas del arnés (rutas, aislamiento muestra/real, dirección, umbral de gesto y ficha). Nuevo flujo `.github/workflows/navegador-fase-1.yml` solo en rama fase-1, permisos de lectura; Playwright 1.51.0 y axe-core 4.10.3 en directorios aislados, sin cambios de dependencias de producción. El servidor HTTPS local de prueba solo devuelve datos sintéticos, no usa Supabase real, no contiene credenciales, no se empaqueta ni se llama en producción.

### Evidencia comprobada
- [Arnés 45655348451](https://github.com/valdivix-coder/norka/actions/runs/45655348451), código `f4a4f05`: tipos, linter, 9 archivos y 118/118 pruebas aprobados.
- [Vercel READY](https://norka-anjeoshv4-neuralia1.vercel.app/), mismo commit: compilación correcta de rutas dinámicas de familia, ficha/perfil y demás pantallas. No se promocionó a producción.
- [Navegador 45655348697](https://github.com/valdivix-coder/norka/actions/runs/45655348697), mismo código, success. Resultado: 9 vistas a 360 px (ancho documento = 360 en todas); 6 controles funcionales; 9 auditorías axe A/AA con 0 infracciones; 0 errores de ejecución JS. Redirección sin sesión; apertura/cierre de Capturar sin guardado; cabecera recogida a 48 px y retorno al inicio; ficha desde Familia y Buscar; tema claro, movimiento reducido y aviso sin conexión; rechazo de familia ajena. [Artefacto descargable: capturas, resultados JSON y grabación](https://github.com/valdivix-coder/norka/actions/runs/45655348697/artifacts/15042048974).
- Incidencias resueltas: linter rechazó JSX dentro de try/catch (se separó consulta del render); Playwright 1.51.0 incompatible con Ubuntu 26.04 del runner (se fijó Ubuntu 24.04); axe detectó falta de título de documento en nueve vistas (se agregaron títulos genéricos en metadata y se repitió la misma prueba sin relajar expectativas). Se inspeccionaron las capturas de la ejecución anterior: familia contiene etiquetas repetidas y tarjetas altas; optimización visual pendiente, sin desbordamiento a 360 px.

### Límites, control y vuelta atrás
NO VERIFICADO: 60 fps, gesto físico y transición compartida en teléfono real, lector de pantalla físico, texto al 200 % en el recorrido real (sí existe evidencia anterior de muestra), prueba de Google real y persistencia de acciones 1.8 con dos cuentas. El vídeo de CI es de navegador móvil emulado, no sustituye la grabación del teléfono. No se declara 1.9 cerrada según su criterio ni se declara aprobada la fase 1. La revisión completa del catálogo 1.3 y el comando arnés completo quedan pendientes. No se modificaron Supabase, variables, secretos, permisos, producción, main, guía ni prompt maestro. Vuelta atrás: revertir commits de 1.9 en fase-1, preservar 1.7/1.8 y migraciones; el workflow de prueba se puede revertir por separado. Siguiente: validaciones y aprobación de fase 1.

## Revisión de cierre de fase 1 — 25 de noviembre de 2026

Commit `1b29b00`: se implementa `npm run arnes -- --completo` con ejecución mínima, build y dos recorridos de navegador, siempre REST TLS local y credenciales ficticias; CI usa Ubuntu 24.04. No se modifican las pruebas anteriores para conseguir aprobación; se añaden comprobaciones. Catálogo 28 fichas con sección 7 y 16 combinaciones de marca en cada tema. Equilibrio texto 200 %. Se compacta la separación de ficha y elimina tipo duplicado de hogar con tokens de guía 6.1, 7.9, 12; marca intacta. Se corrige duplicación en el documento de estado.

Evidencia: [arnés mínimo](https://github.com/valdivix-coder/norka/actions/runs/45680886800), [arnés completo](https://github.com/valdivix-coder/norka/actions/runs/45680886725), success para `1b29b00`.

```
Tests 118 passed (118)
10 vistas: ancho 360 px
7 controles funcionales
0 errores JS
10 auditorías de vistas: infracciones []
Catálogo oscuro: 28 componentes, 16 marca, ancho 360, infracciones []
Catálogo claro: 28 componentes, 16 marca, ancho 360, infracciones []
Arnés completo aprobado.
```

[Artefacto](https://github.com/valdivix-coder/norka/actions/runs/45680886725/artifacts/15054821112); [Vercel READY](https://norka-3wkufoea9-neuralia1.vercel.app/). No equivale a auditoría exhaustiva de valores visuales, lector físico, rendimiento 60 fps ni autenticación real. Se revalidó la infraestructura sin modificarla. El código de fase 1 está entregado; no se cumple la puerta formal de 13.1. Vuelta atrás: revertir `1b29b00` conservando las migraciones y los datos. No se fusiona ni inicia la fase 2. [Informe global](../INFORME-IMPLEMENTACION.md).

## Incidencia 1.5 — retorno de Google a pantalla blanca (25 de noviembre de 2026)

**Evidencia y diagnóstico:** la captura del propietario, 17:50 Chile, muestra `norka-kappa.vercel.app` con pantalla blanca. Vercel: ese alias apunta a producción `dpl_EJ3oDTRuFk354ZCh45AvgSUcRDsh`, commit `33b2977` de fase-1, cuya raíz `src/app/page.tsx` retorna null; no contiene la interfaz ni ruta de inicio de OAuth actual. El alias estable de pruebas apuntaba a `9825fee`, con diseño y autenticación nuevos. main sigue en `4f01b11`. Supabase Auth registró dos secuencias de redirección 302 a las 20:47 y 20:49 UTC (17:47 y 17:49 Chile), referer `https://norka-kappa.vercel.app`, sin evidencia de canje PKCE posterior en esa ventana. No se guardan códigos, correos ni tokens en este informe. La causa comprobada de la pantalla blanca es el destino antiguo. La causa probable del desvío es el retorno de preview no autorizado y fallback al Site URL; NO VERIFICADO: lista actual de Redirect URLs y Site URL en panel (conector no expone lectura/escritura de Auth config). Documentación oficial: https://supabase.com/docs/guides/auth/redirect-urls.

**Corrección de código `b1b8b1d`:** se normaliza el origen antes de establecer la cookie httpOnly PKCE, conserva únicamente invitaciones válidas, no traslada la vinculación de identidades entre orígenes ni reenvía códigos. Maneja excepciones de configuración/retorno con error visible y reintento, no-cache/no-referrer en redirecciones, límite de 10 s por petición de canje y de cuentas/sesiones; si la raíz nueva recibe código o error OAuth fuera del callback, vuelve al inicio de sesión con aviso. No cambia la política de sesión ni elimina RLS. Cinco pruebas nuevas de origen estable, configuración segura y redirección de invitación. Se creó y comprobó en Vercel la variable no secreta `NORKA_ORIGEN_ENTRADA` exclusivamente para preview de `fase-1` con valor `https://norka-git-fase-1-neuralia1.vercel.app`. [Despliegue READY](https://norka-cdoo8zfoo-neuralia1.vercel.app/), mismo commit. Arnés mínimo aprobado; consultar salida de pruebas en CI. [CI mínimo](https://github.com/valdivix-coder/norka/actions/runs/45699265142), [arnés completo](https://github.com/valdivix-coder/norka/actions/runs/45699264979).

**Acción pendiente del propietario:** abrir https://supabase.com/dashboard/project/yplhlooidqzqhrjbwrdp/auth/url-configuration, agregar en Redirect URLs exactamente `https://norka-git-fase-1-neuralia1.vercel.app/api/entrar/retorno` y guardar, si aún no figura. No cambiar Site URL, no quitar entradas existentes, no modificar credenciales de Google ni desactivar protección Vercel. Iniciar en Safari desde https://norka-git-fase-1-neuralia1.vercel.app/entrar, completar Google y confirmar llegada a Tu cuenta en el mismo dominio. NO VERIFICADO: OAuth real en iPhone. Si persiste, registrar dominio y hora sin compartir código ni token. No se fusiona main, no se cambia alias de producción, no se aplican migraciones. Vuelta atrás: revertir commit de corrección y quitar únicamente la variable preview creada si corresponde. La aceptación de 1.5 queda bloqueada hasta verificar retorno real.
