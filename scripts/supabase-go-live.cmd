@echo off
REM Double-click me. Sets SuperKitchen function secrets + deploys the edge function.
REM IMPORTANT: uses Git Bash explicitly. PowerShell's "bash" resolves to WSL, which has no Node.
setlocal
cd /d "%~dp0.."

set "GITBASH=C:\Program Files\Git\bin\bash.exe"
if not exist "%GITBASH%" set "GITBASH=C:\Program Files (x86)\Git\bin\bash.exe"
if not exist "%GITBASH%" (
  echo.
  echo   Git Bash not found at "%GITBASH%".
  echo   Install Git for Windows, or run scripts/supabase-go-live.sh from Git Bash.
  echo.
  pause
  exit /b 1
)

REM forward-slash path so Git Bash can resolve it
set "S=%~dp0"
set "S=%S:\=/%"

"%GITBASH%" -c "bash '%S%supabase-go-live.sh'"
set "RC=%ERRORLEVEL%"
echo.
if "%RC%"=="0" (echo   Finished.) else (echo   Exited with code %RC%.)
pause
