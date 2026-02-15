"""
Backend configuration for Summan Data Clicker.
"""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
TEMPLATES_DIR = FRONTEND_DIR / "templates"
STATIC_DIR = FRONTEND_DIR / "static"

APP_VERSION = "0.2.4"
APP_TITLE = "Summan Data Clicker"
APP_DESCRIPTION = "An incremental game themed around Summan's digital transformation"
