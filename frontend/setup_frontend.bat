@echo off
setlocal

echo ==========================================
echo   SecureChat Frontend Setup (Windows)
echo ==========================================

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do echo Using Node.js: %%i
for /f "tokens=*" %%i in ('npm --version') do echo Using npm: %%i

:: Install dependencies
echo Installing npm dependencies...
npm install

:: Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
)

echo.
echo ==========================================
echo   Frontend setup complete!
echo.
echo   To start the frontend development server:
echo     npm start
echo.
echo   App will open at: http://localhost:3000
echo ==========================================
pause
