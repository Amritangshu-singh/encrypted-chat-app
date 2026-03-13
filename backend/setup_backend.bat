@echo off
setlocal

echo ==========================================
echo   SecureChat Backend Setup (Windows)
echo ==========================================

:: Check Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do echo Using Python: %%i

:: Create virtual environment
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

:: Activate virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate.bat

:: Install dependencies
echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

:: Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo NOTE: Edit backend\.env to set a secure JWT_SECRET and SECRET_KEY before production use.
)

echo.
echo ==========================================
echo   Backend setup complete!
echo.
echo   To start the backend server:
echo     .venv\Scripts\activate.bat
echo     python app.py
echo.
echo   Server will run at: http://localhost:5000
echo ==========================================
pause
