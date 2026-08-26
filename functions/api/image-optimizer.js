/**
 * Cloudflare Pages Function: /api/image-optimizer
 * Redirects or proxies images with proper caching and WebP optimization headers.
 */
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  const width = url.searchParams.get('w') || '480';
  const quality = url.searchParams.get('q') || '80';

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing required url query parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // Handle Unsplash images directly with WebP query params
  if (targetUrl.includes('images.unsplash.com')) {
    const parsedWidth = parseInt(width, 10);
    const bucket = parsedWidth <= 150 ? 150 : parsedWidth <= 300 ? 300 : parsedWidth <= 600 ? 600 : 800;
    const finalUrl = targetUrl.includes('?') 
      ? targetUrl.replace(/w=\d+/, 'w=' + bucket) + '&fm=webp'
      : targetUrl + '?w=' + bucket + '&auto=format&fit=crop&q=' + quality + '&fm=webp';
    return Response.redirect(finalUrl, 302);
  }

  // Proxy fetch the image
  try {
    const imageRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    if (!imageRes.ok) {
      return Response.redirect(targetUrl, 302);
    }

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(imageRes.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    return Response.redirect(targetUrl, 302);
  }
}