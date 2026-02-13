@echo off
echo Starting Summan Clicker Game Server...
echo.
echo The game will be available at:
echo - Local:   http://localhost:8000
echo - Network: http://<your-local-ip>:8000
echo.
echo Press Ctrl+C to stop the server.
echo.
uvicorn main:app --host 0.0.0.0 --port 8000
pause
