# Git 設定與 GitHub 同步指南

本專案的程式碼需要同步到 GitHub 倉庫：`hong10054010-art/test-project`

## 初始設定

### 1. 檢查 Git 狀態

```bash
# 檢查是否已經初始化 Git
git status
```

### 2. 如果尚未初始化，執行以下命令

```bash
# 初始化 Git 倉庫
git init

# 添加遠端倉庫
git remote add origin https://github.com/hong10054010-art/test-project.git

# 或者如果已經有遠端倉庫，更新 URL
git remote set-url origin https://github.com/hong10054010-art/test-project.git
```

### 3. 檢查遠端倉庫設定

```bash
git remote -v
```

應該顯示：
```
origin  https://github.com/hong10054010-art/test-project.git (fetch)
origin  https://github.com/hong10054010-art/test-project.git (push)
```

## 提交與推送程式碼

### 1. 添加所有檔案

```bash
# 查看將要提交的檔案
git status

# 添加所有檔案（.gitignore 會自動排除不需要的檔案）
git add .
```

### 2. 提交變更

```bash
git commit -m "更新：重新設計 Feedback Insights Dashboard，使用 React + Vite + Cloudflare Workers"
```

### 3. 推送到 GitHub

```bash
# 如果是第一次推送
git push -u origin main

# 或者如果分支名稱是 master
git push -u origin master

# 之後的推送
git push
```

## 重要注意事項

### 不會被提交的檔案（已在 .gitignore 中）

- `node_modules/` - 依賴套件
- `dist/` - 建置輸出
- `src/html-content.js` - 自動生成的檔案
- `.wrangler/` - Cloudflare Workers 本地開發檔案
- `.env` - 環境變數
- `*.docx`, `*.pdf` - 文件檔案

### 需要提交的重要檔案

- 所有原始碼檔案（`src/`, `functions/`）
- 設定檔案（`package.json`, `vite.config.ts`, `wrangler.toml`）
- 資料庫 schema（`schema.sql`）
- 建置腳本（`build-html.js`）
- 文件（`README.md`, `ARCHITECTURE.md` 等）

## 後端與資料庫

**重要**：本專案的後端和資料庫繼續使用 Cloudflare 服務：

- **資料庫**：Cloudflare D1（SQLite）
- **儲存**：Cloudflare R2
- **AI**：Cloudflare Workers AI
- **部署**：Cloudflare Workers

這些服務的設定在 `wrangler.toml` 中，不需要提交敏感資訊（如 API tokens）到 GitHub。

## 定期同步

建議每次完成重要功能後就推送到 GitHub：

```bash
git add .
git commit -m "功能描述"
git push
```

## 疑難排解

### 如果推送被拒絕

```bash
# 先拉取遠端的變更
git pull origin main --rebase

# 解決衝突後再推送
git push
```

### 如果遠端倉庫已有內容

```bash
# 先拉取遠端內容
git pull origin main --allow-unrelated-histories

# 解決衝突後提交
git add .
git commit -m "合併遠端變更"
git push
```
