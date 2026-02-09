# 恢復 Product_Manager_Intern_Assignment 專案

## 步驟 1：備份並恢復 Product_Manager_Intern_Assignment

如果您想恢復 Product_Manager_Intern_Assignment 專案到之前的狀態，請在另一個目錄執行：

```bash
# 在桌面或其他位置創建備份目錄
cd ~/Desktop
git clone https://github.com/hong10054010-art/Product_Manager_Intern_Assignment.git Product_Manager_Intern_Assignment-backup
cd Product_Manager_Intern_Assignment-backup

# 查看提交歷史，找到您想要恢復的版本
git log --oneline

# 如果需要恢復到最後一次正確的提交（在您推送錯誤內容之前）
# 假設最後一次正確的提交是 abc1234
git checkout abc1234

# 或者創建一個新分支來保存當前狀態
git checkout -b backup-before-fix
git checkout main
git reset --hard <正確的提交hash>
git push origin main --force
```

## 步驟 2：切換 feedback-insights 到正確的倉庫

在 feedback-insights 目錄中執行：

```bash
cd /Users/hongyiru/Desktop/feedback-insights

# 更新遠端倉庫 URL
git remote set-url origin https://github.com/hong10054010-art/test-project.git

# 確認遠端倉庫已更新
git remote -v
# 應該顯示：
# origin  https://github.com/hong10054010-art/test-project.git (fetch)
# origin  https://github.com/hong10054010-art/test-project.git (push)
```

## 步驟 3：推送到正確的倉庫

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

## 驗證

1. 檢查 Product_Manager_Intern_Assignment 是否已恢復：
   https://github.com/hong10054010-art/Product_Manager_Intern_Assignment

2. 檢查 test-project 是否已更新：
   https://github.com/hong10054010-art/test-project
