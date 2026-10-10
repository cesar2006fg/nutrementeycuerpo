@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Subiendo los cambios de Nutre Mente ^& Cuerpo a GitHub...
echo.
git add -A
git commit -m "Actualizacion del sitio"
git push
echo.
if errorlevel 1 (echo Algo salio mal. Copia el mensaje de arriba y mandaselo a Claude.) else (echo Listo. En 1 o 2 minutos se actualiza https://nutrementeycuerpo.github.io/)
echo.
pause
