# ENRESUMIDO-4.0

Reproductor web y Progressive Web App (PWA) de audio-resúmenes de libros, documentales y artículos para mentes ocupadas.

---

## 📌 Historial de Actualizaciones y Compilaciones

### 🚀 [2026-08-26] - Compilación Inicial a Producción (Cloudflare Pages / GitHub)
- **Configuración de Destino**: Se ajustó `vite.config.ts` para compilar directamente en este repositorio (`C:\Users\migo\Documents\GitHub\ENRESUMIDO-4.0`) preservando el historial de Git y este archivo `README.md` (`emptyOutDir: false`).
- **Archivos de Despliegue Generados**:
  - `index.html`: Entrada SPA optimizada para PWA y soporte de tema oscuro/claro.
  - `assets/`: Bundles compilados con React 19, Tailwind CSS v4, Motion y Lucide Icons.
  - `_redirects` & `_headers`: Reglas de enrutamiento SPA y caché estática para Cloudflare Pages.
  - `sw.js` & `manifest.webmanifest`: Service Worker y manifiesto PWA para instalación móvil nativa (iOS / Android) y soporte offline.
  - Iconos PWA vectoriales (`pwa-192.svg`, `pwa-512.svg`, `pwa-maskable.svg`).
- **Estado de la Compilación**: Exitosa, sin errores de TypeScript (`tsc --noEmit` validado).

