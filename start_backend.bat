@echo off
title HealthGuard AI - Backend
cd /d "%~dp0backend"

if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found at backend\venv!
    pause
    exit /b 1
)

echo Starting HealthGuard AI Backend on http://127.0.0.1:8000 ...
call "venv\Scripts\python.exe" run.py
pause
