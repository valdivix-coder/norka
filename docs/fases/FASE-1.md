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

El entorno de integración usa Node.js 24 y el proyecto declara Node.js 24 o superior para las herramientas instaladas. La configuración de integración solo tiene permiso de lectura del contenido del repositorio.

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
