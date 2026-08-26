/**
 * Cloudflare Pages Function: /api/search
 * Búsqueda Full-Text en el Edge con Soporte para Cloudflare D1 y Caché Perimetral
 */

export async function onRequest(context) {
  const jsonHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
  };

  try {
    const url = new URL(context.request.url);
    const query = (url.searchParams.get("q") || url.searchParams.get("search") || "").trim();
    const category = url.searchParams.get("category") || null;
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "30", 10)));
    const offset = (page - 1) * limit;

    // 1. Si existe Cloudflare D1 Database Binding (env.DB)
    if (context.env && context.env.DB) {
      const db = context.env.DB;

      let sql = "SELECT * FROM episodes WHERE 1=1";
      const params = [];

      if (category && category !== "TODOS") {
        sql += " AND category = ?";
        params.push(category);
      }

      if (query) {
        const cleanQ = `%${query}%`;
        sql += " AND (title LIKE ? OR original_author LIKE ? OR description LIKE ?)";
        params.push(cleanQ, cleanQ, cleanQ);
      }

      sql += " ORDER BY pub_date DESC LIMIT ? OFFSET ?";
      params.push(limit, offset);

      const { results } = await db.prepare(sql).bind(...params).all();

      // Count query for pagination
      let countSql = "SELECT COUNT(*) as total FROM episodes WHERE 1=1";
      const countParams = [];
      if (category && category !== "TODOS") {
        countSql += " AND category = ?";
        countParams.push(category);
      }
      if (query) {
        const cleanQ = `%${query}%`;
        countSql += " AND (title LIKE ? OR original_author LIKE ? OR description LIKE ?)";
        countParams.push(cleanQ, cleanQ, cleanQ);
      }
      const countRes = await db.prepare(countSql).bind(...countParams).first();
      const total = countRes ? countRes.total : results.length;
      const totalPages = Math.ceil(total / limit);

      return new Response(
        JSON.stringify({
          source: "d1",
          query,
          category,
          results: results || [],
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore: page < totalPages,
          },
        }),
        { headers: jsonHeaders }
      );
    }

    // 2. Fallback a /api/catalog si D1 no está configurado aún
    const catalogUrl = new URL("/api/catalog", url.origin);
    if (query) catalogUrl.searchParams.set("q", query);
    if (category) catalogUrl.searchParams.set("category", category);
    catalogUrl.searchParams.set("page", String(page));
    catalogUrl.searchParams.set("limit", String(limit));

    const res = await fetch(catalogUrl.toString());
    const data = await res.json();

    return new Response(
      JSON.stringify({
        source: "edge_catalog",
        query,
        category,
        results: data.episodes || [],
        pagination: data.pagination || { page, limit, total: 0, hasMore: false },
      }),
      { headers: jsonHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: String(err && err.message ? err.message : err),
        results: [],
      }),
      { status: 500, headers: jsonHeaders }
    );
  }
}
