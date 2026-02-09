#!/bin/bash

echo "=========================================="
echo "構建並同步到 GitHub test-project"
echo "=========================================="
echo ""

# 步驟 1: 清理舊的構建
echo "步驟 1: 清理舊的構建檔案..."
rm -rf dist/
rm -f src/html-content.js
echo "✓ 清理完成"
echo ""

# 步驟 2: 安裝依賴（如果需要）
if [ ! -d "node_modules" ]; then
  echo "步驟 2: 安裝依賴..."
  npm install
  echo "✓ 依賴安裝完成"
  echo ""
else
  echo "步驟 2: 跳過依賴安裝（node_modules 已存在）"
  echo ""
fi

# 步驟 3: 構建 React 應用
echo "步驟 3: 構建 React 應用..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 構建失敗！請檢查錯誤訊息"
  exit 1
fi

echo "✓ 構建完成"
echo ""

# 步驟 4: 驗證構建結果
echo "步驟 4: 驗證構建結果..."
if [ ! -f "src/html-content.js" ]; then
  echo "❌ 錯誤: src/html-content.js 未生成"
  exit 1
fi

if [ ! -d "dist" ]; then
  echo "❌ 錯誤: dist/ 目錄不存在"
  exit 1
fi

echo "✓ 構建檔案驗證通過"
echo ""

# 步驟 5: 檢查 Git 狀態
echo "步驟 5: 檢查 Git 狀態..."
git remote -v
echo ""

# 步驟 6: 添加所有變更
echo "步驟 6: 添加所有變更到 Git..."
git add .
echo "✓ 檔案已添加"
echo ""

# 步驟 7: 提交變更
echo "步驟 7: 提交變更..."
git commit -m "更新：重新設計 Feedback Insights Dashboard

- 使用 React + Vite + Tailwind CSS 重新設計前端
- 完整的多頁面應用（Overview, Keywords, Feedback, AI Insights, Reports, Settings）
- 添加 GitHub 連接功能（連接到 hong10054010-art/test-project）
- 保持 Cloudflare Workers 後端邏輯（D1, R2, Workers AI）
- 改進構建流程：確保 React 應用正確內聯
- 添加 TypeScript 配置
- 所有 UI 使用繁體中文
- 改進 build-html.js 以更好地處理資源內聯"

if [ $? -ne 0 ]; then
  echo "⚠️  警告: 提交可能失敗（沒有變更或已提交）"
fi

echo "✓ 提交完成"
echo ""

# 步驟 8: 推送到 GitHub
echo "步驟 8: 推送到 GitHub..."
git push origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "=========================================="
  echo "✅ 完成！"
  echo "=========================================="
  echo ""
  echo "請訪問以下網址確認："
  echo "https://github.com/hong10054010-art/test-project"
  echo ""
  echo "部署到 Cloudflare："
  echo "  npm run deploy"
  echo ""
else
  echo ""
  echo "❌ 推送失敗！請檢查錯誤訊息"
  exit 1
fi
