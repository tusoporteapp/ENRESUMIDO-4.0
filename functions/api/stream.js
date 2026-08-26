const ALLOWED_HOSTS = [
  'anchor.fm',
  'd3t3ozftmdmh3i.cloudfront.net',
  'd3ctxlq1ktw2nl.cloudfront.net',
  'cloudfront.net',
  'spotifycdn.com',
  'spotify.com',
  'scdn.co',
  'podcasters.spotify.com',
  'akamaized.net',
  'soundhelix.com',
  'enresumido.com',
  'images.unsplash.com',
  'storage.googleapis.com',
];

const STREAM_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, Content-Type, Accept, Origin, User-Agent',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, Content-Type',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Cross-Origin-Embedder-Policy': 'unsafe-none',
};

function isAllowedUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    return ALLOWED_HOSTS.some((allowed) => parsed.hostname === allowed || parsed.hostname.endsWith('.' + allowed));
  } catch {
    return false;
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: STREAM_CORS_HEADERS,
  });
}

export async function onRequestHead(context) {
  return handleAudioProxy(context, true);
}

export async function onRequestGet(context) {
  return handleAudioProxy(context, false);
}

async function handleAudioProxy(context, isHeadRequest) {
  const url = new URL(context.request.url);
  let targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'URL parameter required' }), {
      status: 400,
      headers: { ...STREAM_CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  if (targetUrl.includes('%3A%2F%2F')) {
    try {
      targetUrl = decodeURIComponent(targetUrl);
    } catch {}
  }

  if (!isAllowedUrl(targetUrl)) {
    return new Response(JSON.stringify({ error: 'Host not allowed in proxy whitelist' }), {
      status: 403,
      headers: { ...STREAM_CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const clientHeaders = new Headers();
  const rangeHeader = context.request.headers.get('Range');
  if (rangeHeader) {
    clientHeaders.set('Range', rangeHeader);
  }

  const userAgent = context.request.headers.get('User-Agent') || 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
  clientHeaders.set('User-Agent', userAgent);
  clientHeaders.set('Accept', context.request.headers.get('Accept') || '*/*');

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: isHeadRequest ? 'HEAD' : 'GET',
      headers: clientHeaders,
      redirect: 'follow',
      cf: {
        cacheTtl: 86400,
        cacheEverything: true,
      },
    });

    const outHeaders = new Headers();
    for (const [k, v] of Object.entries(STREAM_CORS_HEADERS)) {
      outHeaders.set(k, v);
    }

    const headersToForward = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'last-modified',
      'etag',
    ];

    for (const h of headersToForward) {
      const val = upstreamResponse.headers.get(h);
      if (val) outHeaders.set(h, val);
    }

    if (!outHeaders.has('Accept-Ranges')) {
      outHeaders.set('Accept-Ranges', 'bytes');
    }
    if (!outHeaders.has('Content-Type')) {
      outHeaders.set('Content-Type', 'audio/mpeg');
    }

    if (upstreamResponse.status === 206) {
      outHeaders.set('Cache-Control', 'public, max-age=3600');
    } else {
      outHeaders.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    }

    const nullBodyStatus = [204, 205, 304];
    const hasNoBody = isHeadRequest || nullBodyStatus.includes(upstreamResponse.status);

    return new Response(hasNoBody ? null : upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText || undefined,
      headers: outHeaders,
    });
  } catch (err) {
    return Response.redirect(targetUrl, 302);
  }
}
