"""FastAPI backend for EcoSort AI.

Run from the project root:
    uvicorn backend.main:app --reload
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

try:  # optional: read GEMINI_API_KEY from a local .env file
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:  # pragma: no cover
    pass

from .agent import KNOWLEDGE, classify

app = FastAPI(title="EcoSort AI", description="Smart Waste Sorting for a Cleaner Future")

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"


class ItemRequest(BaseModel):
    item: str = Field(min_length=2, max_length=100, description="Name or short description of a waste item")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "knowledge_base_items": len(KNOWLEDGE)}


@app.post("/api/classify")
def classify_item(request: ItemRequest) -> dict:
    return classify(request.item)


# Serve the web page (must be added after the API routes).
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
