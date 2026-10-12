<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Instrucciones de desarrollo para agentes que trabajen en este repositorio. Priorizar corrección, legibilidad y simplicidad.

Commit & Ship es un agregador de novedades tech (Hacker News, GitHub Releases, dev.to, blogs oficiales). Solo agrega y enlaza: no publica notas propias, no tiene cuentas ni suscripciones y usa solo APIs gratuitas. Es un proyecto personal de portfolio: no diseñar una plataforma comercial ni incorporar funcionalidades no solicitadas.

## 1. Contexto, documentación y diseño

- Antes de implementar comportamiento, leer `DESIGN.md` (sistema de diseño). Todavía no hay documento funcional; si una tarea depende de comportamiento no definido, preguntar antes de inventarlo. Si se crea uno, la ruta es `docs/FUNCIONALIDAD.md`.
- `AGENTS.md` explica cómo desarrollar; `DESIGN.md` explica cómo se ve. No mezclar ambos.
- El diseño fuente está en Penpot y se sincroniza a mano con `src/app/globals.css`, los componentes y `DESIGN.md`. No iniciar un rediseño por iniciativa propia.
- Una solicitud explícita del usuario puede cambiar una decisión anterior. Si el cambio es claro, actualizar el documento correspondiente en la misma tarea. Si hay contradicción o ambigüedad material, explicarla y preguntar.
- No debilitar estas reglas ni agregar excepciones a este archivo sin autorización.
- No modificar el bloque `nextjs-agent-rules` de arriba: lo gestiona `next dev`.

### Idioma y nombres

- Código, comentarios, commits y nombres de archivos y carpetas nuevos en inglés. Mantener nombres coherentes para los conceptos del dominio: `newsItem`, `source`, `release`, `ranking`, `topic`, `snapshot`.
- Contenido de la interfaz en español: etiquetas, botones, ayudas, errores y textos accesibles.
- Documentación del proyecto (`README.md`, `AGENTS.md`, `DESIGN.md`) y respuestas de entrega de los agentes en español. Conservar identificadores, comandos y nombres técnicos originales.
- **Archivos y carpetas en kebab-case**: `news-item.tsx`, `use-news-feed.ts`, `news-feed/`. Dentro del código, los componentes se nombran en PascalCase, los hooks con prefijo `use` y el resto en camelCase. Excepciones: nombres convencionales como `AGENTS.md`, `README.md`, `DESIGN.md` y archivos propios de Next (`page.tsx`, `layout.tsx`).
- Los comentarios en el código solo explican una decisión, restricción o motivo que no es evidente; si el código puede reescribirse para explicarse solo, se prefiere eso.
- No incorporar internacionalización sin necesidad y autorización explícitas.

## 2. Forma de trabajo y límites de autonomía

- Antes de editar, revisar estado de Git, estructura existente, `package.json`, lockfile, scripts y configuración relevante. Comprobar qué versiones están realmente instaladas. Next 16 tiene cambios incompatibles: leer la guía en `node_modules/next/dist/docs/` antes de usar una API.
- Para tareas de varias partes, explicar alcance y riesgos. Hacer el cambio mínimo coherente que resuelva la tarea completa.
- No instalar, agregar, actualizar, reemplazar ni eliminar dependencias, herramientas o servicios sin autorización explícita (incluye dev, CLIs y navegadores de prueba). Eso cubre `zod`, `cva`, `lucide-react` y similares: están planificados, pero se agregan al usarlos por primera vez y con aprobación.
- No eludir la regla con `npx`, `pnpm dlx`, generadores ni cambios indirectos del lockfile. Antes de proponer una dependencia, explicar el problema, la alternativa con lo existente y el costo de mantenimiento.
- "Latest" no implica compatible: antes de subir una versión mayor revisar peers. Hoy están fijados a propósito TypeScript `~6.0.3` (`typescript-eslint` exige una versión menor a 6.1), ESLint 9 (los plugins de `eslint-config-next` no soportan 10) y lint-staged 16 (la 17 exige Node 22.22.1 o superior).
- Respetar pnpm y el formato configurado. No regenerar el lockfile, no reformatear todo el repositorio, no duplicar librerías.
- No desplegar ni tocar recursos de producción (Vercel, GitHub) sin autorización explícita para esa acción.
- Preservar cambios previos del usuario. No revertir ni borrar trabajo ajeno.
- Preguntar ante comportamiento no definido, costos o riesgo de pérdida de datos. Para detalles locales reversibles, seguir las convenciones existentes.

### Git

