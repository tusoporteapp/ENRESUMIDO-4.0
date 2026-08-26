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