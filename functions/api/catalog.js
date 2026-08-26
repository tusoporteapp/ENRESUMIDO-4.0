/**
 * Cloudflare Pages Function: /api/catalog
 * API de Catálogo Edge Paginado con Soporte para 60,000+ Audiolibros
 * Permite paginación serverless, filtrado por categorías, autores y búsqueda Full-Text rápida.
 */

const DEFAULT_ANCHOR_RSS = "https://anchor.fm/s/112847da4/podcast/rss";

const FALLBACK_RSS_FEEDS = [
  "https://anchor.fm/s/112847da4/podcast/rss",
  "https://anchor.fm/s/112e9d49c/podcast/rss",
  "https://anchor.fm/s/2b520a0/podcast/rss",
  "https://anchor.fm/s/32d0c10/podcast/rss",
  "https://anchor.fm/s/e5714254/podcast/rss",
  "https://anchor.fm/s/8233f20/podcast/rss"
];

function cleanTitle(rawTitle) {
  if (!rawTitle) return "";
  let title = String(rawTitle).trim();
  let prevTitle = "";
  while (title !== prevTitle) {
    prevTitle = title;
    title = title
      .replace(/^(Análisis|Analisis|Analisi|An\u00e1lisis|\[Resumen\]|\(Resumen\)|Resumen|Audio\s*Resumen|Audiolibro|Audiobook|Episodio\s*\d+|Ep\.\s*\d+|Resumen\s*de\s*Libros?)\s*[:\-\|]?\s*/i, "")
      .replace(/^\[[^\]]+\]\s*/, "")
      .trim();
  }
  return title || rawTitle;
}

function normalizeCategory(cat) {
  if (!cat) return 'Otros';
  const c = cat.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (c.startsWith('emprendimiento') || c.startsWith('emprender') || c.startsWith('startup') || c.startsWith('negocio')) return 'Emprendimiento';
  if (c.startsWith('serie')) return 'Series';
  if (c.startsWith('pelicula')) return 'Películas';
  if (c.startsWith('documental')) return 'Documentales';
  if (c.startsWith('libro') || c.startsWith('audiolibro')) return 'Libros';
  if (c.startsWith('biografia')) return 'Biografías';
  if (c.startsWith('podcast')) return 'Podcasts';
  if (c.startsWith('anime')) return 'Anime';
  if (c.startsWith('entrevista')) return 'Entrevistas';
  return cat.trim().charAt(0).toUpperCase() + cat.trim().slice(1);
}

function parseEpisodeTitle(title) {
  if (!title) return { bookTitle: '', authorName: '', category: '' };

  const clean = String(title).trim();
  const parts = clean.split(/\s*[\-\–\—\|]\s*|\s*:\s*/).filter(Boolean);

  let bookTitle = clean;
  let authorName = '';
  let category = '';

  const KNOWN_CATEGORIES = [
    'Emprendimiento',
    'Libros',
    'Series',
    'Películas',
    'Documentales',
    'Biografías',
    'Podcasts',
    'Anime',
    'Entrevistas',
  ];

  if (parts.length >= 3) {
    const lastPart = parts[parts.length - 1].trim();
    const midPart = parts[parts.length - 2].trim();
    const firstParts = parts.slice(0, -2).join(' - ').trim();

    category = normalizeCategory(lastPart);
    authorName = midPart;
    bookTitle = firstParts;
  } else if (parts.length === 2) {
    const p0 = parts[0].trim();
    const p1 = parts[1].trim();
    const normP1 = normalizeCategory(p1);

    if (KNOWN_CATEGORIES.includes(normP1)) {
      category = normP1;
      bookTitle = p0;
    } else {
      bookTitle = p0;
      authorName = p1;
    }
  }

  return { bookTitle: bookTitle || clean, authorName: authorName.trim(), category };
}

function getTagContent(xml, tagName) {
  const cdataMatch = xml.match(new RegExp(`<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tagName}>`, "i"));
  if (cdataMatch) return cdataMatch[1].trim();
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim() : "";
}

function getAttrValue(xml, tagName, attrName) {
  const match = xml.match(new RegExp(`<${tagName}[^>]*\\b${attrName}=["']([^"']*)["']`, "i"));
  return match ? match[1] : "";
}

