"""
Summan Data Clicker - FastAPI Backend
=====================================
A Summan-themed incremental game served via FastAPI.
"""

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="Summan Data Clicker",
    description="An incremental game themed around Summan's digital transformation",
    version="1.0.0",
)

# Mount static files
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")

# Templates
templates = Jinja2Templates(directory=BASE_DIR / "templates")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Serve the main game page."""
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "game": "Summan Data Clicker", "version": "1.0.0"}


@app.get("/api/config")
async def game_config():
    """Return game configuration for the frontend."""
    return {
        "version": "1.0.0",
        "autosave_interval_seconds": 30,
        "tick_rate_ms": 33,  # ~30fps
        "default_language": "es",
        "branding": {
            "primary_green": "#9ac31c",
            "primary_orange": "#f18a00",
            "accent_purple": "#483F91",
            "accent_teal": "#55B8B2",
            "genai_blue": "#517BBD",
            "devops_red": "#E7481D",
        },
    }
