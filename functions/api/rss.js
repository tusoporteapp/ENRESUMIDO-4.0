const DEFAULT_ANCHOR_RSS = "https://anchor.fm/s/112847da4/podcast/rss";

const FALLBACK_RSS_FEEDS = [
  "https://anchor.fm/s/112847da4/podcast/rss",
  "https://anchor.fm/s/112e9d49c/podcast/rss",
  "https://anchor.fm/s/2b520a0/podcast/rss",
  "https://anchor.fm/s/32d0c10/podcast/rss",
  "https://anchor.fm/s/e5714254/podcast/rss",
  "https://anchor.fm/s/8233f20/podcast/rss"
];

const FALLBACK_PODCAST_DATA = {
  podcast: {
    title: "EnResumido",
    description: "Tu podcast de resúmenes de audio en formato rápido y dinámico. Escucha resúmenes, guarda tus capítulos favoritos y continúa donde lo dejaste.",
    link: "https://anchor.fm",
    author: "EnResumido Studio",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80",
    language: "es",
    category: "Noticias y Resúmenes",
    copyright: "© EnResumido Studio",
    feedUrl: DEFAULT_ANCHOR_RSS,
  },
  episodes: [
    {
      id: "anchor-demo-ep-1",
      title: "Episodio 1: Diseñando Interfaces para iOS con Tonalidades Naturales",
      description: "Exploramos la filosofía de diseño 'Natural Tones', el uso estratégico del color violeta #8A2BE2 y la micro-interacción en apps móviles modernas.",
      pubDate: "Mon, 27 Jul 2026 10:00:00 GMT",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      audioType: "audio/mpeg",
      audioSize: 4500000,
      durationSeconds: 372,
      durationFormatted: "6:12",
      episodeNumber: 1,
      seasonNumber: 1,
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80",
      link: "https://anchor.fm",
    },
    {
      id: "anchor-demo-ep-2",
      title: "Episodio 2: Sincronización en la Nube y Estado Local",
      description: "Cómo construir reproductores de audio resilientes con almacenamiento offline, progreso reanudable y sincronización transparente.",
      pubDate: "Sun, 26 Jul 2026 14:30:00 GMT",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      audioType: "audio/mpeg",
      audioSize: 5200000,
      durationSeconds: 425,
      durationFormatted: "7:05",
      episodeNumber: 2,
      seasonNumber: 1,
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
      link: "https://anchor.fm",
    },
    {
      id: "anchor-demo-ep-3",
      title: "Episodio 3: El Futuro del Podcasting y Feeds RSS Automatizados",
      description: "Análisis técnico de cómo funcionan los RSS proxies, distribución distribuida de podcasts y optimización de streams de audio.",
      pubDate: "Fri, 24 Jul 2026 09:15:00 GMT",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      audioType: "audio/mpeg",
      audioSize: 3900000,
      durationSeconds: 310,
      durationFormatted: "5:10",
      episodeNumber: 3,
      seasonNumber: 1,
      image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=80",
      link: "https://anchor.fm",
    },
    {
      id: "anchor-demo-ep-4",
      title: "Episodio 4: Productividad, Hábitos y Audio Narrativo",
      description: "Estrategias para optimizar la retención de aprendizaje escuchando podcasts a diferentes velocidades (1.25x, 1.5x) con temporizador de apagado.",
      pubDate: "Wed, 22 Jul 2026 18:00:00 GMT",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      audioType: "audio/mpeg",
      audioSize: 6100000,
      durationSeconds: 502,
      durationFormatted: "8:22",
      episodeNumber: 4,
      seasonNumber: 1,
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
      link: "https://anchor.fm",
    }
  ],
  totalEpisodes: 4,
};

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

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const feedUrl = url.searchParams.get("url") || DEFAULT_ANCHOR_RSS;
  const now = Date.now();

  const jsonHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  };

  let xmlText = "";
  let fetchSuccess = false;

  try {
    const urlObj = new URL(feedUrl);
    urlObj.searchParams.set("_cf_t", String(now));

    const res = await fetch(urlObj.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
        "Cache-Control": "no-cache",
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
    return new Response(JSON.stringify(FALLBACK_PODCAST_DATA), { headers: jsonHeaders });
  }

  try {
    const channelMatch = xmlText.match(/<channel[^>]*>([\s\S]*?)<\/channel>/i);
    if (!channelMatch) {
      return new Response(JSON.stringify(FALLBACK_PODCAST_DATA), { headers: jsonHeaders });
    }

    const channelXml = channelMatch[1];
    const podcastTitle = getTagContent(channelXml, "title") || "Anchor Podcast";
    const podcastDesc = getTagContent(channelXml, "description") || "Escucha episodios de Anchor Podcast.";
    const podcastLink = getTagContent(channelXml, "link") || feedUrl;
    const podcastAuthor = getTagContent(channelXml, "itunes:author") || getTagContent(channelXml, "author") || "Anchor Podcast";
    const podcastImage = getAttrValue(channelXml, "itunes:image", "href") || getTagContent(channelXml, "url") || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80";

    const podcastInfo = {
      title: podcastTitle,
      description: podcastDesc,
      link: podcastLink,
      author: podcastAuthor,
      image: podcastImage,
      language: getTagContent(channelXml, "language") || "es",
      category: getAttrValue(channelXml, "itunes:category", "text") || "Podcast",
      copyright: getTagContent(channelXml, "copyright") || "",
      feedUrl: feedUrl,
    };

    const itemMatches = xmlText.match(/<item[^>]*>([\s\S]*?)<\/item>/gi) || [];
    const episodes = itemMatches.map((itemXml, index) => {
      const epTitle = cleanTitle(getTagContent(itemXml, "title") || `Episodio ${index + 1}`);
      const epDesc = getTagContent(itemXml, "description") || getTagContent(itemXml, "content:encoded") || "";
      const pubDate = getTagContent(itemXml, "pubDate") || "";

      const audioUrl = getAttrValue(itemXml, "enclosure", "url") || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      const audioType = getAttrValue(itemXml, "enclosure", "type") || "audio/mpeg";
      const audioSize = Number(getAttrValue(itemXml, "enclosure", "length") || 0);

      const epImage = getAttrValue(itemXml, "itunes:image", "href") || podcastImage;
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

      return {
        id: String(guid),
        title: epTitle,
        description: epDesc,
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

    return new Response(
      JSON.stringify({
        podcast: podcastInfo,
        episodes: episodes,
        totalEpisodes: episodes.length,
      }),
      { headers: jsonHeaders }
    );
  } catch (err) {
    return new Response(JSON.stringify(FALLBACK_PODCAST_DATA), { headers: jsonHeaders });
  }
}
