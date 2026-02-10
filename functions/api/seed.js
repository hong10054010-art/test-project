function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function id(i) {
  return `fb_${String(i).padStart(5, "0")}`;
}

export async function onRequestPost({ env }) {
  const sources = [
    "support_ticket",
    "github_issue",
    "community_discord",
    "email_feedback",
    "twitter"
  ];

  const userTypes = [
    "developer",
    "indie_developer",
    "startup_customer",
    "enterprise_customer",
    "engineering_manager"
  ];

  const countries = ["UK", "US", "DE", "JP", "TW", "IN"];

  const products = [
    "Workers",
    "Pages",
    "D1",
    "R2",
    "Workers AI",
    "WAF"
  ];

  const templates = [
    "The documentation for {p} is confusing, especially around setup.",
    "Deployment failed with an unclear error message in {p}.",
    "After enabling {p}, we noticed increased latency during peak hours.",
    "Pricing for {p} is hard to estimate. Better usage forecasting would help.",
    "Migration to {p} was painful and lacked a clear checklist.",
    "Customer service response time for {p} has been excellent. Very helpful team!",
    "The {p} dashboard is intuitive and easy to navigate. Great UX!",
    "Integration with our existing tools was seamless for {p}.",
    "Performance issues with {p} during high traffic periods need attention.",
    "The mobile app for {p} crashes frequently on iOS devices.",
    "Love the new features in {p}! Keep up the great work.",
    "Data export functionality in {p} could be more flexible.",
    "Security features in {p} give us confidence in our data protection.",
    "The API documentation for {p} needs more examples and use cases.",
    "Real-time notifications in {p} are very useful for our team.",
    "The pricing model for {p} is transparent and fair.",
    "We've experienced some downtime with {p} recently.",
    "The analytics features in {p} help us make better decisions.",
    "Support team for {p} resolved our issue quickly and professionally.",
    "The onboarding process for {p} could be more streamlined."
  ];

  const now = Date.now();
  // Generate data across a wider time range (up to 365 days ago)
  const maxDaysAgo = 365;

  const statements = [];

  for (let i = 1; i <= 2000; i++) {
    const pid = id(i);
    const source = pick(sources);
    const user_type = pick(userTypes);
    const country = pick(countries);
    const product_area = pick(products);
    const content = pick(templates).replace("{p}", product_area);
    // Generate dates across the full year, with more recent dates being more common
    // Use exponential distribution to favor recent dates
    const daysAgo = Math.floor(Math.pow(Math.random(), 0.7) * maxDaysAgo);
    const created_at = new Date(
      now - daysAgo * 24 * 60 * 60 * 1000
    ).toISOString();

    statements.push(
      env.DB.prepare(
        "INSERT OR REPLACE INTO raw_feedback (id, source, user_type, country, product_area, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        pid,
        source,
        user_type,
        country,
        product_area,
        content,
        created_at
      )
    );
  }

  await env.DB.batch(statements);

  return Response.json({
    ok: true,
    inserted: statements.length
  });
}
