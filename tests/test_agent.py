import os

from fastapi.testclient import TestClient

os.environ.pop("GEMINI_API_KEY", None)  # tests must not call the real Gemini API

from backend.agent import KNOWLEDGE, WASTE_TYPES, classify, lookup  # noqa: E402
from backend.main import app  # noqa: E402

client = TestClient(app)


def test_knowledge_base_entries_are_valid():
    ids = set()
    for entry in KNOWLEDGE:
        assert entry["id"] not in ids
        ids.add(entry["id"])
        assert entry["waste_type"] in WASTE_TYPES
        assert entry["keywords"]
        for key in ("category", "action", "reuse_idea", "eco_tip", "explanation"):
            assert entry[key].strip()


def test_example_from_brief_used_plastic_bottle():
    result = classify("Used plastic bottle")
    assert result["found"] is True
    assert result["category"] == "Plastic Waste"
    assert result["waste_type"] == "recyclable"
    assert result["recyclable"] is True
    assert "rinse" in result["action"].lower()
    assert result["source"] == "knowledge_base"


def test_greasy_pizza_box_is_not_recyclable():
    result = classify("greasy pizza box")
    assert result["waste_type"] == "general"
    assert result["recyclable"] is False


def test_hazardous_items():
    for item in ("old battery", "expired medicine", "CFL bulb"):
        assert classify(item)["waste_type"] == "hazardous", item


def test_food_is_biodegradable():
    assert classify("banana peel")["waste_type"] == "biodegradable"


def test_typo_still_matches():
    entry, confidence = lookup("plastc bottle")
    assert entry is not None and entry["id"] == "plastic_bottle"
    assert confidence < 1.0


def test_short_keywords_need_whole_words():
    # "tv" must not match inside another word
    entry, _ = lookup("native mango")
    assert entry is None


def test_unknown_item_without_ai_gives_helpful_message():
    result = classify("quantum flux capacitor")
    assert result["found"] is False
    assert "not sure" in result["message"].lower()


def test_api_health_and_classify():
    assert client.get("/api/health").json()["status"] == "ok"
    response = client.post("/api/classify", json={"item": "glass bottle"})
    assert response.status_code == 200
    assert response.json()["waste_type"] == "recyclable"


def test_api_rejects_empty_input():
    assert client.post("/api/classify", json={"item": ""}).status_code == 422


def test_frontend_is_served():
    response = client.get("/")
    assert response.status_code == 200
    assert "EcoSort AI" in response.text