- Flujo trunk-based: sin ramas de feature ni pull requests. Todo el trabajo se commitea directamente en `main`, en work units con Conventional Commits. El CI corre únicamente sobre `push` a `main`.
- Preguntar antes de cada commit. Nunca hacer push sin aprobación.
- Commits chicos, con sentido propio, en Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `ci:`), con tests y docs junto al código. Cuerpo con líneas de hasta 100 caracteres (commitlint).
- Un work unit debe poder revisarse de una vez (orientativo, ~400 líneas); si no entra, dividirlo en varios commits.
- Antes de hacer push, `lint`, `typecheck`, `format:check` y `test` deben estar en verde: sin PR, esos checks locales y los hooks son la única barrera previa a `main`.
- `gh` puede estar autenticado con otra cuenta distinta del dueño del repo (`FavioMagallanes`): verificar antes de cualquier push.
- Los documentos de tareas de trabajo quedan fuera del repo.

## 3. TypeScript y contratos

- Mantener `strict: true`. No desactivar verificaciones para resolver errores. No usar `any`, explícito ni implícito, en código propio, pruebas ni mocks.
- Tipar props, parámetros, callbacks y límites de módulos. Aprovechar la inferencia cuando sea precisa; usar retornos explícitos cuando estabilicen un contrato público.
- Usar `unknown` para datos realmente desconocidos y validarlos antes de operar. Las respuestas de APIs externas son `unknown` hasta pasar por su esquema Zod; una aserción `as` no sustituye una validación.
- No ocultar errores con `as any`, `as unknown as T`, `@ts-ignore`, aserciones no nulas injustificadas ni desactivaciones amplias del linter. `@ts-expect-error` solo en pruebas deliberadas del sistema de tipos, con explicación.
- Preferir uniones discriminadas para variantes incompatibles (por ejemplo, el estado de una fuente: cargando, ok, error con snapshot). Evitar objetos con muchos campos opcionales que permitan combinaciones inválidas.
- Inferir tipos desde los esquemas Zod en lugar de mantener contratos equivalentes a mano. Contener los tipos inseguros externos en el adaptador de cada fuente, sin propagarlos al dominio.
- TypeScript está fijado en `~6.0.3` (ver sección 2). Mantener los tests bajo verificación de tipos: ejecutar pruebas no reemplaza `pnpm typecheck`.
- Proponer `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes` si faltan; conservarlos si ya están habilitados.

## 4. Componentes, funciones y hooks

- Todos los componentes propios son funcionales, con función flecha y exportación nombrada: `export const NewsItem = ...`. Sin componentes de clase ni `export default` para componentes propios.
- Los archivos especiales de Next (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) y los de configuración exigen `export default`: ahí es la convención del framework, no una excepción a pedir.
- Funciones y hooks propios como funciones flecha asignadas a `const`. Exportar solo lo que necesite otro módulo.
- Retorno implícito cuando la expresión es breve y clara. No comprimir validaciones, ternarios anidados ni efectos en una línea.
- Un componente, función o hook tiene una responsabilidad coherente. Sin límites arbitrarios de líneas ni un archivo por helper.
- Server Components por defecto. `"use client"` solo donde haga falta interactividad, estado, efectos o APIs del navegador, y lo más abajo posible en el árbol.
- Favorecer componentes presentacionales que reciben datos y callbacks. Extraer reglas de dominio (normalización de fuentes, orden, filtrado, búsqueda, fechas) a funciones puras. La lógica local de UI (abrir un menú, alternar el tema, foco) puede quedarse en el componente.
- Los hooks coordinan con React y con TanStack Query; las reglas reutilizables deben poder ejecutarse como funciones puras sin montar React.
- Efectos solo para sincronizar con sistemas externos, no para guardar valores derivados ni copiar datos remotos a otro estado.
- El proyecto usa React Compiler: no agregar `memo`, `useMemo` ni `useCallback` por rutina; solo ante una necesidad concreta y medida.
- Variantes de componentes con `cva` y clases condicionales con `cn()` (`clsx` + `tailwind-merge`). No instalar shadcn.

### HTML semántico

- Usar el elemento HTML que corresponda al significado, no al aspecto: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `ul`/`ol`/`li`, `h1`–`h6`, `time`, `button`, `a`, `form`, `label`, `input`.
- Un solo `main` y un solo `h1` por página. Los títulos siguen una jerarquía sin saltos de nivel; el tamaño visual se resuelve con clases, no cambiando el nivel del título.
- Cada noticia es un `article` con su título como encabezado. Las listas de noticias, filtros y radar son `ul`/`ol`. Las fechas van en `time` con `dateTime` en formato ISO.
- Navegar es `a` con `href`; ejecutar una acción es `button`. Nunca `div` o `span` con `onClick`. Los controles de formulario llevan `label` asociado.
- `section` y `nav` adicionales llevan nombre accesible (`aria-label` o `aria-labelledby`) cuando hay más de uno del mismo tipo en la página.
- ARIA solo cuando el HTML nativo no alcanza; no reemplazarlo ni repetirlo. Iconos decorativos con `aria-hidden`; iconos que son el único contenido de un control, con nombre accesible en el control.
- Imágenes y logos con `alt` descriptivo, o `alt=""` si son decorativos.
- Estructura de landmarks y jerarquía de títulos verificadas en los tests de componentes con `getByRole`.

