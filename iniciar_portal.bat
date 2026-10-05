@echo off
title Portal Fraternal Entrada Universitaria La Paz 2026 - Tinkus Wistus
echo =========================================================================
echo    PORTAL FRATERNAL TINKUS WISTUS - ENTRADA UNIVERSITARIA LA PAZ 2026
echo =========================================================================
echo.
echo Iniciando el portal en su navegador web...
echo.
start "" "%~dp0landing.html"
echo [OK] Pagina principal (Landing Page) abierta directamente desde landing.html.
echo.
echo Si desea ejecutar con servidor web local en http://localhost:8000:
echo Presione cualquier tecla para iniciar el servidor Python...
pause >nul
python "%~dp0iniciar_portal.py"
pause
