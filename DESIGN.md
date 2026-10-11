# Sistema de diseño

Fuente de verdad: el diseño en Penpot. La sincronización con `src/app/globals.css`, los componentes y este documento es manual: si cambia el diseño, se actualizan los tres.

## Principios

- Sobrio y legible: mucho espacio, un solo color de acento (verde esmeralda), texto como protagonista.
- Dos temas (claro y oscuro) con los mismos nombres de token.
- Contraste AA validado en todos los pares de texto sobre fondo.

## Colores

Cada token se define una vez con `light-dark()` en `globals.css`. Por defecto sigue al sistema; la clase `.light` o `.dark` en `<html>` fuerza un tema. En Tailwind se usan como `bg-canvas`, `text-ink`, `border-line`, etc.

| Token CSS     | Penpot            | Claro     | Oscuro    | Uso                                                   |
| ------------- | ----------------- | --------- | --------- | ----------------------------------------------------- |
| `canvas`      | `neutral.bg`      | `#FAFAF9` | `#0C0A09` | Fondo de página                                       |
| `surface`     | `neutral.surface` | `#FFFFFF` | `#171413` | Tarjetas, nav, paneles                                |
| `soft`        | `neutral.soft`    | `#F5F5F4` | `#231F1E` | Fondos suaves, hover, skeleton                        |
| `line`        | `neutral.line`    | `#E7E5E4` | `#2E2927` | Bordes y separadores                                  |
| `faint`       | `neutral.faint`   | `#6F6963` | `#968F8A` | Texto terciario (fechas, metadatos)                   |
| `muted`       | `neutral.muted`   | `#57534E` | `#A8A29E` | Texto secundario                                      |
| `ink`         | `neutral.ink`     | `#1C1917` | `#F5F5F4` | Texto principal y títulos                             |
| `accent`      | `accent.solid`    | `#10B981` | `#34D399` | Botón primario, indicadores                           |
| `accent-text` | `accent.text`     | `#047857` | `#6EE7B7` | Texto de acento y enlaces                             |
| `accent-soft` | `accent.soft`     | `#D1FAE5` | `#0F2E26` | Fondo de chips y pills de acento                      |
| `on-accent`   | `accent.on`       | `#022C1E` | `#04251A` | Texto sobre `accent`                                  |
| `danger-bg`   | `error.bg`        | `#FEF2F2` | `#2A1213` | Fondo de error                                        |
| `danger-line` | `error.line`      | `#FECACA` | `#5B1F22` | Borde de error                                        |
| `danger-text` | `error.text`      | `#991B1B` | `#FCA5A5` | Texto de error                                        |
| `terminal`    | (aproximado)      | `#1C1917` | `#231F1E` | Panel de terminal de la intro (oscuro en ambos temas) |

`terminal-text` (`#E7E5E4`), `terminal-muted` (`#A8A29E`) y `terminal-accent` (`#34D399`) son los colores de texto del panel de terminal. Todos los valores `terminal*` están aproximados desde el tablero y pendientes de afinar contra Penpot.

En Penpot los tokens oscuros llevan el prefijo `dark.`. Reglas:

- Nunca hex sueltos en componentes: siempre un token.
- Texto sobre `accent` usa `on-accent`; texto de acento sobre fondo neutro usa `accent-text`, no `accent`.
- `faint` es el gris más claro permitido para texto.

## Tipografía

| Rol           | Fuente     | Variable CSS        | Clase Tailwind |
| ------------- | ---------- | ------------------- | -------------- |
| Títulos       | Geist      | `--font-geist`      | `font-heading` |
| Cuerpo        | Inter      | `--font-inter`      | `font-sans`    |
| Monoespaciada | Geist Mono | `--font-geist-mono` | `font-mono`    |

Se usa Geist cuando el tamaño es 18 px o más y el peso es 600 o más; en cualquier otro caso, Inter.

| Escala | `xs` | `sm` | `base` | `md` | `lg` | `xl` | `2xl` | `3xl` | `4xl` |
| ------ | ---- | ---- | ------ | ---- | ---- | ---- | ----- | ----- | ----- |
| px     | 12   | 13   | 14     | 16   | 18   | 20   | 24    | 32    | 44    |

