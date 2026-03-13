@echo off
setlocal

set SCRIPT_DIR=%~dp0

echo ==========================================
echo   SecureChat - Start Application
echo ==========================================

:: Check if backend is set up
if not exist "%SCRIPT_DIR%backend\.venv" (
    echo Backend not set up yet. Running setup...
    cd /d "%SCRIPT_DIR%backend"
    call setup_backend.bat
)

:: Check if frontend is set up
if not exist "%SCRIPT_DIR%frontend\node_modules" (
    echo Frontend not set up yet. Running setup...
    cd /d "%SCRIPT_DIR%frontend"
    call setup_frontend.bat
)

echo.
echo Starting backend in a new window...
start "SecureChat Backend" cmd /k "cd /d %SCRIPT_DIR%backend && .venv\Scripts\activate.bat && python app.py"

echo Starting frontend in a new window...
start "SecureChat Frontend" cmd /k "cd /d %SCRIPT_DIR%frontend && npm start"

echo.
echo ==========================================
echo   Both services are starting!
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
echo   Open http://localhost:3000 in your browser.
echo   Close the terminal windows to stop services.
echo ==========================================
pause