function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, "\n\n")
    .replace(/<(br|hr)\s*\/?>/gi, "\n")
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

let inMemoryCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 2000; // 2 segundos max para tiempo real

async function getOrFetchMasterCatalog(env, feedUrl, forceFresh = false) {
  const now = Date.now();
  if (!forceFresh && inMemoryCache && now - lastCacheTime < CACHE_TTL_MS) {
    return inMemoryCache;
  }

  let xmlText = "";
  let fetchSuccess = false;

  try {
    const freshFeedUrl = feedUrl || DEFAULT_ANCHOR_RSS;
    const res = await fetch(freshFeedUrl, {
      redirect: "follow",
      headers: {
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    if (res.ok) {
      xmlText = await res.text();
      fetchSuccess = true;
    }
  } catch (e) {}

  if (!fetchSuccess) {
    for (const fb of FALLBACK_RSS_FEEDS) {
      try {
        const res = await fetch(fb, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
          },
        });
        if (res.ok) {
          xmlText = await res.text();
          fetchSuccess = true;
          break;
        }
      } catch (e) {}
    }
  }

  if (!fetchSuccess || !xmlText.trim()) {
    return null;
  }

  const channelMatch = xmlText.match(/<channel[^>]*>([\s\S]*?)<\/channel>/i);
  if (!channelMatch) return null;

  const channelXml = channelMatch[1];
  const podcastInfo = {
    title: getTagContent(channelXml, "title") || "EnResumido",
    description: getTagContent(channelXml, "description") || "Resúmenes de libros y audiolibros.",
    link: getTagContent(channelXml, "link") || "https://enresumido.com",
    author: getTagContent(channelXml, "itunes:author") || getTagContent(channelXml, "author") || "EnResumido",
    image: getAttrValue(channelXml, "itunes:image", "href") || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80",
    language: getTagContent(channelXml, "language") || "es",
    category: getAttrValue(channelXml, "itunes:category", "text") || "Audiolibros",
    feedUrl: feedUrl || DEFAULT_ANCHOR_RSS,
  };

  const itemMatches = xmlText.match(/<item[^>]*>([\s\S]*?)<\/item>/gi) || [];
  const episodes = itemMatches.map((itemXml, index) => {
    const rawTitle = getTagContent(itemXml, "title") || `Episodio ${index + 1}`;
    const epTitle = cleanTitle(rawTitle);
    const epDesc = getTagContent(itemXml, "description") || getTagContent(itemXml, "content:encoded") || "";
    const pubDate = getTagContent(itemXml, "pubDate") || "";
    const audioUrl = getAttrValue(itemXml, "enclosure", "url") || "";
    const audioType = getAttrValue(itemXml, "enclosure", "type") || "audio/mpeg";
    const audioSize = Number(getAttrValue(itemXml, "enclosure", "length") || 0);
    const epImage = getAttrValue(itemXml, "itunes:image", "href") || podcastInfo.image;
    const guid = getTagContent(itemXml, "guid") || audioUrl || `ep-${index}`;

    const rawDuration = getTagContent(itemXml, "itunes:duration") || "";
    let durationFormatted = rawDuration;
    let durationSeconds = 0;

    if (/^\d+$/.test(rawDuration)) {
      durationSeconds = parseInt(rawDuration, 10);
      const mins = Math.floor(durationSeconds / 60);
      const secs = durationSeconds % 60;
      durationFormatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    } else if (rawDuration.includes(":")) {
      const parts = rawDuration.split(":").map(p => parseInt(p, 10));
      if (parts.length === 3) {
        durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        durationFormatted = `${parts[0]}:${parts[1] < 10 ? "0" : ""}${parts[1]}:${parts[2] < 10 ? "0" : ""}${parts[2]}`;
      } else if (parts.length === 2) {
        durationSeconds = parts[0] * 60 + parts[1];
        durationFormatted = `${parts[0]}:${parts[1] < 10 ? "0" : ""}${parts[1]}`;
      }
    }

    if (!durationFormatted || durationSeconds === 0) {
      durationFormatted = "15:00";
      durationSeconds = 900;
    }

    const { category, authorName, bookTitle } = parseEpisodeTitle(epTitle);

    return {
      id: String(guid),
      title: rawTitle,
      rawTitle: rawTitle,
      bookTitle: bookTitle,
      author: authorName || "EnResumido",
      category: category || "Libros",
      description: stripHtml(epDesc),
      pubDate: pubDate,
      audioUrl: audioUrl,
      audioType: audioType,
      audioSize: audioSize,
      durationSeconds: durationSeconds,
      durationFormatted: durationFormatted,
      episodeNumber: Number(getTagContent(itemXml, "itunes:episode") || index + 1),
      seasonNumber: Number(getTagContent(itemXml, "itunes:season") || 1),
      image: epImage,
      link: getTagContent(itemXml, "link") || "",
    };
  });

  const fullData = { podcast: podcastInfo, episodes };
  inMemoryCache = fullData;
  lastCacheTime = now;

  return fullData;
}

export async function onRequest(context) {
  const jsonHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
  };

  try {
    const url = new URL(context.request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(10000, Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)));
    const categoryFilter = url.searchParams.get("category") || null;
    const authorFilter = url.searchParams.get("author") || null;
    const searchQuery = (url.searchParams.get("search") || url.searchParams.get("q") || "").trim().toLowerCase();
    const sort = url.searchParams.get("sort") || "recent";
    const feedUrl = url.searchParams.get("feedUrl") || DEFAULT_ANCHOR_RSS;
    const forceFresh = url.searchParams.get("fresh") === "true";

    const catalog = await getOrFetchMasterCatalog(context.env, feedUrl, forceFresh);

    if (!catalog || !catalog.episodes) {
      return new Response(
        JSON.stringify({
          podcast: null,
          episodes: [],
          pagination: { page, limit, totalEpisodes: 0, filteredTotal: 0, totalPages: 0, hasMore: false },
        }),
        { headers: jsonHeaders }
      );
    }

    let filtered = [...catalog.episodes];

    // 1. Filtrar por categoría (ej. Libros, Series, Películas, etc.)
    if (categoryFilter) {
      const targetNorm = normalizeCategory(categoryFilter);
      filtered = filtered.filter((ep) => {
        const epNorm = normalizeCategory(ep.category || ep.title);
        return epNorm === targetNorm;
      });
    }

    // 2. Filtrar por autor
    if (authorFilter) {
      const authLow = authorFilter.toLowerCase();
      filtered = filtered.filter((ep) => {
        return (ep.author && ep.author.toLowerCase().includes(authLow)) || ep.title.toLowerCase().includes(authLow);
      });
    }

    // 3. Filtrar por búsqueda de texto
    if (searchQuery) {
      const cleanSearch = searchQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      filtered = filtered.filter((ep) => {
        const cleanTitle = (ep.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cleanDesc = (ep.description || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return cleanTitle.includes(cleanSearch) || cleanDesc.includes(cleanSearch);
      });
    }

    // 4. Ordenar
    if (sort === "duration_asc") {
      filtered.sort((a, b) => a.durationSeconds - b.durationSeconds);
    } else if (sort === "duration_desc") {
      filtered.sort((a, b) => b.durationSeconds - a.durationSeconds);
    } else if (sort === "title_asc") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    // 5. Paginación serverless
    const filteredTotal = filtered.length;
    const totalPages = Math.ceil(filteredTotal / limit);
    const startIndex = (page - 1) * limit;
    const paginatedEpisodes = filtered.slice(startIndex, startIndex + limit);
    const hasMore = page < totalPages;

    return new Response(
      JSON.stringify({
        podcast: catalog.podcast,
        episodes: paginatedEpisodes,
        pagination: {
          page,
          limit,
          totalEpisodes: catalog.episodes.length,
          filteredTotal,
          totalPages,
          hasMore,
          nextPage: hasMore ? page + 1 : null,
        },
      }),
      { headers: jsonHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: String(err && err.message ? err.message : err),
        episodes: [],
        podcast: null,
      }),
      { status: 500, headers: jsonHeaders }
    );
  }
}
