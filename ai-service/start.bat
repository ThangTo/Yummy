@echo off
echo Starting Yummy AI Service...
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found. Please run setup.bat first.
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Start the service
echo Starting FastAPI server on http://0.0.0.0:8000
echo Press Ctrl+C to stop
echo.
uvicorn main:app --reload --host 0.0.0.0 --port 8000

