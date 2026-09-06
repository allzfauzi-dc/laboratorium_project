@echo off
title SIMRS Laboratorium RSUD Lubuk Sikaping
color 0A
echo ====================================================================
echo  MEMULAI SISTEM INFORMASI LABORATORIUM RUMAH SAKIT (SIMRS-LAB)
echo  RSUD Lubuk Sikaping - Instalasi Laboratorium Patologi Klinik
echo ====================================================================
echo.

echo [1/2] Menjalankan Server Backend API (Port 5000)...
start "Backend API LIS (Port 5000)" cmd /k "cd /d D:\laboratorium\backend && npm start"

timeout /t 3 >nul

echo [2/2] Menjalankan Frontend Web Vue 3 (Port 5173)...
start "Frontend UI LIS (Port 5173)" cmd /k "cd /d D:\laboratorium\frontend && npm run dev"

echo.
echo ====================================================================
echo  Aplikasi berhasil diluncurkan!
echo  - Frontend Web UI : http://localhost:5173
echo  - Backend API     : http://localhost:5000
echo  - Healthcheck API : http://localhost:5000/api/health
echo ====================================================================
pause
