"""FastAPI routes for Summan Data Clicker."""

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from .config import APP_VERSION, TEMPLATES_DIR

templates = Jinja2Templates(directory=TEMPLATES_DIR)
router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Serve the main game page."""
    return templates.TemplateResponse("index.html", {"request": request})


@router.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "game": "Summan Data Clicker", "version": APP_VERSION}


@router.get("/api/config")
async def game_config():
    """Return game configuration for the frontend."""
    return {
        "version": APP_VERSION,
        "autosave_interval_seconds": 30,
        "tick_rate_ms": 33,
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
