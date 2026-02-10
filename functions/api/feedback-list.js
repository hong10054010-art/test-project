// API endpoint to return feedback items in the format expected by FeedbackAnalysisPage
export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const source = url.searchParams.get("source");
  const sentiment = url.searchParams.get("sentiment");
  const category = url.searchParams.get("category");
  const timeRange = url.searchParams.get("timeRange") || "30";
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
  const search = url.searchParams.get("search") || "";

  // Calculate date range
  const now = new Date();
  const nowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  let fromDate = new Date(nowUTC);

  if (timeRange === "7") {
    fromDate.setUTCDate(nowUTC.getUTCDate() - 7);
  } else if (timeRange === "30") {
    fromDate.setUTCDate(nowUTC.getUTCDate() - 30);
  } else if (timeRange === "90") {
    fromDate.setUTCDate(nowUTC.getUTCDate() - 90);
  } else if (timeRange === "365") {
    fromDate.setUTCDate(nowUTC.getUTCDate() - 365);
  } else {
    fromDate = new Date(0);
  }

  const where = [];
  const args = [];

  if (timeRange !== "all") {
    const fromDateISO = fromDate.toISOString();
    where.push("r.created_at >= ?");
    args.push(fromDateISO);
  }

  if (source && source !== "all") {
    // Map display names to API format
    let apiSource = source;
    if (source === "Email") apiSource = "email_feedback";
    else if (source === "Support Ticket") apiSource = "support_ticket";
    else if (source === "Social Media") apiSource = "twitter";
    else if (source === "Review") apiSource = "github_issue";
    else if (source === "Survey") apiSource = "community_discord";
    // If already in API format, use as is
    where.push("r.source = ?");
    args.push(apiSource);
  }

  if (category && category !== "all") {
    where.push("r.category = ?");
    args.push(category);
  }

  if (sentiment && sentiment !== "all") {
    where.push("e.sentiment = ?");
    args.push(sentiment);
  }

  if (search) {
    where.push("(r.content LIKE ? OR r.user_name LIKE ? OR r.id LIKE ?)");
    const searchPattern = `%${search}%`;
    args.push(searchPattern, searchPattern, searchPattern);
  }

  const whereSql = where.length ? ("WHERE " + where.join(" AND ")) : "";

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as count 
    FROM raw_feedback r
    LEFT JOIN enriched_feedback e ON r.id = e.id
    ${whereSql}
  `;
  const totalResult = await env.DB.prepare(countQuery).bind(...args).first();
  const totalCount = totalResult?.count || 0;

  // Get paginated results
  const offset = (page - 1) * pageSize;
  const dataQuery = `
    SELECT 
      r.id,
      r.source,
      r.user_name,
      r.content,
      r.rating,
      r.category,
      r.tags,
      r.verified,
      r.created_at,
      IFNULL(e.sentiment, 'neutral') as sentiment
    FROM raw_feedback r
    LEFT JOIN enriched_feedback e ON r.id = e.id
    ${whereSql}
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const results = await env.DB.prepare(dataQuery).bind(...args, pageSize, offset).all();

  // Source display name mapping
  const sourceDisplayNames = {
    "support_ticket": "Support Ticket",
    "github_issue": "GitHub Issue",
    "community_discord": "Community Discord",
    "email_feedback": "Email",
    "twitter": "Social Media"
  };

  // Format results to match FeedbackItem interface
  const items = (results.results || []).map((row) => {
    const createdDate = new Date(row.created_at);
    const dateStr = createdDate.toISOString().replace('T', ' ').substring(0, 16);
    
    let tags = [];
    try {
      if (row.tags) {
        tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags;
      }
    } catch (e) {
      tags = [];
    }

    return {
      id: row.id,
      date: dateStr,
      user: row.user_name || "Unknown User",
      source: sourceDisplayNames[row.source] || row.source,
      sentiment: row.sentiment || "neutral",
      rating: row.rating || 3,
      category: row.category || "Product Feature",
      tags: Array.isArray(tags) ? tags : [],
      text: row.content || "",
      verified: row.verified === 1
    };
  });

  return Response.json({
    ok: true,
    items,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize)
  });
}
