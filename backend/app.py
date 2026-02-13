"""Application factory and FastAPI app instance."""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .config import APP_DESCRIPTION, APP_TITLE, APP_VERSION, STATIC_DIR
from .routes import router

app = FastAPI(title=APP_TITLE, description=APP_DESCRIPTION, version=APP_VERSION)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.include_router(router)