Ejemplo del estilo (archivo `news-title.tsx`):

```tsx
type NewsTitleProps = {
  title: string;
  href: string;
};

export const NewsTitle = ({ title, href }: NewsTitleProps) => (
  <a className="text-ink hover:text-accent-text" href={href}>
    {title}
  </a>
);
```

## 5. Programación funcional, DRY y simplicidad

- Preferir funciones puras, composición, transformaciones explícitas e inmutabilidad de datos compartidos. Aislar red, caché, reloj y demás efectos de las reglas de cálculo.
- No mutar props, estado de React ni la caché de consultas. La mutación local de un objeto nuevo y no compartido es aceptable.
- DRY aplica al conocimiento y a las reglas, no a cualquier similitud de sintaxis. Una pequeña duplicación de interfaz puede ser mejor que una abstracción llena de flags.
- Extraer código compartido ante responsabilidad compartida real, no por usos futuros imaginarios.
- Sin fábricas, contenedores de inyección, repositorios genéricos ni capas que solo reenvían argumentos. Sin librerías de programación funcional.
- Evitar nombres genéricos como `manager`, `helper` o `utils` cuando la responsabilidad puede nombrarse por su función.

## 6. Arquitectura basada en funcionalidades

Organizar el código por capacidades del producto: el árbol debe mostrar noticias, fuentes, radar de versiones, ranking, conversación y tema antes que capas técnicas globales. Sin imponer Clean Architecture.

Ejemplo orientativo, no una orden de crear todos estos directorios:

```text
src/
  app/                          # Rutas, layout, providers, globals.css
  features/
    news-feed/
      components/
        news-item.tsx
      hooks/
        use-news-feed.ts
      api/                      # Adaptadores por fuente (con Zod)
      model/                    # Tipos, esquemas y reglas puras
      tests/
        unit/
        integration/
        e2e/
    search-filters/             # Búsqueda y filtros por tema (nuqs)
    release-radar/
    trending/
    conversation/
    theme/
  shared/
    ui/                         # Button, Chip, Pill, Icon...
    lib/                        # Módulos específicos (cn, dates...)
    tests/
```

- Crear solo lo necesario. Una feature chica empieza con pocos archivos. No rehacer estructura válida ya existente solo por coincidir con el ejemplo.
- Las utilidades compartidas viven en `src/shared/lib/` y los fixtures y pruebas compartidas en `src/shared/tests/`.
- Mantener juntos UI, acceso a datos y reglas de una feature. Sin carpetas globales gigantes de `components`, `hooks` y `services`.
- `shared` no importa features. Se reserva para primitivas de UI y utilidades realmente compartidas.
- Evitar ciclos entre features. Los flujos transversales se componen en `app` o en la feature dueña. Una feature usa a otra solo por un contrato público pequeño, no por sus archivos internos.
- Sin `index.ts` masivos que reexporten todo.
- Las reglas puras no dependen de React ni de TanStack Query. Los componentes presentacionales no hacen `fetch` directo: los datos llegan por la capa de datos de la feature.

## 7. Datos, estado y URL

- Un adaptador por fuente en `api/` de su feature: llama a la API, valida con Zod y devuelve el modelo de dominio normalizado. Un cambio en la API externa se corrige solo en su adaptador.
- Los datos base se obtienen en el servidor con Cache Components (`use cache`) y revalidación. La capa en vivo del cliente usa TanStack Query y el snapshot del servidor como respaldo.
- TanStack Query gestiona los datos remotos del cliente. No duplicarlos en estado local, Context ni otro store.
- Filtros, tema seleccionado y búsqueda viven en la URL con nuqs, para que sean compartibles. El estado local alcanza para interacciones locales.
- Las claves de consulta distinguen los datos que representan (fuente, filtros, página).
- Derivar valores calculables (conteos, orden, filtrado) de sus entradas en vez de sincronizar copias con efectos.
- La búsqueda es una función propia, insensible a acentos y mayúsculas, sin librerías.
- Manejar carga, error, vacío y datos incompletos como estados distintos, con los componentes de estado del diseño (skeleton, vacío, banner de error). Si una fuente falla, mostrar contenido cacheado con el banner; no mostrar errores como listas vacías. Una fuente caída no debe tirar el resto de la página.
- Fechas: guardar y comparar instantes en UTC; formatear para el usuario en el límite de la UI. Tratar fechas inválidas o ausentes como datos incompletos, no como "ahora".
- Renders y consultas no producen efectos secundarios fuera de la caché.

