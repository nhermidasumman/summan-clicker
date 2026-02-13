"""Compatibility entrypoint for uvicorn.

Keeps `uvicorn main:app` working while backend code lives in `backend/`.
"""

from backend.app import app

__all__ = ["app"]
