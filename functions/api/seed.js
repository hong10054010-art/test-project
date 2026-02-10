function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function id(i) {
  // Use FB-XXXX format to match Feedback page display
  return `FB-${String(8000 + i).padStart(4, "0")}`;
}

// User names for realistic data
const userNames = [
  "Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kim", "Jessica Taylor",
  "Robert Martinez", "Amanda Lee", "James Wilson", "Lisa Anderson", "Christopher Brown",
  "Maria Garcia", "Daniel White", "Jennifer Davis", "Matthew Miller", "Patricia Wilson",
  "Andrew Moore", "Michelle Taylor", "Kevin Anderson", "Nicole Thomas", "Ryan Jackson",
  "Stephanie Harris", "Brandon Martin", "Rachel Thompson", "Justin Martinez", "Lauren Clark",
  "Tyler Lewis", "Ashley Walker", "Jordan Hall", "Samantha Young", "Alexis King"
];

// Source display names mapping
const sourceDisplayNames = {
  "support_ticket": "Support Ticket",
  "github_issue": "GitHub Issue",
  "community_discord": "Community Discord",
  "email_feedback": "Email",
  "twitter": "Social Media"
};

// Categories
const categories = [
  "Product Feature",
  "Performance",
  "Customer Support",
  "Integration",
  "UI/UX",
  "Pricing"
];

