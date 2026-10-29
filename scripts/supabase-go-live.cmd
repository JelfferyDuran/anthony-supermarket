@echo off
REM Double-click me. Sets SuperKitchen function secrets + deploys the edge function.
cd /d "%~dp0.."
where bash >nul 2>nul
if errorlevel 1 (
  if exist "C:\Program Files\Git\bin\bash.exe" (
    "C:\Program Files\Git\bin\bash.exe" scripts/supabase-go-live.sh
  ) else (
    echo Git Bash not found. Run scripts/supabase-go-live.sh from Git Bash.
  )
) else (
  bash scripts/supabase-go-live.sh
)
echo.
pause
