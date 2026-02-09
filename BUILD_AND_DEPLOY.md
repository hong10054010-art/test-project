# 構建與部署指南

## 問題診斷

如果 Cloudflare 上顯示的是單頁面而不是 React 應用，通常是因為：

1. **沒有執行構建**：React 代碼沒有被編譯
2. **構建失敗**：構建過程中出現錯誤
3. **內聯失敗**：HTML 內容沒有正確內聯 React 應用

## 完整構建流程

### 步驟 1：清理舊的構建

```bash
npm run clean
# 或手動執行
rm -rf dist/ src/html-content.js
```

### 步驟 2：構建 React 應用

```bash
# 構建 React 應用（Vite 會編譯 TypeScript/React 為 JavaScript）
npm run build
```

這個命令會：
1. 執行 `vite build` - 編譯 React/TypeScript 到 `dist/` 目錄
2. 執行 `node build-html.js` - 內聯所有資源到 `src/html-content.js`

### 步驟 3：驗證構建結果

```bash
# 檢查構建輸出
ls -la dist/
ls -la src/html-content.js

# 檢查 HTML 內容是否包含 React
head -50 src/html-content.js | grep -i "react\|root"
```

### 步驟 4：本地測試（可選）

```bash
# 使用 Wrangler 本地測試
wrangler dev
```

### 步驟 5：部署到 Cloudflare

```bash
npm run deploy
# 或
npm run build
wrangler deploy
```

## 構建輸出說明

### dist/ 目錄（Vite 構建輸出）
- `index.html` - 包含對編譯後 JS/CSS 的引用
- `assets/*.js` - 編譯後的 JavaScript（包含 React 應用）
- `assets/*.css` - 編譯後的 CSS

### src/html-content.js（最終輸出）
- 包含完整的 HTML
- 所有 JS 和 CSS 都已內聯
- Worker 直接提供這個檔案

## 常見問題

### 問題 1：構建後還是舊的 HTML

**解決方案**：
```bash
# 確保清理舊檔案
rm -rf dist/ src/html-content.js

# 重新構建
npm run build

# 檢查生成的檔案
cat src/html-content.js | head -100
```

### 問題 2：React 應用沒有載入

**檢查**：
1. 確認 `dist/index.html` 包含 `<div id="root"></div>`
2. 確認 `dist/assets/` 目錄有 JavaScript 檔案
3. 確認 `src/html-content.js` 包含內聯的 JavaScript

### 問題 3：構建錯誤

```bash
# 檢查 TypeScript 錯誤
npx tsc --noEmit

# 檢查依賴
npm install

# 清理並重新構建
npm run clean
npm run build
```

## 驗證清單

構建完成後，確認：

- [ ] `dist/index.html` 存在
- [ ] `dist/assets/*.js` 檔案存在
- [ ] `src/html-content.js` 已生成
- [ ] `src/html-content.js` 包含 `<div id="root"></div>`
- [ ] `src/html-content.js` 包含內聯的 JavaScript 代碼
- [ ] 本地測試 `wrangler dev` 可以正常顯示 React 應用

## 部署後驗證

部署完成後：
1. 訪問您的 Cloudflare Worker URL
2. 應該看到完整的 React 應用（有側邊欄、多個頁面等）
3. 如果還是單頁面，檢查瀏覽器控制台的錯誤訊息
