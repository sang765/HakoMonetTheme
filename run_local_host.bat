@echo off
setlocal enabledelayedexpansion
title HakoMonetTheme Development Server

echo.
echo ========================================
echo   HakoMonetTheme Local Development Server
echo ========================================
echo.
echo Choose your preferred server:
echo [1] Python HTTP Server (Port 8000)
echo [2] Node.js HTTP Server (Port 8080)
echo [3] Node.js Auto-Reload Server (Port 8080)
echo [4] Check Server Status
echo [5] Kill Running Servers
echo [6] Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto python
if "%choice%"=="2" goto nodejs
if "%choice%"=="3" goto nodejs_autoreload
if "%choice%"=="4" goto check_status
if "%choice%"=="5" goto kill_servers
if "%choice%"=="6" goto exit

echo [ERROR] Invalid choice. Please run again.
pause
goto start

:check_status
echo.
echo [INFO] Checking server status...
echo.
netstat -ano | findstr ":8000" >nul 2>&1
if %errorlevel%==0 (
    echo [ACTIVE] Python server on port 8000
) else (
    echo [INACTIVE] Python server on port 8000
)

netstat -ano | findstr ":8080" >nul 2>&1
if %errorlevel%==0 (
    echo [ACTIVE] Node.js server on port 8080
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
        echo [PID] Process ID: %%a
    )
) else (
    echo [INACTIVE] Node.js server on port 8080
)
echo.
pause
goto start

:kill_servers
echo.
echo [INFO] Killing running servers...
echo.
netstat -ano | findstr ":8000" >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do (
        taskkill /PID %%a /F >nul 2>&1
        echo [KILLED] Python server (PID: %%a)
    )
) else (
    echo [INFO] No Python server running on port 8000
)

netstat -ano | findstr ":8080" >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
        taskkill /PID %%a /F >nul 2>&1
        echo [KILLED] Node.js server (PID: %%a)
    )
) else (
    echo [INFO] No Node.js server running on port 8080
)
echo.
pause
goto start

:python
echo.
echo [INFO] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo [HELP] Please install Python from https://python.org
    echo [HELP] Or choose a Node.js option.
    echo.
    pause
    goto start
)

echo [SUCCESS] Python found
echo [STARTING] Python HTTP server on port 8000...
echo [ACCESS] http://localhost:8000
echo [STOP] Press Ctrl+C to stop the server
echo.
python -m http.server 8000
echo.
echo [STOPPED] Python server stopped
goto start

:nodejs
echo.
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo [HELP] Please install Node.js from https://nodejs.org
    echo.
    pause
    goto start
)

echo [SUCCESS] Node.js found
echo [STARTING] Node.js HTTP server on port 8080...
echo [ACCESS] http://localhost:8080
echo [STOP] Press Ctrl+C to stop the server
echo [NOTE] http-server will be installed automatically if not present
echo.
npx http-server -p 8080 -c-1 --cors
echo.
echo [STOPPED] Node.js HTTP server stopped
goto start

:nodejs_autoreload
echo.
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo [HELP] Please install Node.js from https://nodejs.org
    echo.
    pause
    goto start
)

echo [SUCCESS] Node.js found
echo [INFO] Installing/updating dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    echo.
    pause
    goto start
)

echo [STARTING] Node.js Auto-Reload server on port 8080...
echo [ACCESS] http://localhost:8080
echo [FEATURE] Auto-reload enabled - Save files in VSCode to refresh browser
echo [STOP] Press Ctrl+C to stop the server
echo.
node server.js
echo.
echo [STOPPED] Auto-Reload server stopped
goto start

:exit
echo.
echo [INFO] Exiting HakoMonetTheme Development Server
echo [BYE] Goodbye!
goto end

:start
goto :eof

:end