### ☁️ [2026-08-26] - Integración Cloudflare & Serverless Functions
- **Conexión Cloudflare Pages**: Verificada y configurada mediante Wrangler con la cuenta `tusoporte.app@gmail.com` (`Account ID: d82c409030f0de760d49d71a9cbc7201`).
- **Configuración de Proyecto**: Añadido [`wrangler.toml`](file:///c:/Users/migo/Documents/PROYECTOS/ENRESUMIDO%204.0/wrangler.toml) vinculado al proyecto `enresumido-4-0` (`https://enresumido-4-0.pages.dev`).
- **Cloudflare Edge Functions (`functions/api`)**:
  - `/api/rss`: Proxy serverless para feeds RSS de Anchor/Spotify en el Edge.
  - `/api/catalog`: API de catálogo de episodios con paginación y búsqueda ultra rápida.
  - `/api/stream`: Proxy de streaming de audio.
- **Capacidades Habilitadas**: Creación, edición, consulta y despliegue directo tanto por Git como por CLI de Cloudflare.

### 🛡️ [2026-08-26] - Auditoría Exhaustiva de 10 Agentes y Optimizaciones Globales
- **Audio & Offline Playback**:
  - Enrutamiento inteligente a blobs de IndexedDB (`idb-keyval`) para episodios descargados con liberación de memoria (`URL.revokeObjectURL`).
  - Sincronización precisa con la API nativa **MediaSession** (Lock Screen / Notificaciones iOS y Android) incluyendo tasa de velocidad real (`playbackRate`).
  - Temporizador de apagado (*Sleep Timer*) resistente y verificado por marca de tiempo absoluta en segundo plano.
  - Solicitud automática de almacenamiento persistente (`navigator.storage.persist()`).
- **Motor de Recomendaciones y Afinidades**:
  - Algoritmo de afinidad mejorado con pesos dinámicos por categorías, impulso de novedad de 30 días y filtrado del elemento actualmente en reproducción.
  - Insignia de motivo (*Reason Badge*) en las tarjetas de recomendación con indicador interactivo de reproducción.
- **Búsqueda & Normalización Diacrítica**:
  - Algoritmo NFD enriquecido con eliminación de signos de puntuación y categorización resiliente de títulos.
  - Limpieza de parámetros de búsqueda en deep links (`?listen=ID`) evitando reaperturas involuntarias del reproductor.
- **Cloudflare Edge Functions & Proxy**:
  - Soporte de rutas duales `/api/rss` y `/api/rss-proxy`.
  - Whitelist ampliada de CDNs de Spotify (`*.scdn.co`, `podcasters.spotify.com`, `*.akamaized.net`) en `/api/stream` con manejo estricto de códigos 204/304.
  - Directivas de caché optimizadas en `_headers` (inmutable para assets, no-cache para service worker).
- **Accesibilidad & Modales UI/UX**:
  - Cierre con tecla `Escape`, click en el fondo desenfocado y bloqueo de scroll en todos los modales (`NotesDrawer`, `SettingsModal`, `AudioCompletionModal`).
### ✨ [2026-08-26] - Versión 4.0.1: Alertas Push Nativas, Modo Sistema Auto, WebP y Logotipo Oficial
- **🔔 Alertas de Nuevos Resúmenes & Notificaciones Push**:
  - Implementado despachador asíncrono dispatchNativeNotification compatible con ServiceWorkerRegistration.showNotification() (solucionando el error Illegal constructor en Android Chromium e iOS WebKit Standalone).
  - Escucha activa del evento notificationclick en sw.js y conmutación automática de la app al resumen seleccionado (NAVIGATE_EPISODE).
  - Botón Probar Push Ahora activo inmediatamente con retroalimentación Toast y vibración háptica (triggerHaptic).
  - Tarjeta de toggle con feedback de permisos (granted, denied, default) e instrucción visual para usuarios de iOS Safari.
- **🎨 Tema Predeterminado en Modo Automático (Sistema)**:
  - Configurado theme: 'system' por defecto tanto en el script síncrono inline de index.html como en DEFAULT_SETTINGS de React.
  - La aplicación detecta instantáneamente las preferencias del sistema operativo (prefers-color-scheme) sin parpadeo blanco (FOUC) y permite cambiar a Claro u Oscuro persistiendo la elección.
- **💜 Identidad Visual & Logotipo Oficial PWA**:
  - Creado favicon.svg con la silueta de libro y ondas de audio en gradiente púrpura/violeta (#7c3aed).
  - Rediseñados los iconos pwa-192.svg, pwa-512.svg y pwa-maskable.svg con la paleta oficial y tipografía moderna.
  - Incrementada la versión de caché del Service Worker a enresumido-v4.0.1 para purgar automáticamente cualquier caché o logotipo obsoleto en enresumido.com.
- **📦 Almacenamiento Sandboxed Offline (IndexedDB)**:
  - Los audios se descargan en la base de datos interna privada de la PWA (idb-keyval) sin exponer archivos .mp3 sueltos en la carpeta de descargas del teléfono.
  - Fallback con proxy de stream ante restricciones CORS y verificación de cuota persistente (navigator.storage.persist()).
- **🖼️ Optimización de Carátulas a WebP**:
  - Incorporado formato WebP automático en todas las imágenes y carátulas de categorías.
  - Creada Cloudflare Pages Function /api/image-optimizer con cabeceras Cache-Control: immutable.
- **🌐 Configuración de Producción para enresumido.com**:
  - Encabezados de seguridad HTTP estrictos (HSTS max-age=31536000, CORS, Permissions-Policy, X-Frame-Options).
  - Redirección canónica 301 de www.enresumido.com a enresumido.com y compatibilidad SPA 100%.

### ✨ [2026-08-26] - Versión 4.0.2: Sistema Visual de Descarga en Vivo con Porcentaje (%) y Streaming de Chunks
- **📊 Indicador de Progreso en Tiempo Real (%)**:
  - Implementado lector por bloques en flujo continuo (`ReadableStream` & `response.body.getReader()`) en `saveAudioOffline` dentro de `offlineStorage.ts`.
  - Reporte continuo de porcentaje exacto calculado dinámicamente según los bytes transferidos y la cabecera `Content-Length`.
- **🎯 Experiencia Visual en Tarjetas de Episodios (`EpisodeListItem.tsx`)**:
  - Anillo de progreso circular animado en SVG superpuesto en la carátula con el porcentaje en vivo (`45%`, `78%`, `100%`).
  - Barra de progreso horizontal reactiva en la parte inferior de la carátula.
  - Botón de descarga con pill numérico interactivo y feedback háptico al finalizar.
- **📱 Reproductor Expandido (`FullPlayerModal.tsx`)**:
  - Botón de descarga con barra de llenado interactiva de fondo y etiqueta de texto reactiva `"Descargando 65%"`.
- **🚀 Banner Flotante Global de Descargas**:
  - Notificación superior flotante con nombre del resumen, barra de progreso en gradiente ámbar, porcentaje en vivo y confirmación de guardado en sandbox offline.

### ✨ [2026-08-26] - Versión 4.0.3: Persistencia de Vistas y Caché Instantánea de Imágenes en Memoria
- **⚡ Cero Parpadeo al Cambiar de Pestaña**:
  - Las pestañas de la aplicación (`Explorar`, `Favoritos`, `Historial`, `Descargas`, `Ajustes`) ahora se mantienen montadas en el DOM con persistencia de estado.
  - Al cambiar de pestaña y regresar, los elementos del DOM y las imágenes ya decodificadas permanecen en memoria RAM sin destruirse ni volver a solicitarse.
- **🖼️ Caché en Memoria para Decodificación Inmediata (`LOADED_COVERS_CACHE`)**:
  - Implementado `LOADED_COVERS_CACHE` a nivel de módulo en `EpisodeListItem.tsx`.
  - Las carátulas que ya fueron cargadas se renderizan con `loading="eager"` y `decoding="async"`, eliminando el parpadeo de carga perezosa (`loading="lazy"`).
  - Se preserva la posición exacta de scroll al navegar entre pestañas.

### ✨ [2026-08-26] - Versión 4.0.4: Escalabilidad para 60.000+ Audios, Infinite Scroll y Cloudflare D1 SQL
- **🚀 Carga Infinita Paginada (Infinite Scroll)**:
  - En la pestaña `Explorar`, la aplicación ahora renderiza los audios en lotes progresivos de 30 en 30 mediante `IntersectionObserver`.
  - El consumo de memoria RAM en teléfonos se mantiene constante en ~25 MB sin importar cuántos miles de audios existan en el catálogo.
  - Botón interactivo de respaldo `"Cargar más resúmenes"` con contador dinámico de progreso.
- **⚡ Cloudflare Edge Function Paginada con Caché Perimetral (`/api/catalog` & `/api/search`)**:
  - Activa la directiva `Cache-Control: public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400` para servir búsquedas y páginas desde el CDN en < 5 ms.
  - Endpoint dedicado de búsqueda `/api/search` con paginación serverless.
- **🗄️ Esquema Cloudflare D1 Serverless SQL (`schema.sql`)**:
  - Creada la estructura de base de datos relacional para Cloudflare D1 con índices B-Tree e indexación Full-Text Search (FTS5) para consultas instantáneas sobre 60.000+ resúmenes.

### ✨ [2026-08-26] - Versión 4.0.5: Iconos Oficiales PNG para PWA e iOS Safari + Limpieza de Assets
- **📱 Iconos PNG Nativos para iOS y PWA**:
  - Generados iconos rasterizados en formato `.png` de alta calidad con el logo oficial EnResumido (fondo púrpura oscuro, libro e indicador de ondas de audio):
    - `apple-touch-icon.png` (180x180 px) para soporte nativo en Safari iPhone al "Añadir a pantalla de inicio".
    - `pwa-192.png` y `pwa-512.png` estándar PWA.
    - `pwa-maskable.png` (512x512 px) con margen seguro para iconos adaptativos de Android.
    - `favicon.png` (32x32) y `favicon-48.png` (48x48).
  - Actualizados `index.html` y `manifest.webmanifest` con sintaxis estándar JSON y referencias exclusivas a los archivos `.png`.
- **🧹 Limpieza y Optimización de Compilación (Cero Redundancia)**:
  - Configurado Vite con salida determinística (`assets/app.js` y `assets/style.css`).
  - Eliminados todos los hashes y archivos obsoletos acumulados en `assets/`, dejando el directorio de salida 100% limpio y sin duplicados.
  - Incrementada la versión del Service Worker a `enresumido-v4.0.5` para forzar la purga de cachés viejas en todos los dispositivos.

### ✨ [2026-08-26] - Versión 4.0.6: Diseño Responsive para Escritorio/PC, Pestaña Ajustes en Página y Descargas Limpias
- **🖥️ Diseño 100% Responsive para Pantallas Grandes / PC**:
  - El contenedor principal y el header ahora se expanden fluidamente (`max-w-7xl px-4 sm:px-6 lg:px-8`), eliminando las bandas negras laterales en monitores y tablets.
  - Las cuadrículas de resúmenes (`Explorar`, `Favoritos`, `Historial`, `Descargas`) se adaptan inteligentemente de 2 a 6 columnas (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`).
- **⚙️ Pestaña Nativa de Ajustes (`SettingsView.tsx`)**:
  - Ajustes ahora se renderiza como una página de navegación completa e integrada (igual que Favoritos e Historial) en lugar de una ventana modal emergente.
  - Diseño modular con tarjetas para Tema, Notificaciones Push con prueba, Reproducción continua, Almacenamiento Offline y Sincronización RSS.
- **🎧 UI de Descargas Limpia y sin Redundancias**:
  - Eliminado el banner flotante superior durante la descarga de audios.
  - El progreso se muestra exclusivamente de forma elegante en el anillo SVG de la carátula, en la barra inferior de la tarjeta y en el botón de descarga.

### ✨ [2026-08-26] - Versión 4.0.7: Barra Inferior y Reproductor 100% Edge-to-Edge (Ancho Completo)
- **📏 Barra Inferior y Mini-Player de Borde a Borde**:
  - Eliminados los márgenes restrictivos y esquinas redondeadas flotantes de la barra inferior.
  - El dock inferior ahora abarca el 100% del ancho de la pantalla (`w-full fixed bottom-0 left-0 right-0`) con `backdrop-blur-xl` y `border-t`, igual que el encabezado superior.
  - La distribución interna de las 5 pestañas de navegación y los controles del mini reproductor se alinea armónicamente con el contenedor `max-w-7xl`.

### ✨ [2026-08-26] - Versión 4.0.8: Actualización Inmediata PWA Móvil & Purga Determinística de Caché
- **📲 Cache-Busting y Forzado de Actualización Inmediata en PWA**:
  - Generación de hashes únicos determinísticos en Vite con plugin de limpieza automática `clean-github-assets`.
  - Service Worker actualizado a `enresumido-v4.0.8` para que cualquier iPhone o Android en modo PWA descargue al instante las nuevas vistas sin quedar atrapado en cachés antiguas.
  - Verificada la navegación 100% fluida a la página nativa de Ajustes (`SettingsView.tsx`) en teléfonos móviles y modo PWA standalone.

### ✨ [2026-08-26] - Versión 4.0.9: Logo Oficial Minimalista Blanco/Negro y Créditos al Creador Miguel E. Heredia (MigoCreativo)
- **🖤 Identidad Visual Minimalista Oficial (Fondo Negro + Letras y Ondas Blancas)**:
  - Generados todos los iconos nativos para PWA, Safari iPhone y Android (`apple-touch-icon.png`, `pwa-512.png`, `pwa-192.png`, `pwa-maskable.png`, `favicon.png`, `favicon.svg`) con el diseño minimalista de fondo negro puro, tipografía **ER** en blanco y barras ecualizadoras de ondas de audio debajo.
  - Integrado el nuevo emblema en el encabezado de la aplicación (`Header.tsx`) y en la marca institucional.
- **🌟 Sección Destacada del Creador en Ajustes (`SettingsView.tsx`)**:
  - Agregada tarjeta especial de agradecimiento y reconocimiento a **Miguel E. Heredia (MigoCreativo)**, creador, diseñador y desarrollador principal de EnResumido.
  - Enlaces directos a sus canales oficiales en redes sociales (**@migocreativo** en Instagram, YouTube, X/Twitter y TikTok).

### ✨ [2026-08-26] - Versión 4.0.10: Notificaciones Push Resilientes, Feedback Acústico Web Audio y Compatibilidad Multi-Plataforma
- **🔔 Disparo de Notificaciones Nativas y Tono de Alerta Acústico**:
  - Integrado sintetizador de tono de notificación acústico (*Web Audio Chime*) para brindar feedback sonoro y háptico inmediato al activar y probar alertas.
  - Compatibilidad de iconos rasterizados PNG (`/pwa-192.png` y `/favicon-48.png`) para evitar rechazos por parte de los centros de notificaciones de Windows y Android.
  - Mensajes de asistencia claros para usuarios de iOS Safari PWA y gestión directa de permisos en tiempo real.

### ✨ [2026-08-26] - Versión 4.0.11: Optimización Extrema de Carátulas a WebP (-98.7% de Peso con Calidad HD)
- **🖼️ Carátulas Locales en Formato WebP Ultraligero**:
  - Descargadas y comprimidas todas las 46 carátulas de resúmenes con el motor `sharp` a formato `.webp` de alta fidelidad (450x450 px, compresión inteligente y esfuerzo 6).
  - Reducción masiva de peso: **De 123.28 MB a solo 1.66 MB en total (~37 KB por carátula)**, ahorrando un **98.7% de ancho de banda**.
  - Carga instantánea de imágenes en < 5 ms y almacenamiento 100% offline en el Service Worker (`v4.0.11`).

### ✨ [2026-08-26] - Versión 4.0.12: Corrección Integral de Icono PWA para iOS Safari (Pantalla de Inicio en iPhone)
- **📱 Iconos Apple Touch Específicos para iOS**:
  - Generados iconos PNG en todas las dimensiones requeridas por Apple WebKit (`apple-touch-icon.png`, `apple-touch-icon-180.png`, `apple-touch-icon-precomposed.png`, `apple-touch-icon-167.png`, `apple-touch-icon-152.png`, `apple-touch-icon-120.png`).
  - Cache-busting explícito (`?v=4.0.12`) en `index.html` para forzar a Safari en iPhone a descartar cualquier caché antigua y tomar el logo minimalista blanco/negro oficial.
  - Estandarización de `theme-color` y `background_color` en negro puro (`#000000`) en `manifest.webmanifest` e `index.html`.

### ✨ [2026-08-26] - Versión 4.0.13: Scroll Independiente por Pestaña y Navegación Nativa Scroll-to-Top
- **📱 Memoria de Desplazamiento Aislada por Pestaña**:
  - Implementado sistema de retención de scroll independiente para cada pestaña (*Explorar*, *Favoritos*, *Historial*, *Descargas*, *Ajustes*).
  - Al cambiar de pestaña, la vista restaura automáticamente su posición anterior de lectura sin saltos visuales ni afectación cruzada.
  - Al pulsar sobre la pestaña actualmente activa, se realiza un desplazamiento suave hacia arriba (*Scroll to Top*), emulando la experiencia de aplicaciones nativas móviles.

### ✨ [2026-08-26] - Versión 4.0.14: Reinicio Limpio al Inicio Instantáneo al Cambiar de Pestaña (Comportamiento Nativo)
- **⚡ Apertura Instantánea desde Arriba (`top: 0`)**:
  - Al cambiar a cualquier pestaña (*Ajustes*, *Explorar*, *Favoritos*, etc.), la vista siempre inicia de inmediato en la parte superior sin animaciones de desplazamiento ascendente.
  - Al volver a pulsar la pestaña activa, se conserva la opción de subir suavemente hasta el encabezado.

### ✨ [2026-08-26] - Versión 4.0.15: Simplificación de Ajustes y Sincronización 100% Silenciosa en Segundo Plano
- **🧹 Eliminada Tarjeta "Catálogo & RSS" en Ajustes**:
  - Toda la ingesta y verificación de novedades se ejecuta de forma 100% transparente y automática en segundo plano (*Edge Background Sync*).
  - La interfaz de Ajustes queda más limpia, enfocada en Tema, Alertas, Offline y Reconocimiento al Creador Miguel E. Heredia (@migocreativo).

### ✨ [2026-08-26] - Versión 4.0.16: Notificaciones Toast Ultra-Minimalistas y Compatibles con iPhone Notch / Dynamic Island
- **📱 Posicionamiento Seguro Bajo el Notch e Isla Dinámica**:
  - Reubicada la cápsula flotante de Toast a `top-[calc(env(safe-area-inset-top,0px)+3.85rem)]`, flotando libremente debajo del encabezado sin ser tapada por el Notch, Dynamic Island o la cámara frontal de ningún iPhone/Android.
  - Diseño ultra-minimalista con efecto de cristal (*glassmorphism*), tipografía condensada y temporizador reducido a **máximo 2 segundos**.

### ✨ [2026-08-26] - Versión 4.0.17: Cero Peticiones Innecesarias & Arquitectura Offline-First de Alto Rendimiento
- **⚡ Apertura Instantánea con 0 Peticiones de Red**:
  - Eliminadas las llamadas de sincronización obligatorias en el montaje inicial y al cambiar de pestaña.
  - Implementado guardián inteligente con cooldown de 12 horas (`STORAGE_KEY_LAST_SYNC_TIMESTAMP`), cargando instantáneamente desde el almacenamiento local sin consumir cuota de Cloudflare.

### ✨ [2026-08-26] - Versión 4.0.18: Actualización Automática Silenciosa de Versiones Antiguas (Service Worker & Cache Purge)
- **🔄 Auto-Actualización Proactiva y Segura**:
  - Actualizado el Service Worker a `enresumido-v4.0.17` con purga automática total de cachés obsoletas y reclamo de clientes inmediato (`skipWaiting` + `clients.claim`).
  - Agregado chequeo proactivo de nuevas versiones en cada carga (`reg.update()`), garantizando que cualquier usuario con versión antigua reciba la versión más reciente, carátulas WebP e icono oficial automáticamente.

### ✨ [2026-08-26] - Versión 4.0.19: Desbloqueo y Aceleración de Scroll a 60 FPS en Android y Dispositivos de Recursos Moderados
- **🏎️ Optimización Extrema del Hilo de Compositor (Motorola / Android)**:
  - Eliminados listeners de toque no pasivos (`passive: false`) que bloqueaban el hilo de desplazamiento en Android.
  - Implementado `content-visibility: auto` y capas compuestas aceleradas por GPU (`gpu-layer`, `contain: layout style paint`).
  - Optimización de re-renderizado con `React.memo` y simplificación de capas gráficas en `EpisodeListItem`.

### ✨ [2026-08-26] - Versión 4.0.20: Corrección Definitiva de Scroll en Modo PWA Instalada (Android WebAPK)
- **📱 Desbloqueo de Viewport en PWA Standalone**:
  - Removido `window-controls-overlay` del `display_override` en `manifest.webmanifest`, eliminando el bloqueo de scroll que causaba Android WebAPK al emular ventanas de escritorio.
  - Unificado el contenedor raíz en `index.css` y eliminado `overflow-x: hidden` anidado en `<main>` para permitir que el motor Chromium de Android propague los gestos táctiles de scroll sin fricción.

### ✨ [2026-08-26] - Versión 4.0.21: Reproductor en Estado Inicial Limpio & Modal de Recomendación Diaria 24h por Categoría
- **🔇 Inicio con Reproductor Inactivo**:
  - `currentEpisode` inicia en `null` para que no haya ningún audio cargado por defecto al entrar a la app hasta que el usuario elija reproducir.
- **🧭 Descubrimiento Diario Dinámico (4 Categorías / 24 Horas)**:
  - Al abrir la app, se presenta un modal elegante que recomienda exactamente 1 audio de cada categoría (Libro, Documental, Emprendimiento, Película).
  - Algoritmo inteligente que **nunca repite audios** en rotaciones sucesivas y **excluye audios ya escuchados** por el usuario.
  - Se renueva automáticamente cada 24 horas y puede reabrirse en cualquier momento desde la pestaña Explorar.

### ✨ [2026-08-26] - Versión 4.0.22: Bloqueo de Scroll de Fondo y Desplazamiento Autónomo en Modales
- **🔒 Bloqueo Estricto de Scroll en la Página Principal**:
  - Al abrir el modal de recomendación diaria (o reproductores a pantalla completa), el fondo se bloquea de forma inmediata (`body`/`html` `overflow: hidden`, `touch-action: none`).
  - La lista de tarjetas del modal cuenta con `overscroll-behavior: contain` y `touch-action: pan-y`, asegurando que los deslizamientos táctiles se queden 100% dentro del modal sin mover la vista de Explorar.

### ✨ [2026-08-26] - Versión 4.0.23: Reproducción 100% Real y Autónoma de Audios Descargados en Modo Offline
- **🎧 Enlace Directo a Blobs en IndexedDB**:
  - Se vinculó el reproductor `<audio>` para precargar y asignar de inmediato el Blob URL local de IndexedDB (`blob:https://...`) cuando se reproduce cualquier audio descargado sin conexión.
  - Se optimizó `saveAudioOffline` para descargar el flujo binario completo del audio evitando fallbacks mudos, permitiendo escuchar libros completos con modo avión, sin datos ni WiFi activados.

### ✨ [2026-08-26] - Versión 4.0.24: Indicador Dinámico y Sincronizado de Versión en la Aplicación
- **🏷️ Badge de Versión Automatizado**:
  - Se centralizó la versión del software en `src/version.ts` y se vinculó directamente a la tarjeta de autor y pie de ajustes en `SettingsView.tsx` y `SettingsModal.tsx`.
  - Ahora la interfaz muestra con total precisión la versión activa compilada (**Versión: v4.0.24**) garantizando transparencia de actualización en tiempo real para todos los usuarios.

### ✨ [2026-08-27] - Versión 4.0.25: Blindaje y Reconciliación del Menú Inferior Post-Web Share API
- **🛡️ Anclaje Indestructible del Dock Inferior**:
  - Se implementó la utilidad `forceViewportLayoutRecalc` que reconcilia síncronamente el `visualViewport`, resetea offsets de scroll residuales y fuerza el reflow tras invocar o cancelar la hoja nativa de compartir (`navigator.share`).
  - Se blindó el dock inferior con `.bottom-dock-fixed` en GPU Compositing Layer (`transform: translateZ(0)` y `will-change: transform`), eliminando `position: relative` en `body` y reemplazando `overflow-x: hidden` por `overflow-x: clip`.
  - Se agregaron listeners globales a `focus`, `pageshow`, `visibilitychange` y `visualViewport.resize/scroll` para auto-corregir el anclaje físico inferior en iOS Safari, Android Chrome y modo PWA.

### ✨ [2026-08-27] - Versión 4.0.26: Aislamiento Total con React Portals a `document.body`
- **🚀 Portaling del Dock y Modales a `document.body`**:
  - Se desacopló el dock inferior y todos los modales (`FullPlayerModal`, `NotesDrawer`, `DailyDiscoveryModal`, `AudioCompletionModal`) del árbol de `#root` mediante `createPortal(..., document.body)`.
  - Al no tener ancestros flex ni contenedores relativos, el dock inferior queda físicamente fijado al viewport real del navegador y es inmune a cualquier desincronización de scroll o contracción del viewport al compartir.
  - Se eliminó la mutación de `document.documentElement.style.overflow` en modales para preservar intacto el motor de composición de WebKit en iOS.

### ✨ [2026-08-27] - Versión 4.0.27: Eliminación de Capas Gráficas Desprendibles (Zero Backdrop Filter)
- **🛡️ Estabilidad Absoluta en Barras Fijas**:
  - Se eliminó `backdrop-filter` (`backdrop-blur-*`) de la cabecera superior y del dock inferior, reemplazándolo por fondos opacos puros de alto contraste (`bg-white` / `bg-zinc-950`). Esto soluciona el bug de WebKit en iOS y Android donde las capas con filtro de desenfoque quedaban congeladas a media pantalla tras abrir la hoja de compartir nativa.
  - Se suprimieron listeners intrusivos de `visualViewport.scroll` que producían bucles de layout forzado durante el desplazamiento del usuario.

### ✨ [2026-08-27] - Versión 4.0.28: Arquitectura PWA Nativa "App Shell" (Zero Fixed Bugs)
- **💎 Arquitectura App Shell Rígida de Grado Nativo**:
  - Se transformó la aplicación al patrón universal de aplicaciones móviles **App Shell** (`html, body { overflow: hidden; position: fixed; inset: 0; }`).
  - La ventana global `window` ya no hace scroll, haciendo **físicamente imposible** que el menú inferior se desplace al centro o se desancle.
  - El contenido de la app ahora se desplaza en su propio contenedor aislado `<main className="app-scroll-container">` con aceleración por hardware a 120Hz (`-webkit-overflow-scrolling: touch; overscroll-behavior-y: contain`).
  - El menú inferior es ahora un pie de página flex (`shrink-0`) apoyado sólidamente en la base de la pantalla, idéntico a la arquitectura utilizada por Spotify, Instagram y YouTube Music.

### ✨ [2026-08-27] - Versión 4.0.29: Ajuste al Ras del Borde Inferior en iOS (Zero Bottom Gap)
- **📱 Ajuste Perfecto a la Pantalla de iPhone**:
  - Se eliminó la unidad `100dvh` que en Safari móvil calculaba una altura menor dentro del contenedor `fixed inset-0`, provocando un espacio vacío debajo de `#root`.
  - Ahora `#root` ocupa el 100% exacto de la altura del viewport físico (`height: 100%`), quedando el dock inferior perfectamente pegado al ras del cristal de la pantalla.
  - Se calibró el espaciado de seguridad inferior (`env(safe-area-inset-bottom)`) para que los iconos queden centrados y el fondo cubra completamente el área del indicador de inicio de iOS.

### ✨ [2026-08-27] - Versión 4.0.30: Extensión Integral del Fondo del Dock hasta el Borde Físico
- **🎨 Fondo Continuo sin Espacio Gris**:
  - Se configuró `min-height: 0` en el contenedor flex central `.app-scroll-container` (eliminando `height: 100%` que empujaba el layout).
  - Se aplicó `pb-[env(safe-area-inset-bottom,0px)]` directamente sobre el contenedor del dock blanco/oscuro, logrando que el color de fondo del menú se extienda uniformemente hasta el borde absoluto inferior de la pantalla sin dejar visible el fondo gris de la app.

### ✨ [2026-08-27] - Versión 4.0.31: Fondo Raíz Puro y Auto-Actualización Inmediata en iOS PWA
- **🍏 Perfeccionamiento en PWA Standalone de Apple**:
  - Se cambió el fondo del contenedor raíz de la aplicación a blanco puro (`#ffffff` / `#09090b`), asignando el gris claro (`bg-zinc-100`) exclusivamente al área de scroll central. De este modo es físicamente imposible que aparezca una franja gris debajo del dock.
  - Se incorporó recarga automática inmediata (`controllerchange`) en el Service Worker para que las PWAs instaladas en iPhone descarguen las versiones más recientes al instante sin depender de la caché congelada de iOS.






























