# 恢復 Product_Manager_Intern_Assignment 專案

## 步驟 1：檢查 GitHub 上的提交歷史

如果本地找不到之前的版本，請檢查 GitHub 上的提交歷史：

1. 訪問：https://github.com/hong10054010-art/Product_Manager_Intern_Assignment/commits/main
2. 查看所有提交記錄，找到錯誤推送之前的版本

## 步驟 2：恢復 Product_Manager_Intern_Assignment

### 選項 A：如果 GitHub 上有之前的版本

```bash
# 在桌面或其他位置創建備份目錄
cd ~/Desktop
git clone https://github.com/hong10054010-art/Product_Manager_Intern_Assignment.git Product_Manager_Intern_Assignment-backup
cd Product_Manager_Intern_Assignment-backup

# 查看所有提交（包括遠端的）
git log --oneline --all

# 或者查看 GitHub 上的提交歷史
# 訪問：https://github.com/hong10054010-art/Product_Manager_Intern_Assignment/commits/main
# 找到錯誤推送之前的提交 hash

# 恢復到特定版本（假設正確的提交是 abc1234）
git checkout abc1234
git checkout -b restore-branch
git push origin restore-branch

# 然後在 GitHub 上：
# 1. 創建 Pull Request 將 restore-branch 合併到 main
# 2. 或者直接 force push（謹慎使用）
# git checkout main
# git reset --hard abc1234
# git push origin main --force
```

### 選項 B：如果沒有之前的版本（專案是全新的）

如果 Product_Manager_Intern_Assignment 專案本來就是空的或這是第一次推送，您可以：

1. **保留當前內容**：如果錯誤推送的內容對該專案也有用
2. **清空專案**：如果該專案應該保持空白

```bash
# 選項 B1：清空專案（創建一個空的初始提交）
cd ~/Desktop
git clone https://github.com/hong10054010-art/Product_Manager_Intern_Assignment.git Product_Manager_Intern_Assignment-fix
cd Product_Manager_Intern_Assignment-fix

# 刪除所有檔案（保留 .git）
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

# 創建一個 README
echo "# Product Manager Intern Assignment" > README.md

# 提交並推送
git add .
git commit -m "初始化專案"
git push origin main --force
```

### 選項 C：在 GitHub 上直接操作（推薦）

#### 步驟 1：找到正確的提交版本

1. 訪問：https://github.com/hong10054010-art/Product_Manager_Intern_Assignment
2. 點擊 "Commits" 查看提交歷史
3. 找到錯誤推送之前的提交（應該是最早的提交）
4. 點擊該提交的 hash（例如：`abc1234`）
5. 您現在應該看到該提交的詳細頁面

#### 步驟 2：從該版本創建新分支

在提交頁面上：

1. 點擊右上角的 "Browse files" 按鈕（您已經點擊了）
2. 在檔案瀏覽頁面，點擊左上角的 "Code" 下拉選單
3. 在分支/標籤選擇器中，點擊 "Find or create a branch..."
4. 輸入新分支名稱，例如：`restore-branch`
5. 點擊 "Create branch: restore-branch from this commit"
6. 現在您有了一個從正確版本開始的新分支

#### 步驟 3：將新分支設為 main（恢復專案）

**方法 A：使用 GitHub 網頁界面（最簡單）**

1. 訪問：https://github.com/hong10054010-art/Product_Manager_Intern_Assignment/branches
2. 找到您剛創建的 `restore-branch` 分支
3. 點擊該分支右側的 "..." 選單
4. 選擇 "Change default branch"
5. 將預設分支改為 `restore-branch`
6. 然後可以將 `restore-branch` 重新命名為 `main`（如果需要）

**方法 B：使用 Git 命令（更直接）**

```bash
# 在本地克隆專案
cd ~/Desktop
git clone https://github.com/hong10054010-art/Product_Manager_Intern_Assignment.git Product_Manager_Intern_Assignment-restore
cd Product_Manager_Intern_Assignment-restore

# 切換到 restore-branch 分支（您在 GitHub 上創建的）
git fetch origin
git checkout restore-branch

# 刪除本地的 main 分支（如果存在）
git branch -D main

# 從 restore-branch 創建新的 main 分支
git checkout -b main

# 強制推送到遠端 main（這會覆蓋錯誤的內容）
git push origin main --force
```

#### 步驟 4：驗證恢復結果

1. 訪問：https://github.com/hong10054010-art/Product_Manager_Intern_Assignment
2. 確認 main 分支已經恢復到正確的版本
3. 檔案應該和您選擇的提交版本一致

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