## 8. Seguridad y APIs externas

- Sin cuentas ni datos personales de usuarios. No guardar ni registrar datos personales.
- Solo APIs gratuitas y públicas. Verificar el contrato, los límites de uso y los términos de una fuente antes de adoptarla (Bluesky y Mastodon están pendientes de verificar).
- No incluir secretos ni claves en el código, logs, fixtures o repositorio. Una variable `NEXT_PUBLIC_*` no debe contener secretos. Mantener un `.env.example` sin credenciales reales.
- Tratar todo contenido externo (títulos, descripciones, HTML de feeds) como no confiable: sin `dangerouslySetInnerHTML` con datos externos; validar y normalizar los enlaces (solo `http` y `https`); enlaces externos con `rel="noopener noreferrer"`.
- Respetar límites de uso y caché de las APIs: no hacer más pedidos de los necesarios ni saltarse la caché para "refrescar" en cada render.
- Los logos de marca son marcas de sus dueños y se usan solo para identificar la fuente.

## 9. Pruebas basadas en riesgo

No buscar cobertura total ni un test por archivo. Elegir según el daño de una regresión y el costo de detectarla. Test-first para comportamiento cuando exista una prueba determinista aplicable: primero la prueba que falla, luego la implementación. Sin umbral numérico de cobertura.

| Prioridad     | Riesgos que deben quedar protegidos al trabajar en esa parte                                         |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Datos         | Adaptadores: respuestas válidas, campos faltantes, formato inesperado, errores de red y de esquema.  |
| Dominio       | Normalización, orden, deduplicación, filtrado, búsqueda sin acentos y fechas.                        |
| Estados       | Fuente caída con contenido cacheado, carga, vacío y error, sin romper el resto de la página.         |
| URL           | Filtros y búsqueda reflejados en la URL y restaurados al recargar.                                   |
| Seguridad     | Enlaces y contenido externo saneados.                                                                |
| Accesibilidad | HTML semántico, navegación por teclado, foco visible, nombres accesibles y contraste en ambos temas. |

- Unitarios (Vitest) para reglas puras y adaptadores con respuestas de ejemplo. Integración (Testing Library) para componentes con lógica y hooks. E2E (Playwright) solo para flujos críticos que dependan del recorrido completo, por ejemplo filtrar por tema y ver el resultado tras recargar. Sin un E2E por variante de validación.
- No testear detalles internos de librerías, getters triviales ni componentes puramente decorativos. Evitar snapshots masivos y selectores acoplados al DOM interno; preferir roles y textos accesibles.
- Un bug importante lleva prueba de regresión cuando sea viable. No debilitar aserciones ni borrar tests para ocultar un fallo.
- Datos ficticios y deterministas. Controlar reloj y respuestas externas; la suite no depende de APIs reales ni de internet.
- Las pruebas de cada feature viven en `src/features/<feature>/tests/` (`unit/`, `integration/`, `e2e/` solo si aportan orden), no sueltas junto a los componentes. Las de utilidades compartidas, en `src/shared/tests/`. Un E2E transversal va en la feature dueña del flujo.
- Fixtures y utilidades de testing dentro de esos directorios; compartirlas solo con varios consumidores reales.

## 10. Verificación y entrega

- Descubrir los comandos reales en `package.json` y usar pnpm.

| Comando             | Para qué                                  |
| ------------------- | ----------------------------------------- |
| `pnpm dev`          | Servidor de desarrollo                    |
| `pnpm build`        | Build de producción                       |
| `pnpm lint`         | ESLint                                    |
| `pnpm typecheck`    | `next typegen` + `tsc --noEmit`           |
| `pnpm format:check` | Verifica Prettier (`pnpm format` escribe) |
| `pnpm test`         | Tests unitarios y de integración (Vitest) |
| `pnpm test:e2e`     | Tests end-to-end (Playwright)             |

- Antes de pedir un commit: `lint`, `typecheck`, `format:check` y `test` en verde; `build` y `test:e2e` cuando el cambio lo justifique. Un cambio solo documental no exige pruebas de aplicación: revisar contenido, rutas y coherencia, y correr `format:check`.
- Si falta infraestructura o una verificación requiere credenciales, informar el bloqueo. No instalar herramientas por cuenta propia.
- Revisar el diff antes de terminar: alcance, errores, secretos, archivos accidentales y coherencia con estas reglas. No convertir una tarea puntual en una limpieza general.
- Entregar un resumen en español: qué cambió, qué verificaciones se ejecutaron y su resultado, qué no se pudo verificar y qué decisiones quedan pendientes. No afirmar que un test pasó si no se ejecutó.
- Priorizar código que el usuario pueda entender y mantener. Si una solución necesita demasiadas capas para una necesidad chica, buscar una alternativa más directa.
