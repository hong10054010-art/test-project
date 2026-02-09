# Cloudflare 部署錯誤修復指南

## 問題

部署時出現錯誤：`Could not resolve "./html-content.js"`

這是因為 `src/html-content.js` 檔案不存在。這個檔案需要在部署前生成。

## 解決方案

### 方法 1：本地構建後提交（推薦）

```bash
# 1. 構建 React 應用
npm run build

# 2. 驗證 html-content.js 已生成
ls -la src/html-content.js

# 3. 提交到 Git（現在 html-content.js 不再被 .gitignore 忽略）
git add src/html-content.js
git commit -m "添加構建產物 html-content.js"
git push origin main

# 4. 部署到 Cloudflare
npm run deploy
```

### 方法 2：使用 npm run deploy（自動構建）

`package.json` 中的 `deploy` 腳本已經包含構建步驟：

```bash
npm run deploy
```

這會自動執行：
1. `npm run build`（構建 React 並生成 html-content.js）
2. `wrangler deploy`（部署到 Cloudflare）

### 方法 3：使用 BUILD_AND_SYNC.sh

```bash
./BUILD_AND_SYNC.sh
```

這個腳本會：
1. 清理舊的構建
2. 構建 React 應用
3. 驗證構建結果
4. 提交並推送到 GitHub

## 重要說明

- `src/html-content.js` 現在會被提交到 Git（已從 .gitignore 移除）
- 每次修改 React 代碼後，需要重新執行 `npm run build` 來更新 `html-content.js`
- 部署前務必確保 `src/html-content.js` 存在且是最新的

## 驗證構建

```bash
# 檢查檔案是否存在
ls -la src/html-content.js

# 檢查是否包含 React 代碼
grep -i "createRoot" src/html-content.js
```
