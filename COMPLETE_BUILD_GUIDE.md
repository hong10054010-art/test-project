# 構建與部署指南

## 問題診斷

如果 Cloudflare 上顯示的是舊的單頁面（有 Chart.js），而不是新的 React 多頁面應用，原因是：

**`src/html-content.js` 還是舊的 HTML，沒有包含新的 React 應用**

## 解決方案：重新構建

### 方法 1：使用自動化腳本（推薦）

```bash
cd /Users/hongyiru/Desktop/feedback-insights
./BUILD_AND_SYNC.sh
```

這個腳本會自動：
1. 清理舊的構建檔案
2. 構建 React 應用
3. 驗證構建結果
4. 提交並推送到 GitHub

### 方法 2：手動執行

```bash
cd /Users/hongyiru/Desktop/feedback-insights

# 步驟 1: 清理舊的構建
rm -rf dist/ src/html-content.js

# 步驟 2: 構建 React 應用
npm run build

# 步驟 3: 驗證構建結果
ls -la dist/
ls -la src/html-content.js

# 檢查 HTML 是否包含 React
grep -i "createRoot\|react" src/html-content.js | head -5

# 步驟 4: 提交並推送
git add .
git commit -m "更新：重新設計 Feedback Insights Dashboard - React + Vite + Cloudflare Workers"
git push origin main
```

## 構建流程說明

### 1. Vite 構建階段

```bash
vite build
```

這會：
- 編譯所有 TypeScript/React 代碼為 JavaScript
- 輸出到 `dist/` 目錄
- 生成 `dist/index.html`（包含對編譯後 JS/CSS 的引用）
- 生成 `dist/assets/*.js`（包含 React 應用代碼）

### 2. HTML 內聯階段

```bash
node build-html.js
```

這會：
- 讀取 `dist/index.html`
- 找到所有 `<script src="...">` 標籤
- 讀取對應的 JS 檔案並內聯到 HTML
- 找到所有 `<link rel="stylesheet">` 標籤
- 讀取對應的 CSS 檔案並內聯到 HTML
- 生成 `src/html-content.js`（包含完整的內聯 HTML）

### 3. Worker 部署階段

```bash
wrangler deploy
```

這會：
- 上傳 `src/index.js`（Worker 入口）
- 上傳 `functions/api/*.js`（API handlers）
- 上傳 `src/html-content.js`（內聯的 HTML）
- **不會**上傳 `dist/` 目錄（因為已經內聯了）

## 驗證構建是否成功

### 檢查 1：dist/ 目錄

```bash
ls -la dist/
# 應該看到：
# - index.html
# - assets/ 目錄（包含 .js 和 .css 檔案）
```

### 檢查 2：src/html-content.js

```bash
# 檢查檔案大小（應該很大，因為包含所有內聯的 JS/CSS）
ls -lh src/html-content.js

# 檢查是否包含 React
grep -i "createRoot" src/html-content.js

# 檢查是否包含 App 組件
grep -i "App\|OverviewPage\|KeywordsPage" src/html-content.js | head -5

# 檢查是否包含 root div
grep -i "id=\"root\"" src/html-content.js
```

### 檢查 3：HTML 結構

```bash
# 查看 HTML 開頭
head -30 src/html-content.js

# 應該看到：
# - <!DOCTYPE html>
# - <div id="root"></div>
# - <script>...</script>（內聯的 React 代碼）
```

## 如果構建後還是舊的 HTML

### 問題：src/html-content.js 還是舊的單頁面

**原因**：`dist/index.html` 不存在或不是新的 React 構建

**解決方案**：

```bash
# 1. 確認 Vite 構建成功
npm run build 2>&1 | tail -20

# 2. 檢查 dist/index.html 是否存在
test -f dist/index.html && echo "存在" || echo "不存在"

# 3. 檢查 dist/index.html 的內容
head -20 dist/index.html

# 應該看到：
# - <div id="root"></div>
# - <script type="module" src="/assets/...js"></script>
```

### 問題：構建失敗

**檢查錯誤**：

```bash
# 檢查 TypeScript 錯誤
npx tsc --noEmit

# 檢查依賴
npm install

# 清理並重新構建
rm -rf dist/ node_modules/.vite
npm run build
```

## 部署後驗證

部署完成後：

1. **訪問 Cloudflare Worker URL**
2. **應該看到**：
   - 左側有側邊欄（Overview, Keywords, Feedback 等）
   - 可以切換不同頁面
   - 完整的 React 應用界面

3. **如果還是單頁面**：
   - 打開瀏覽器開發者工具（F12）
   - 查看 Console 是否有錯誤
   - 查看 Network 標籤，確認資源是否正確載入

## 完整流程總結

```bash
# 1. 清理
rm -rf dist/ src/html-content.js

# 2. 構建
npm run build

# 3. 驗證
grep -i "createRoot" src/html-content.js

# 4. 提交
git add .
git commit -m "更新：重新設計 Feedback Insights Dashboard"
git push origin main

# 5. 部署
npm run deploy
```
