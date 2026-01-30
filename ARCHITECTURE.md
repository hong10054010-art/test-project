# Architecture Overview

## Cloudflare Products Used

This prototype uses **5 Cloudflare Developer Platform products** to build a comprehensive feedback aggregation and analysis tool:

### 1. **Cloudflare Workers** (Core Runtime)
**Why:** Workers serves as the backbone of the application, providing serverless execution for all API endpoints and static file serving. It enables:
- **Low latency**: Edge computing brings the application closer to users globally
- **Auto-scaling**: Automatically handles traffic spikes without manual configuration
- **Cost-effective**: Pay-per-use model with generous free tier
- **Unified platform**: All other Cloudflare products integrate seamlessly through Workers bindings

**Usage in this project:**
- Main entry point (`src/index.js`) handles routing for API endpoints and serves the dashboard
- API endpoints in `functions/api/` process requests and interact with other Cloudflare services
- Static HTML content is embedded directly in the Worker for optimal performance

### 2. **Workers AI** (AI Analysis Engine)
**Why:** Workers AI provides on-demand AI inference without managing infrastructure. It's used to:
- **Extract themes** from unstructured feedback text
- **Analyze sentiment** (positive, neutral, negative)
- **Determine urgency** levels (low, medium, high, critical)
- **Assess value** of feedback (low, medium, high)
- **Generate summaries** and extract keywords
- **Provide recommendations** based on aggregated data

**Usage in this project:**
- `functions/api/process.js`: Processes raw feedback using `@cf/meta/llama-3.1-8b-instruct` model to enrich data
- `functions/api/ai-advice.js`: Generates actionable recommendations based on filtered feedback data
- All AI processing happens at the edge, ensuring fast response times

### 3. **D1 Database** (Primary Data Storage)
**Why:** D1 is Cloudflare's serverless SQL database that provides:
- **Structured data storage**: Perfect for storing feedback metadata and AI analysis results
- **SQL interface**: Familiar query language for complex filtering and aggregation
- **Global replication**: Data replicated across Cloudflare's network for low-latency access
- **Zero configuration**: No database servers to manage

**Usage in this project:**
- `raw_feedback` table: Stores original feedback from various sources (support tickets, GitHub, Discord, email, Twitter)
- `enriched_feedback` table: Stores AI-processed insights (themes, sentiment, urgency, value, summaries, keywords)
- `functions/api/query.js`: Performs complex SQL queries with filters for product, platform, country, and time range
- Indexes optimize query performance for dashboard visualizations

### 4. **R2 Storage** (Data Backup & Archive)
**Why:** R2 provides object storage for:
- **Data backup**: Raw feedback is backed up to R2 for disaster recovery
- **Long-term archival**: Store historical feedback data cost-effectively
- **S3-compatible API**: Easy integration with existing tools and workflows
- **No egress fees**: Unlike traditional cloud storage, R2 doesn't charge for data transfer

**Usage in this project:**
- `functions/api/process.js`: After processing feedback with AI, raw data is backed up to R2 bucket
- Ensures data durability and enables future data recovery if needed

### 5. **KV Namespace** (User Preferences Storage)
**Why:** KV is a key-value store ideal for:
- **Fast lookups**: Sub-millisecond read latency for user preferences
- **Simple data model**: Perfect for storing saved filter configurations
- **Global distribution**: Data available at the edge worldwide
- **Cost-effective**: Free tier includes 100,000 reads/day

**Usage in this project:**
- `functions/api/save-view.js`: Stores user-defined filter combinations (product, platform, country, time range) with custom names
- Enables users to save and quickly access frequently used dashboard views
- Lightweight storage for user preferences without database overhead

## Architecture Flow

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Cloudflare Workers                │
│   (Main Entry Point)                 │
│   - Route handling                  │
│   - Static file serving             │
└────────┬────────────────────────────┘
         │
         ├───► API Endpoints
         │
         ├───► /api/query ────────► D1 Database (Read feedback data)
         │
         ├───► /api/process ──────► Workers AI (Analyze feedback)
         │                          │
         │                          ├──► D1 Database (Store enriched data)
         │                          │
         │                          └──► R2 Storage (Backup raw data)
         │
         ├───► /api/ai-advice ────► Workers AI (Generate recommendations)
         │
         └───► /api/save-view ────► KV Namespace (Store user preferences)
```

## Data Flow

1. **Ingestion**: Mock feedback data is generated and stored in D1 `raw_feedback` table
2. **Processing**: Workers AI analyzes raw feedback to extract themes, sentiment, urgency, and value
3. **Enrichment**: Processed insights are stored in D1 `enriched_feedback` table
4. **Backup**: Raw feedback is backed up to R2 for durability
5. **Query**: Dashboard queries D1 with filters to display visualizations
6. **Recommendations**: Workers AI generates actionable insights based on aggregated data
7. **Persistence**: User filter preferences are saved to KV for quick access

## Why This Architecture?

- **Serverless-first**: All services scale automatically without infrastructure management
- **Edge-native**: Data and compute at the edge for global low latency
- **Cost-effective**: Pay only for what you use with generous free tiers
- **Integrated**: All services work together seamlessly through Workers bindings
- **AI-powered**: Workers AI enables intelligent analysis without external AI services
- **Resilient**: Multiple storage layers (D1 + R2) ensure data durability

## Performance Optimizations

- **Indexed queries**: D1 indexes on frequently filtered columns (source, product_area, country, created_at)
- **Embedded HTML**: Static dashboard HTML embedded in Worker for instant delivery
- **Edge caching**: Cloudflare's global network caches responses automatically
- **Batch processing**: Feedback processed in batches for efficient AI inference
