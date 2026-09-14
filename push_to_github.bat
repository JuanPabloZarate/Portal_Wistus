@echo off
chcp 65001 >nul
echo =========================================================
echo   ?? Subir Portal Fraternal Tinkus Wistus a GitHub
echo   Repositorio: https://github.com/JuanPabloZarate/Portal_Wistus
echo =========================================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0push_to_github.ps1"
pause
