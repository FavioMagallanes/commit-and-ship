# Commit & Ship

Agregador de novedades tech para desarrolladores. Reúne en un solo lugar lo que publican Hacker News,
GitHub, dev.to, los blogs oficiales y la conversación de Mastodon, ordenado por tema y por hora, sin
cuentas, sin suscripciones y sin algoritmos de recomendación.

Commit & Ship **solo agrega y enlaza**: no publica notas propias, cada ítem lleva al sitio de origen.
Es un proyecto personal de portfolio, construido con APIs públicas y gratuitas.

## Qué hace

- **Feed unificado** con las novedades de cuatro fuentes, ordenable por más recientes o más
  populares, con búsqueda insensible a acentos y mayúsculas, filtro por tema y paginación.
- **Radar de versiones** de ocho proyectos (Node.js, Next.js, React, TypeScript, Rust, Vue, Deno y
  Tailwind CSS) y una página `/releases` con la última versión de cada uno.
- **Lo más hablado** y **noticia destacada**, con la popularidad normalizada por fuente: un post de
  dev.to con pocas reacciones compite de igual a igual con uno de Hacker News con cientos de puntos.
- **En conversación**: publicaciones públicas de Mastodon, filtradas contra spam y contenido
  inapropiado.
- **Tema claro y oscuro**, interfaz responsive y navegable con teclado.
- **Estado compartible en la URL**: búsqueda, tema, orden y cantidad de resultados se restauran al
  recargar o al compartir el enlace.
- **Tolerancia a fallos**: si una fuente cae, el resto sigue funcionando. La página muestra el último
  contenido guardado con un aviso y un botón para reintentar.

## Fuentes

| Fuente          | De dónde sale                                     | Actualización |
| --------------- | ------------------------------------------------- | ------------- |
| Hacker News     | API de Algolia (portada, 30 notas)                | 10 min        |
| dev.to          | API pública de artículos (los mejores del día)    | 10 min        |
| Blogs oficiales | RSS y Atom de Node.js, React, Rust y Next.js      | 30 min        |
| Versiones       | GitHub Releases de 8 repositorios                 | 30 min        |
| En conversación | Líneas de tiempo públicas de hashtags en Mastodon | 15 min        |

Todas son gratuitas y no requieren credenciales: el proyecto no usa variables de entorno ni
secretos. Si una lectura falla, se reintenta al minuto.

## Cómo está construido

- **Next.js 16** con App Router, **Cache Components** (`use cache`) y Partial Prerender: la estructura
  de la página se sirve estática y los datos se cachean en el servidor con revalidación por fuente.
- **Un adaptador por fuente**: llama a la API, valida la respuesta con **Zod** y devuelve el modelo de
  dominio normalizado. Un cambio en una API externa se corrige solo en su adaptador.
- **Los loaders cacheados nunca lanzan errores**: devuelven un resultado `ok` o `error`. Next hace
  fallar el prerender si una función con `use cache` lanza, y una fuente caída no debe tumbar el
  build ni la página.
- **Contenido guardado**: cada fuente recuerda en memoria su última lectura buena (hasta 24 h) y la
  muestra si la siguiente falla. Es memoria del proceso: se pierde al reiniciar y no se comparte
  entre instancias.
- **Reglas de dominio puras**: normalización, orden, popularidad, filtros y búsqueda viven en
  funciones puras, testeables sin montar React.
- **Contenido externo no confiable**: nunca se inyecta HTML externo; los enlaces se validan
  (`http`/`https`) y los feeds XML se procesan sin expandir entidades, con tope de tamaño.
- **Arquitectura por funcionalidades**: el código se organiza por capacidades del producto, no por
  capas técnicas.

## Stack

| Área         | Tecnología                                                              |
| ------------ | ----------------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack), React 19, React Compiler            |
| Lenguaje     | TypeScript ~6.0 en modo estricto                                        |
| Estilos      | Tailwind CSS 4 con tokens de diseño en CSS (`light-dark()`)             |
| Tipografías  | `next/font`: Geist (títulos), Inter (texto), Geist Mono                 |
| Datos        | Zod, TanStack Query, nuqs (estado en la URL), fast-xml-parser           |
| Calidad      | Prettier, ESLint, Husky, lint-staged, commitlint                        |
| Pruebas      | Vitest + Testing Library (unitarias y de integración), Playwright (e2e) |
| CI y hosting | GitHub Actions, Vercel                                                  |

## Requisitos

- Node.js `>=22.12` (`.nvmrc` fija la versión 22)
- pnpm 10 (la versión exacta está en `packageManager`; `corepack enable` la instala)

## Primeros pasos

```bash
pnpm install
pnpm dev
```

Abrí <http://localhost:3000>. No hace falta configurar nada más.

## Scripts

