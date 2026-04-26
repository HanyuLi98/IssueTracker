@echo off
echo ========================================
echo   AE Task Manager - First Push
echo ========================================
echo.

git init
git add .
git commit -m "initial supabase version"
git remote remove origin 2>nul
git remote add origin git@github.com:HanyuLi98/IssueTracker.git
git branch -M main
git push -u origin main --force

echo.
echo ========================================
echo   Done! Vercel will auto deploy.
echo   Wait 1 min then refresh your website.
echo ========================================
pause
