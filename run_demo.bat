@echo off
TITLE RazorShield AI - Dual-Tier Autonomous Risk & Syndicate Defense
COLOR 0B

echo ===============================================================================
echo            RAZORSHIELD AI // RAZORPAY BUILDATHON TRACK 02
echo        Dual-Tier Real-Time Risk Gating and Syndicate Defense Platform
echo ===============================================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting RazorShield AI Backend Server on Port 8000...
start "RazorShield Backend Server (:8000)" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\python.exe run_server.py"

echo [2/2] Starting RazorShield AI Frontend Dashboard on Port 5173...
start "RazorShield Frontend Dashboard (:5173)" cmd /k "cd /d "%~dp0frontend" && cmd.exe /c npm run dev"

echo.
echo ===============================================================================
echo  Dashboard launched!
echo  Open your browser at: http://localhost:5173
echo  Backend API Docs at:  http://localhost:8000/docs
echo ===============================================================================
echo.
timeout /t 3 >nul
start http://localhost:5173
