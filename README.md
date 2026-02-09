# Feedback Insights Dashboard

A modern feedback analysis and visualization dashboard built with React, Vite, and Cloudflare Workers. Features AI-powered insights, interactive charts, and comprehensive feedback management.

## Features

- **Modern React UI** - Beautiful, responsive dashboard with Tailwind CSS
- **Multi-source Feedback Collection** - Support tickets, GitHub, Discord, email, Twitter
- **AI-Powered Analysis** - Automatic theme extraction, sentiment analysis, urgency assessment
- **Interactive Visualizations** - Charts and graphs for trends, sentiment, and distribution
- **Advanced Filtering** - Filter by product, platform, country, and time range
- **GitHub Integration** - Connect to GitHub repositories (test-project)
- **Save & Share Views** - Save filtered views and share with team
- **AI Recommendations** - Get actionable insights from your feedback data

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **AI**: Cloudflare Workers AI (Llama 3.1)
- **State**: KV Namespace for saved views

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Cloudflare Resources

Update `wrangler.toml` with your resource IDs:
- D1 Database ID
- R2 Bucket name
- KV Namespace ID

### 3. Initialize Database

```bash
wrangler d1 create feedback-db
wrangler d1 execute feedback-db --remote --file=schema.sql
```

### 4. Development

For frontend development (with hot reload):
```bash
npm run dev:frontend
```

For full-stack development:
```bash
npm run dev
```

### 5. Build and Deploy

**重要**：部署前必須先構建 React 應用！

```bash
# 清理舊的構建（可選）
npm run clean

# 構建 React 應用並內聯到 Worker
npm run build

# 驗證構建結果
grep -i "createRoot" src/html-content.js

# 部署到 Cloudflare
npm run deploy
```

**注意**：如果 Cloudflare 上顯示的是舊的單頁面，請執行：
```bash
rm -rf dist/ src/html-content.js
npm run build
npm run deploy
```

### 6. Seed Data

After deployment, seed the database with mock data:

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/api/seed
curl -X POST https://your-worker.your-subdomain.workers.dev/api/process
```

## Project Structure

```
feedback-insights/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Main app component
│   │   └── components/
│   │       ├── OverviewPage.tsx        # Dashboard overview
│   │       ├── KeywordsPage.tsx        # Keyword analysis
│   │       ├── FeedbackAnalysisPage.tsx # Raw feedback data
│   │       ├── AIInsightsPage.tsx      # AI-generated insights
│   │       ├── ReportsPage.tsx         # Report builder
│   │       ├── SettingsPage.tsx        # Settings & integrations
│   │       └── ui/                     # UI components (shadcn/ui)
│   ├── lib/
│   │   └── api.ts                      # API service layer
│   ├── styles/                         # Global styles
│   ├── main.tsx                        # React entry point
│   ├── index.js                        # Worker entry point
│   └── html-content.js                 # Embedded HTML (auto-generated)
├── functions/
│   └── api/                            # API endpoints
│       ├── query.js                    # Query feedback data
│       ├── seed.js                     # Generate mock data
│       ├── process.js                  # AI processing
│       ├── ai-advice.js                # AI recommendations
│       └── save-view.js                # Save/load views
├── dist/                               # Vite build output
├── index.html                          # HTML template
├── vite.config.ts                      # Vite configuration
├── build-html.js                       # Build script
├── schema.sql                          # Database schema
└── wrangler.toml                       # Cloudflare configuration
```

## API Endpoints

- `GET /api/query` - Query feedback data with filters
- `POST /api/seed` - Generate mock feedback data
- `POST /api/process` - Process feedback with AI analysis
- `POST /api/ai-advice` - Get AI recommendations
- `POST /api/save-view` - Save a filtered view
- `GET /api/save-view` - Get all saved views

## GitHub 倉庫

本專案的程式碼存放在 GitHub 倉庫：
- **倉庫地址**：https://github.com/hong10054010-art/test-project
- **設定頁面**：可以在 Settings → Integrations 中查看 GitHub 倉庫連結

### 同步程式碼到 GitHub

```bash
# 使用自動化腳本
./BUILD_AND_SYNC.sh

# 或手動執行
git add .
git commit -m "更新說明"
git push origin main
```

**重要**：後端和資料庫繼續使用 Cloudflare 服務（D1、R2、Workers AI），不需要同步到 GitHub。

## Development Notes

- The app uses mock data by default, with API calls as fallback
- All static assets are inlined during build for Cloudflare Workers deployment
- The frontend is a SPA (Single Page Application) with client-side routing
- API calls automatically fall back to mock data if the backend is unavailable

## License

MIT
