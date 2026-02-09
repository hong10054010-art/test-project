# Cloudflare 部署步驟

## 已完成的修復

✅ `src/html-content.js` 已生成（917KB）
✅ 已提交到 GitHub
✅ `wrangler.toml` 已修正

## 部署步驟

### 方法 1：使用 npm run deploy（推薦）

```bash
cd /Users/hongyiru/Desktop/feedback-insights

# 這會自動執行構建和部署
npm run deploy
```

這個命令會：
1. 執行 `npm run build`（構建 React 並生成 html-content.js）
2. 執行 `wrangler deploy`（部署到 Cloudflare）

### 方法 2：手動部署

```bash
cd /Users/hongyiru/Desktop/feedback-insights

# 1. 確保 html-content.js 存在
ls -la src/html-content.js

# 2. 如果不存在，先構建
npm run build

# 3. 部署
wrangler deploy
```

## 驗證部署

部署成功後，訪問您的 Cloudflare Workers URL，應該看到：
- React 多頁面應用（不是舊的單頁面）
- 側邊欄導航
- 多個頁面（Overview, Keywords, Feedback Analysis, AI Insights, Reports, Settings）

## 如果還有錯誤

請提供具體的錯誤訊息，可能的原因：
1. **構建檔案過大**：html-content.js 約 917KB，應該在 Cloudflare Workers 限制內
2. **導入路徑問題**：確認 `src/index.js` 中的 `import { indexHTML } from './html-content.js';` 路徑正確
3. **部署時檔案未上傳**：確認 `wrangler deploy` 成功上傳了所有檔案

## 檢查檔案

```bash
# 確認 html-content.js 存在且包含 React 代碼
grep -i "createRoot" src/html-content.js | head -1

# 確認檔案大小
ls -lh src/html-content.js
```
