# 修復 Git 遠端倉庫設定

## 問題
程式碼被同步到了錯誤的專案：`Product_Manager_Intern_Assignment`
需要切換到正確的專案：`hong10054010-art/test-project`

## 快速修復步驟

### 步驟 1：更新遠端倉庫 URL

在終端機中執行（在 feedback-insights 目錄）：

```bash
cd /Users/hongyiru/Desktop/feedback-insights

# 更新遠端倉庫 URL 到正確的專案
git remote set-url origin https://github.com/hong10054010-art/test-project.git

# 確認遠端倉庫已更新
git remote -v
# 應該顯示：
# origin  https://github.com/hong10054010-art/test-project.git (fetch)
# origin  https://github.com/hong10054010-art/test-project.git (push)
```

### 步驟 2：提交並推送當前變更

```bash
# 添加所有變更
git add .

# 提交變更
git commit -m "更新：重新設計 Feedback Insights Dashboard，使用 React + Vite + Cloudflare Workers"

# 推送到 test-project（如果是第一次推送）
git push -u origin main

# 如果遠端已有內容，先拉取
git pull origin main --allow-unrelated-histories
# 解決衝突後再推送
git push -u origin main
```

## 恢復 Product_Manager_Intern_Assignment 專案

如果您想恢復 Product_Manager_Intern_Assignment 專案到之前的狀態，請參考 `RESTORE_PRODUCT_MANAGER.md` 檔案。

## 驗證

推送完成後，訪問以下網址確認：
- **test-project**: https://github.com/hong10054010-art/test-project
- **Product_Manager_Intern_Assignment**: https://github.com/hong10054010-art/Product_Manager_Intern_Assignment

## 注意事項

- 更新遠端 URL 後，之後的所有 `git push` 都會推送到 test-project
- Product_Manager_Intern_Assignment 專案的變更不會自動消失，需要手動恢復
- 建議先備份 Product_Manager_Intern_Assignment 專案（參考 RESTORE_PRODUCT_MANAGER.md）
