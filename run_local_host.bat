@echo off
echo ========================================
echo HakoMonetTheme Local Development Server
echo ========================================
echo.
echo Choose your preferred server:
echo 1. Python (recommended)
echo 2. Node.js
echo 3. Exit
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto python
if "%choice%"=="2" goto nodejs
if "%choice%"=="3" goto exit

echo Invalid choice. Please run again.
pause
exit /b 1

:python
echo Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH.
    echo Please install Python from https://python.org
    echo Or choose Node.js option.
    pause
    goto end
)

echo Starting Python HTTP server on port 8000...
echo Access your files at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000
goto end

:nodejs
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org
    pause
    goto end
)

echo Starting Node.js HTTP server on port 8080...
echo Access your files at: http://localhost:8080
echo Press Ctrl+C to stop the server
echo Note: http-server will be installed automatically if not present
echo.
npx http-server -p 8080 -c-1 --cors
goto end

:exit
echo Exiting...
goto end

:end
echo.
echo Server stopped.
pause