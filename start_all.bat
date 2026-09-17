@echo off
title HealthGuard AI - All Services
setlocal

echo ========================================================
echo               HealthGuard AI Launcher
echo ========================================================
echo.
echo Starting both Backend (FastAPI) and Frontend (Vite)...
echo.

:: Launch Backend in its own window
echo [1/2] Starting Backend Server...
start "HealthGuard AI - Backend" cmd /c "%~dp0start_backend.bat"

:: Brief delay to allow backend to initialize
ping 127.0.0.1 -n 3 >nul

:: Launch Frontend in its own window
echo [2/2] Starting Frontend App...
start "HealthGuard AI - Frontend" cmd /c "%~dp0start_frontend.bat"

echo.
echo ========================================================
echo Both services are running in their own windows!
echo.
echo - Frontend UI:   http://localhost:5173
echo - Backend API:   http://127.0.0.1:8000
echo - Swagger Docs:  http://127.0.0.1:8000/docs
echo ========================================================
echo.
echo Opening browser in 3 seconds...
ping 127.0.0.1 -n 4 >nul
start http://localhost:5173

echo.
echo You can close this window now.
echo To stop the servers, simply close the respective Backend/Frontend windows.
echo.
pause
