# RazorShield AI - PowerShell Launcher
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "           RAZORSHIELD AI // RAZORPAY BUILDATHON TRACK 02" -ForegroundColor Green
Write-Host "       Dual-Tier Real-Time Risk Gating and Syndicate Defense Platform" -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting Backend Server (:8000)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\backend'; .venv\Scripts\python.exe run_server.py"

Write-Host "[2/2] Starting Frontend UI (:5173)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\frontend'; cmd.exe /c npm run dev"

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host " RazorShield AI Dashboard is running at http://localhost:5173" -ForegroundColor Green
Write-Host " Backend API Docs available at http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Green
