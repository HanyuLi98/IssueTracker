@echo off
echo ========================================
echo   AE Task Manager - Daily Push
echo ========================================
echo.

git add .
git commit -m "update"
git push

echo.
echo ========================================
echo   Done! Vercel will auto deploy.
echo ========================================
pause