// Tags pool
const tagPools = {
  "Product Feature": ["UI", "Dashboard", "AI", "Insights", "Analytics", "Features"],
  "Performance": ["Speed", "Loading", "Latency", "Response Time", "Optimization"],
  "Customer Support": ["Support", "Response Time", "Help", "Assistance"],
  "Integration": ["CRM", "Documentation", "API", "Slack", "Easy Setup", "Connector"],
  "UI/UX": ["Design", "Colors", "Interface", "User Experience", "Layout"],
  "Pricing": ["Cost", "Small Business", "Pricing Model", "Billing"]
};

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
    {
      text: "The documentation for {p} is confusing, especially around setup.",
      sentiment: "negative",
      rating: 2,
      category: "Product Feature",
      tags: ["Documentation", "Setup"]
    },
    {
      text: "Deployment failed with an unclear error message in {p}.",
      sentiment: "negative",
      rating: 2,
      category: "Performance",
      tags: ["Deployment", "Error"]
    },
    {
      text: "After enabling {p}, we noticed increased latency during peak hours.",
      sentiment: "negative",
      rating: 2,
      category: "Performance",
      tags: ["Speed", "Latency"]
    },
    {
      text: "Pricing for {p} is hard to estimate. Better usage forecasting would help.",
      sentiment: "neutral",
      rating: 3,
      category: "Pricing",
      tags: ["Cost", "Pricing Model"]
    },
    {
      text: "Migration to {p} was painful and lacked a clear checklist.",
      sentiment: "negative",
      rating: 2,
      category: "Integration",
      tags: ["Migration", "Documentation"]
    },
    {
      text: "Customer service response time for {p} has been excellent. Very helpful team!",
      sentiment: "positive",
      rating: 5,
      category: "Customer Support",
      tags: ["Support", "Response Time"]
    },
    {
      text: "The {p} dashboard is incredibly intuitive! The AI insights have helped us identify trends.",
      sentiment: "positive",
      rating: 5,
      category: "Product Feature",
      tags: ["UI", "Dashboard", "AI"]
    },
    {
      text: "Integration with our existing tools was seamless for {p}.",
      sentiment: "positive",
      rating: 4,
      category: "Integration",
      tags: ["Integration", "Easy Setup"]
    },
    {
      text: "Analytics load a bit slowly when handling large datasets. Features are comprehensive though.",
      sentiment: "neutral",
      rating: 3,
      category: "Performance",
      tags: ["Speed", "Loading"]
    },
    {
      text: "The mobile app for {p} crashes frequently on iOS devices.",
      sentiment: "negative",
      rating: 2,
      category: "Performance",
      tags: ["Mobile", "Speed"]
    },
    {
      text: "Love the new features in {p}! Keep up the great work.",
      sentiment: "positive",
      rating: 5,
      category: "Product Feature",
      tags: ["Features", "AI"]
    },
    {
      text: "Data export functionality in {p} could be more flexible.",
      sentiment: "neutral",
      rating: 3,
      category: "Product Feature",
      tags: ["Features", "Export"]
    },
    {
      text: "Security features in {p} give us confidence in our data protection.",
      sentiment: "positive",
      rating: 4,
      category: "Product Feature",
      tags: ["Security", "Features"]
    },
    {
      text: "The API documentation for {p} needs more examples and use cases.",
      sentiment: "negative",
      rating: 2,
      category: "Integration",
      tags: ["API", "Documentation"]
    },
    {
      text: "Real-time notifications in {p} are very useful for our team.",
      sentiment: "positive",
      rating: 4,
      category: "Product Feature",
      tags: ["Features", "Notifications"]
    },
    {
      text: "The pricing model for {p} is transparent and fair.",
      sentiment: "positive",
      rating: 4,
      category: "Pricing",
      tags: ["Pricing Model", "Cost"]
    },
    {
      text: "We've experienced some downtime with {p} recently.",
      sentiment: "negative",
      rating: 2,
      category: "Performance",
      tags: ["Downtime", "Reliability"]
    },
    {
      text: "The analytics features in {p} help us make better decisions.",
      sentiment: "positive",
      rating: 5,
      category: "Product Feature",
      tags: ["Analytics", "Insights"]
    },
    {
      text: "Support team for {p} resolved our issue quickly and professionally.",
      sentiment: "positive",
      rating: 5,
      category: "Customer Support",
      tags: ["Support", "Response Time"]
    },
    {
      text: "The onboarding process for {p} could be more streamlined.",
      sentiment: "neutral",
      rating: 3,
      category: "UI/UX",
      tags: ["Design", "User Experience"]
    },
    {
      text: "Love the clean interface and the color scheme. Makes working with data enjoyable!",
      sentiment: "positive",
      rating: 4,
      category: "UI/UX",
      tags: ["Design", "Colors"]
    },
    {
      text: "Having trouble integrating with our existing CRM. Documentation could be more detailed.",
      sentiment: "negative",
      rating: 2,
      category: "Integration",
      tags: ["CRM", "Documentation"]
    },
    {
      text: "The AI-powered insights are game-changing! Discovered patterns we never knew existed.",
      sentiment: "positive",
      rating: 5,
      category: "Product Feature",
      tags: ["AI", "Insights"]
    },
    {
      text: "Slack integration works perfectly. Setup was straightforward and notifications are timely.",
      sentiment: "positive",
      rating: 4,
      category: "Integration",
      tags: ["Slack", "Easy Setup"]
    },
    {
      text: "The features are great, but pricing could be more competitive for small businesses.",
      sentiment: "neutral",
      rating: 3,
      category: "Pricing",
      tags: ["Cost", "Small Business"]
    }
  ];

  const now = Date.now();
  // Generate data across a wider time range (up to 365 days ago)
  const maxDaysAgo = 365;

  const statements = [];

  for (let i = 1; i <= 2000; i++) {
    const pid = id(i);
    const source = pick(sources);
    const user_type = pick(userTypes);
    const user_name = pick(userNames);
    const country = pick(countries);
    const product_area = pick(products);
    const template = pick(templates);
    const content = template.text.replace("{p}", product_area);
    
    // Determine category - use template category or map from product
    const category = template.category || (product_area === "Workers" ? "Performance" : "Product Feature");
    
    // Get tags based on category
    const availableTags = tagPools[category] || tagPools["Product Feature"];
    const numTags = Math.floor(Math.random() * 2) + 1; // 1-2 tags
    const selectedTags = [];
    for (let j = 0; j < numTags && j < availableTags.length; j++) {
      const tag = pick(availableTags);
      if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
      }
    }
    
    // Generate dates across the full year, with more recent dates being more common
    // Use exponential distribution to favor recent dates
    const daysAgo = Math.floor(Math.pow(Math.random(), 0.7) * maxDaysAgo);
    const createdDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    const created_at = createdDate.toISOString();
    
    // Rating from template or random based on sentiment
    const rating = template.rating || (template.sentiment === "positive" ? Math.floor(Math.random() * 2) + 4 : 
                                       template.sentiment === "negative" ? Math.floor(Math.random() * 2) + 1 : 
                                       Math.floor(Math.random() * 2) + 3);
    
    // Verified status - most are verified
    const verified = Math.random() > 0.2 ? 1 : 0;

    statements.push(
      env.DB.prepare(
        "INSERT OR REPLACE INTO raw_feedback (id, source, user_type, user_name, country, product_area, content, rating, category, tags, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        pid,
        source,
        user_type,
        user_name,
        country,
        product_area,
        content,
        rating,
        category,
        JSON.stringify(selectedTags),
        verified,
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
