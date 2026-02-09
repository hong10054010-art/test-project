# 同步到 GitHub test-project 的指令

## 快速執行

在終端機中執行以下命令：

```bash
cd /Users/hongyiru/Desktop/feedback-insights

# 方法 1：使用腳本（推薦）
./SYNC_TO_GITHUB.sh

# 方法 2：手動執行
git add .
git commit -m "更新：重新設計 Feedback Insights Dashboard

- 使用 React + Vite + Tailwind CSS 重新設計前端
- 遷移所有頁面組件（Overview, Keywords, Feedback, AI Insights, Reports, Settings）
- 添加 GitHub 連接功能（連接到 hong10054010-art/test-project）
- 保持 Cloudflare Workers 後端邏輯（D1, R2, Workers AI）
- 添加 TypeScript 配置確保正確編譯
- 更新構建流程：React 構建後內聯到 Worker
- 所有 UI 使用繁體中文"

git push origin main
```

## 當前變更摘要

根據 `git status`，以下檔案將被提交：

### 修改的檔案
- `.gitignore` - 更新忽略規則
- `RESTORE_PRODUCT_MANAGER.md` - 更新恢復指南

### 刪除的檔案
- `DEPLOYMENT.md`
- `FIX_GIT_REMOTE.md`
- `GIT_SETUP.md`

### 新增的檔案
- `VERIFY_BUILD.md` - 構建驗證指南
- `tsconfig.json` - TypeScript 配置
- `tsconfig.node.json` - Node.js TypeScript 配置
- `SYNC_TO_GITHUB.sh` - 同步腳本
- `SYNC_INSTRUCTIONS.md` - 本檔案

### 未追蹤的 React 檔案
- `src/app/` - 所有 React 組件
- `src/lib/` - API 服務層
- `src/main.tsx` - React 入口點
- `src/styles/` - 樣式檔案
- `index.html` - HTML 模板
- `vite.config.ts` - Vite 配置
- `postcss.config.mjs` - PostCSS 配置

## 驗證推送

推送完成後，訪問以下網址確認：
https://github.com/hong10054010-art/test-project

## 如果遇到問題

### 問題 1：權限錯誤
```bash
# 檢查 .git/index.lock 是否存在
ls -la .git/index.lock

# 如果存在，刪除它
rm .git/index.lock

# 然後重試
git add .
```

### 問題 2：認證問題
```bash
# 如果提示需要認證，使用 GitHub CLI 或設置 SSH
# 或使用 Personal Access Token
git remote set-url origin https://<token>@github.com/hong10054010-art/test-project.git
```

### 問題 3：遠端已有變更
```bash
# 先拉取遠端變更
git pull origin main --rebase

# 解決衝突後再推送
git push origin main
```
