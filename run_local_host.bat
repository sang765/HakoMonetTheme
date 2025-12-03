@echo off
setlocal enabledelayedexpansion
title HakoMonetTheme Development Server

:menu
echo.
echo ========================================
echo   HakoMonetTheme Local Development Server
echo ========================================
echo.
echo Choose your preferred server:
echo [1] Python HTTP Server (Port 8080)
echo [2] Node.js HTTP Server (Port 8080)
echo [3] Check Server Status
echo [4] Kill Running Servers
echo [5] Exit
echo.
echo Note: For Github Codespaces, use the userscript menu (^🔧 Cấu hình Server URL^)
echo to configure the forwarded URL after starting the server.
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto python
if "%choice%"=="2" goto nodejs
if "%choice%"=="3" goto check_status
if "%choice%"=="4" goto kill_servers
if "%choice%"=="5" goto exit

echo [ERROR] Invalid choice. Please run again.
pause
goto menu

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
goto menu

:kill_servers
echo.
echo [INFO] Killing running servers...
echo.
netstat -ano | findstr ":8080" >nul 2>&1
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
goto menu

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
echo [STARTING] Python HTTP server on port 8080...
echo [ACCESS] http://localhost:8080
echo [NOTE] Wanna install userscript? Click this link for install: http://localhost:8080/HakoMonetTheme.user.js
echo [STOP] Press Ctrl+C to stop the server
echo.
python -m http.server 8080
echo.
echo [STOPPED] Python server stopped
goto menu

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
echo [NOTE] Wanna install userscript? Click this link for install: http://localhost:8080/HakoMonetTheme.user.js
echo [STOP] Press Ctrl+C to stop the server
echo [NOTE] http-server will be installed automatically if not present
echo.
npx http-server -p 8080 -c-1 --cors
echo.
echo [STOPPED] Node.js HTTP server stopped
goto menu

:exit
echo.
echo [INFO] Exiting HakoMonetTheme Development Server
echo [BYE] Goodbye!
goto end

:end