| Script                                   | Qué hace                                               |
| ---------------------------------------- | ------------------------------------------------------ |
| `pnpm dev` / `pnpm build` / `pnpm start` | Servidor de desarrollo, build de producción y servidor |
| `pnpm lint`                              | ESLint (incluye el orden de imports)                   |
| `pnpm typecheck`                         | Genera los tipos de rutas y corre `tsc --noEmit`       |
| `pnpm format` / `pnpm format:check`      | Prettier: escribir / verificar                         |
| `pnpm test` / `pnpm test:watch`          | Vitest una vez / en modo watch                         |
| `pnpm test:e2e`                          | Playwright (construye y levanta la app por su cuenta)  |

La primera vez que corras los tests e2e: `pnpm exec playwright install chromium`.

> Los e2e levantan su propio servidor en el puerto 3000 y fallan si ya hay otro en ese puerto, para no
> correr contra código desactualizado. Cerrá `pnpm dev` antes de ejecutarlos.

## Pruebas

La suite prioriza el riesgo antes que la cobertura total:

- **Unitarias**: adaptadores con respuestas de ejemplo (válidas, incompletas y mal formadas), reglas
  de dominio, normalización de HTML y filtros de contenido.
- **Integración**: componentes con lógica, estados de carga, vacío y error, y contenido guardado.
- **End to end**: flujos críticos recorridos completos (búsqueda, filtros, navegación móvil,
  `/releases`).

Los tests son deterministas y no dependen de internet ni de APIs reales.

## Calidad y flujo de trabajo

- **pre-commit**: lint-staged corre `eslint --fix` y `prettier --write` sobre los archivos en stage.
- **commit-msg**: commitlint exige [Conventional Commits](https://www.conventionalcommits.org) (por
  ejemplo `feat: add topic filter`). Las líneas del cuerpo no pasan de 100 caracteres.
- **CI** (`.github/workflows/ci.yml`): en cada push a `main` corre lint, tipos, formato, tests
  unitarios y build, más la suite e2e en un job aparte.
- **Trunk-based**: el trabajo se commitea directo a `main`, en commits chicos y revisables, sin ramas
  de funcionalidad ni pull requests.

## Estructura del proyecto

```text
src/
  app/                 Rutas, layout, providers y estilos globales con los tokens
  features/
    news-feed/         Feed, destacada, ordenamiento, paginación y adaptadores de fuentes
    release-radar/     Radar de versiones y página /releases
    conversation/      Tarjeta "En conversación" (Mastodon) y su filtro de contenido
    trending/          "Lo más hablado hoy"
    topics/            Reglas de clasificación por tema y chips de filtro
    search-filters/    Búsqueda y estado de la URL
    activity-log/      Terminal decorativa con la actividad reciente
    theme/             Tema claro y oscuro
  shared/
    lib/               Utilidades compartidas (cn, fechas, fuentes activas)
    ui/                Primitivas de interfaz (Button, Chip, Select, banners...)
    tests/             Tests compartidos
e2e/                   Pruebas end to end con Playwright
```

## Diseño

El diseño nace en Penpot y se sincroniza a mano con `src/app/globals.css` y los componentes. Los
colores son variables CSS definidas con `light-dark()`: el tema sigue al sistema operativo y se puede
forzar agregando `.light` o `.dark` a `<html>`. La escala tipográfica y los radios reemplazan a los de
Tailwind. El detalle completo está en [`DESIGN.md`](DESIGN.md).

Las reglas de desarrollo del repositorio (convenciones, arquitectura, seguridad y pruebas) están en
[`AGENTS.md`](AGENTS.md).

## Despliegue

En producción: **<https://commit-and-ship.vercel.app>**

El proyecto se despliega en [Vercel](https://vercel.com) (plan Hobby) y no requiere variables de
entorno. Vercel detecta Next.js y pnpm por sí solo, así que el despliegue manual es:

```bash
npm install -g vercel
vercel login
vercel deploy --prod
```

El CI corre en cada push a `main`. Para que cada push también despliegue automáticamente hay que
conectar el repositorio con `vercel git connect`.

## Límites conocidos

- **GitHub sin autenticar** permite 60 pedidos por hora por IP. Con 8 repositorios y una revalidación
  de 30 minutos el consumo queda muy por debajo, pero conviene tenerlo presente si se agregan más.
- **El contenido guardado vive en memoria del proceso**: en un entorno serverless (como Vercel) puede
  no estar disponible tras un arranque en frío. Garantizarlo exigiría una base de datos o un KV
  externo, algo que el proyecto evita a propósito para mantenerse en servicios gratuitos.
- **Las publicaciones de Mastodon** son públicas y no están curadas: el filtro de calidad y de
  contenido es conservador, pero no infalible.
- **Los blogs oficiales** publican poco, por eso no suelen verse en los primeros resultados del feed
  ordenado por fecha. El chip **Blogs** los muestra aparte.

## Notas de versiones

Algunas herramientas no están en su última versión mayor a propósito, para mantener la compatibilidad:

- **TypeScript ~6.0**: `typescript-eslint` soporta `typescript <6.1`.
- **ESLint 9**: los plugins de `eslint-config-next` (React, jsx-a11y, import) llegan hasta la 9.
- **lint-staged 16**: la versión 17 exige Node `>=22.22.1`.