Pesos disponibles: 400 a 800. La escala reemplaza a la de Tailwind; `md` es un tamaño propio y `cn` lo registra en `tailwind-merge`.

## Espaciado y radios

- Espaciado: paso de 4 px de Tailwind. Los tokens de Penpot 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 y 96 equivalen a `1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24`.
- Radios: `sm` 8, `md` 12, `lg` 16, `xl` 20, `full` 999 px.
- Bordes de 1 px con `line`.
- Contenido de 1200 px de ancho en escritorio (contenedor de 1248 px con 24 px de padding lateral); separación de 72 px entre la introducción y el contenido principal.

## Iconos

- Lucide (licencia ISC), trazo monocromático que hereda `currentColor`. Se agrega `lucide-react` al usarlo por primera vez.
- Set actual (13): search, menu, sun, moon, arrow-up-right, arrow-right, chevron-down, alert, search-x, rss, más los logos de Hacker News, GitHub y dev.to.
- Logos de marca: monocromáticos, de Simple Icons (CC0). Son marcas registradas de sus dueños y se usan solo para identificar la fuente.

## Tema

Claro y oscuro, siguiendo al sistema por defecto. El toggle de la navegación fuerza `.light` o `.dark` en `<html>`. En el diseño, el tema oscuro se arma sobreescribiendo tokens (`dark.*`) y no con una propiedad de componente.

## Componentes

Se implementan con React, `cva` y `cn`. Cada uno nace de un componente de Penpot con sus variantes.

| Componente   | Variantes                           | Notas                                                 |
| ------------ | ----------------------------------- | ----------------------------------------------------- |
| Button       | Primario, Secundario, Peligro       | En uso: Primario y Peligro                            |
| Chip         | Inactivo, Activo                    | Filtros por tema                                      |
| Pill         | Neutro, Acento, Sólido              | Etiquetas cortas                                      |
| Source Badge | HN, GH, DEV, Blog                   | Logo monocromático + nombre de la fuente              |
| News Item    | Escritorio (820 px), Móvil (350 px) | Contiene Source Badge y Pill                          |
| Card Header  | Con enlace, Sin enlace              | Título de las tarjetas de la barra lateral            |
| Radar Row    | Nuevo: Sí, No                       | Versiones publicadas (GitHub Releases)                |
| Ranking Row  | Primero, Resto                      | "Lo más hablado hoy"                                  |
| Post Row     | Base                                | "En conversación"                                     |
| Icon         | 13 variantes                        | Ver sección de iconos                                 |
| Select       | Cerrado, Abierto                    | Orden de la lista; menú propio, aún no está en Penpot |

`Select` se implementó antes que en Penpot y debe agregarse allí. Cerrado es un botón sin caja ni borde: la etiqueta con dos puntos en `muted`, el valor elegido en `ink` semibold y un `chevron-down` que gira al abrir. Abierto muestra un panel alineado a la derecha del botón, con superficie (`surface`), borde (`line`), radio `lg` y sombra; la opción activa usa `soft` y la seleccionada `accent-soft` con texto `accent-text`. Sigue el patrón ARIA listbox.

## Pantallas y estados

- Home claro (1440 px), Home oscuro y Home móvil (390 px).
- Estructura de la home: navegación (logo, búsqueda con Ctrl K, Fuentes, toggle de tema), introducción (eyebrow, título, estadísticas, chips de temas), noticia destacada, lista "Más recientes" con "Cargar más novedades", barra lateral (Radar de versiones, Lo más hablado hoy, En conversación) y footer.
- El Radar de versiones muestra las 6 más recientes en escritorio y 4 en móvil; su Card Header "Con enlace" ("Ver todo" en `accent-text` con `arrow-right`) lleva a la pantalla Versiones.
- Versiones (`/releases`), aún no está en Penpot: enlace "Volver al inicio" en `accent-text`, título, introducción y todas las versiones con Radar Row dentro de una tarjeta, de la más reciente a la más antigua.
- Estados: cargando (skeleton), vacío (icono `search-x`) y error de fuente (banner de error con contenido en caché).

## Responsive

- Móvil: una sola columna; la barra lateral pasa debajo de la lista; `News Item` usa la variante móvil.
- Escritorio: lista principal más barra lateral.
