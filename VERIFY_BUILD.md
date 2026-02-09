# 驗證構建流程

## 確認 Cloudflare Workers 相容性

### 架構確認

✅ **Worker 入口點**：`src/index.js` - 純 JavaScript  
✅ **API Handlers**：`functions/api/*.js` - 純 JavaScript  
✅ **React 前端**：構建時編譯為 JavaScript，內聯到 HTML  
✅ **TypeScript 配置**：已添加 `tsconfig.json` 確保正確編譯  

### 構建流程驗證

執行以下命令驗證構建是否正確：

```bash
# 1. 清理之前的構建
rm -rf dist/ src/html-content.js

# 2. 構建專案
npm run build

# 3. 檢查構建輸出
ls -la dist/
ls -la src/html-content.js

# 4. 驗證 html-content.js 包含內聯的 JavaScript
head -30 src/html-content.js | grep -i script
```

### 預期結果

1. **dist/** 目錄應該包含：
   - `index.html`
   - `assets/*.js` (編譯後的 JavaScript)
   - `assets/*.css` (編譯後的 CSS)

2. **src/html-content.js** 應該：
   - 包含完整的 HTML
   - 所有 `<script>` 標籤的內容已內聯
   - 所有 `<link>` 標籤的 CSS 已內聯
   - 是純 JavaScript 檔案（可以導入到 Worker）

3. **Worker 部署**：
   - `wrangler deploy` 只會上傳 JavaScript 檔案
   - 不會上傳 TypeScript 或 React 源碼
   - 不會上傳 `dist/` 目錄

### 測試部署

```bash
# 構建並部署
npm run deploy

# 或分步驟測試
npm run build
wrangler dev  # 本地測試
wrangler deploy  # 部署到生產環境
```

## 如果構建失敗

### 常見問題

1. **TypeScript 錯誤**：
   ```bash
   # 檢查 TypeScript 配置
   npx tsc --noEmit
   ```

2. **Vite 構建錯誤**：
   ```bash
   # 清理並重新構建
   rm -rf dist/ node_modules/.vite
   npm install
   npm run build
   ```

3. **內聯失敗**：
   - 檢查 `dist/index.html` 是否存在
   - 檢查 `dist/assets/` 目錄是否有檔案
   - 確認 `build-html.js` 能正確讀取檔案

## 確認 Worker 相容性

最終確認 Worker 只使用 JavaScript：

```bash
# 檢查 Worker 入口點
file src/index.js
head -5 src/index.js

# 檢查 API handlers
file functions/api/query.js
head -5 functions/api/query.js

# 檢查內聯的 HTML（應該是 JavaScript 字串）
file src/html-content.js
head -5 src/html-content.js
```

所有檔案都應該是 JavaScript，沒有 TypeScript 或 React 源碼。
