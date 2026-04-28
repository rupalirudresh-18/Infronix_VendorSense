@echo off
echo Starting VendorSense...
echo.
echo [1/2] Starting Backend (FastAPI on port 8000)...
cd backend
python -m venv venv 2>nul
call venv\Scripts\activate
pip install -r requirements.txt -q
start cmd /k "call venv\Scripts\activate && uvicorn main:app --reload --port 8000"
cd ..
echo.
echo [2/2] Starting Frontend (Next.js on port 3000)...
cd frontend
call npm install
start cmd /k "npm run dev"
cd ..
echo.
echo VendorSense is starting!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
pause
