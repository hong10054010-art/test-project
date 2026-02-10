#!/bin/bash

# 推送到 Feedback_Dashboard 倉庫的腳本
# 使用方法：在終端執行 ./PUSH_TO_DASHBOARD.sh

echo "=== 推送到 Feedback_Dashboard 倉庫 ==="
echo ""

# 添加臨時 remote
echo "添加 remote..."
git remote add dashboard https://github.com/YI-RU-HONG/Feedback_Dashboard.git

# 推送到新倉庫
echo "推送到 Feedback_Dashboard..."
git push dashboard main

# 清理臨時 remote
echo "清理臨時 remote..."
git remote remove dashboard

echo ""
echo "=== 完成 ==="
