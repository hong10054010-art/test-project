# 數據庫更新指南

本指南說明如何更新數據庫 schema 並生成新的 seed 數據。

## 方法 1: 使用自動化腳本（推薦）

### 本地開發環境

1. **啟動本地開發服務器**：
```bash
npx wrangler dev
```

2. **在另一個終端運行更新腳本**：
```bash
npm run db:update
```

或者直接運行：
```bash
node scripts/update-database.js
```

### 生產環境

1. **部署 Worker**（如果還沒部署）：
```bash
npm run deploy
```

2. **獲取 Worker URL**：
   - 從 Cloudflare Dashboard 獲取你的 Worker URL
   - 格式類似：`https://your-worker.your-subdomain.workers.dev`

3. **運行更新腳本**：
```bash
node scripts/update-database.js --url https://your-worker.your-subdomain.workers.dev
```

## 方法 2: 使用 Wrangler 命令

### 步驟 1: 運行 Migration API

```bash
# 本地環境
curl -X POST http://localhost:8787/api/migrate

# 生產環境（替換為你的 Worker URL）
curl -X POST https://your-worker.your-subdomain.workers.dev/api/migrate
```

### 步驟 2: 生成 Seed 數據

```bash
# 本地環境
curl -X POST http://localhost:8787/api/seed

# 生產環境（替換為你的 Worker URL）
curl -X POST https://your-worker.your-subdomain.workers.dev/api/seed
```

## 方法 3: 使用 Cloudflare Dashboard

### 步驟 1: 執行 Migration SQL

在 Cloudflare Dashboard 的 D1 數據庫頁面，執行以下 SQL：

```sql
-- 檢查並添加新欄位（如果不存在）
-- 注意：SQLite 不支持 IF NOT EXISTS，所以如果欄位已存在會報錯，這是正常的

ALTER TABLE raw_feedback ADD COLUMN user_name TEXT;
ALTER TABLE raw_feedback ADD COLUMN rating INTEGER;
ALTER TABLE raw_feedback ADD COLUMN category TEXT;
ALTER TABLE raw_feedback ADD COLUMN tags TEXT;
ALTER TABLE raw_feedback ADD COLUMN verified INTEGER DEFAULT 0;
```

### 步驟 2: 調用 Seed API

在 Cloudflare Dashboard 的 Workers 頁面：
1. 找到你的 Worker
2. 進入 "Triggers" 或 "Quick Edit"
3. 使用 "Send test request" 功能發送 POST 請求到 `/api/seed`

## 方法 4: 使用 Wrangler D1 命令

### 步驟 1: 執行 Migration SQL

```bash
# 本地數據庫
wrangler d1 execute feedback-db --local --command="ALTER TABLE raw_feedback ADD COLUMN user_name TEXT;"
wrangler d1 execute feedback-db --local --command="ALTER TABLE raw_feedback ADD COLUMN rating INTEGER;"
wrangler d1 execute feedback-db --local --command="ALTER TABLE raw_feedback ADD COLUMN category TEXT;"
wrangler d1 execute feedback-db --local --command="ALTER TABLE raw_feedback ADD COLUMN tags TEXT;"
wrangler d1 execute feedback-db --local --command="ALTER TABLE raw_feedback ADD COLUMN verified INTEGER DEFAULT 0;"

# 遠程數據庫（生產環境）
wrangler d1 execute feedback-db --remote --command="ALTER TABLE raw_feedback ADD COLUMN user_name TEXT;"
wrangler d1 execute feedback-db --remote --command="ALTER TABLE raw_feedback ADD COLUMN rating INTEGER;"
wrangler d1 execute feedback-db --remote --command="ALTER TABLE raw_feedback ADD COLUMN category TEXT;"
wrangler d1 execute feedback-db --remote --command="ALTER TABLE raw_feedback ADD COLUMN tags TEXT;"
wrangler d1 execute feedback-db --remote --command="ALTER TABLE raw_feedback ADD COLUMN verified INTEGER DEFAULT 0;"
```

### 步驟 2: 調用 Seed API

```bash
# 本地環境
curl -X POST http://localhost:8787/api/seed

# 生產環境
curl -X POST https://your-worker.your-subdomain.workers.dev/api/seed
```

## 驗證更新

更新完成後，可以通過以下方式驗證：

1. **檢查數據庫結構**：
```bash
wrangler d1 execute feedback-db --remote --command="PRAGMA table_info(raw_feedback);"
```

2. **檢查數據數量**：
```bash
wrangler d1 execute feedback-db --remote --command="SELECT COUNT(*) FROM raw_feedback;"
```

3. **檢查新欄位數據**：
```bash
wrangler d1 execute feedback-db --remote --command="SELECT id, user_name, rating, category FROM raw_feedback LIMIT 5;"
```

## 注意事項

- Migration API 會自動檢查欄位是否存在，如果已存在會跳過
- Seed 數據會生成 2000 條反饋記錄
- 如果數據庫中已有數據，新欄位會是 NULL，需要重新生成 seed 數據
- 建議在更新前備份現有數據（如果有的話）

## 故障排除

### 錯誤：Column already exists
這表示欄位已經存在，可以安全忽略。

### 錯誤：Failed to connect
- 確保 Worker 正在運行（本地：`wrangler dev`）
- 檢查 Worker URL 是否正確
- 確認網絡連接正常

### 錯誤：Database locked
- 等待幾秒後重試
- 確保沒有其他進程正在訪問數據庫
