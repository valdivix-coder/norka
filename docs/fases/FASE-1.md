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
