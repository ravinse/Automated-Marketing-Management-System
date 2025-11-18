@echo off
REM Automated Marketing Management System - Windows Startup Script
REM This script starts both backend and frontend servers

echo.
echo ======================================================
echo   Starting Automated Marketing Management System
echo ======================================================
echo.

REM Note: Using MongoDB Atlas (cloud database)
echo Database: MongoDB Atlas (Cloud)
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v16+ first.
    pause
    exit /b 1
)

echo [OK] Node.js detected
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [OK] npm detected
npm --version
echo.

REM Install backend dependencies if needed
echo Checking backend dependencies...
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies already installed
)
echo.

REM Install frontend dependencies if needed
echo Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies already installed
)
echo.

REM Check if .env file exists
echo Checking configuration...
if not exist "backend\.env" (
    echo [WARNING] No .env file found in backend directory
    echo Please create backend\.env file with required configuration
    echo See README.md for configuration details
    echo.
) else (
    echo [OK] Configuration file found
)
echo.

REM Start backend server in a new window
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm start"
echo [OK] Backend server starting on http://localhost:5001
timeout /t 3 /nobreak >nul
echo.

REM Start frontend server in a new window
echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
echo [OK] Frontend server starting on http://localhost:5173
echo.

echo ======================================================
echo   All servers started successfully!
echo ======================================================
echo.
echo Application URLs:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5001
echo.
echo Useful Commands:
echo   - Close the server windows to stop the servers
echo   - Check the server windows for logs
echo.
echo Note: Two separate windows have been opened for backend and frontend
echo       Keep those windows open to keep servers running
echo.
pause
