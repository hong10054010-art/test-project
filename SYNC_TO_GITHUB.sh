#!/bin/bash

# 同步到 GitHub test-project 的腳本

echo "=== 檢查 Git 狀態 ==="
git status

echo ""
echo "=== 檢查遠端倉庫 ==="
git remote -v

echo ""
echo "=== 添加所有變更 ==="
git add .

echo ""
echo "=== 提交變更 ==="
git commit -m "更新：重新設計 Feedback Insights Dashboard

- 使用 React + Vite + Tailwind CSS 重新設計前端
- 遷移所有頁面組件（Overview, Keywords, Feedback, AI Insights, Reports, Settings）
- 添加 GitHub 連接功能（連接到 hong10054010-art/test-project）
- 保持 Cloudflare Workers 後端邏輯（D1, R2, Workers AI）
- 添加 TypeScript 配置確保正確編譯
- 更新構建流程：React 構建後內聯到 Worker
- 所有 UI 使用繁體中文"

echo ""
echo "=== 推送到 GitHub ==="
git push origin main

echo ""
echo "=== 完成！ ==="
echo "請訪問：https://github.com/hong10054010-art/test-project"
