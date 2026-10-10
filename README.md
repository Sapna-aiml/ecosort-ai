# EcoSort AI

**Smart Waste Sorting for a Cleaner Future**

EcoSort AI is a simple AI agent that helps people decide how to dispose of everyday waste. Type an item such as "used plastic bottle" and the agent returns its category, waste type (recyclable, biodegradable, hazardous or general), a disposal method, a reuse idea, an eco tip and a short explanation.

This is a student prototype built for an IBM SkillsBuild project. Waste rules differ by city, so the app always reminds users to follow local guidelines. SDG alignment (SDG 12, SDG 11 and, as support, SDG 13) is the author's own and is not an official endorsement by the UN or IBM.

## How the agent works

```
User input -> Analyze -> Classify -> Decide -> Recommend -> Result card
```

1. **Analyze:** the text is cleaned and looked up in the JSON knowledge base (`backend/data/waste_knowledge.json`). Small spelling mistakes are handled.
2. **Classify:** if the item is not in the knowledge base, the agent asks the Gemini API (only if `GEMINI_API_KEY` is set). The answer is validated before it is used.
3. **Decide:** safety rules apply. For example, an item containing words like "battery" or "syringe" is always marked hazardous, even if the AI said otherwise.
4. **Recommend:** the final answer includes the disposal method, reuse idea, eco tip and a plain explanation. The page also shows the agent's steps under "How the AI agent decided".

## Features

- Free-text item input with example buttons
- Category, waste type and recyclable yes/no
- Disposal recommendation, reuse or recycling idea and eco tip
- Plain-language explanation and a visible decision trace
- Knowledge base of common items, with Gemini for unfamiliar ones
- Bar chart of the waste types checked in the session (plain JavaScript)

## Project structure

```
ecosort-ai/
  backend/
    main.py                  FastAPI app (API + serves the web page)
    agent.py                 The agent: lookup, Gemini call, decision rules
    data/waste_knowledge.json  Waste knowledge base
  frontend/
    index.html, style.css, app.js
  tests/test_agent.py
  requirements.txt
  .env.example
```

## Run it on your computer

You need Python 3.10 or newer.

```bash
# 1. (optional but recommended) create a virtual environment
python -m venv .venv
# Windows:  .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

# 2. install packages
pip install -r requirements.txt

# 3. start the app
uvicorn backend.main:app --reload
```

Open <http://127.0.0.1:8000> in your browser.

The app works without any key for the items in the knowledge base. To let Gemini handle other items:

1. Get a free key from Google AI Studio: <https://aistudio.google.com/apikey>
2. Copy `.env.example` to `.env` and paste your key as `GEMINI_API_KEY=...`
3. Restart the server.

Never upload your `.env` file to GitHub (it is already in `.gitignore`).

If you see a model-name error from Gemini, set `GEMINI_MODEL` in `.env` to a model that is currently available in Google AI Studio.

## Run the tests

```bash
pytest
```

## Put it on GitHub

```bash
git init
git add .
git commit -m "EcoSort AI prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/ecosort-ai.git
git push -u origin main
```

## Deploy for free (example: Render)

1. Create a new **Web Service** on <https://render.com> and connect your GitHub repository.
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Under **Environment**, add `GEMINI_API_KEY` with your key.
5. Deploy, then open the public link. Free plans may take a short time to wake up on the first visit.

## Add more items

Open `backend/data/waste_knowledge.json` and copy an existing entry. Set `keywords` (words people might type), `waste_type` (`recyclable`, `biodegradable`, `hazardous` or `general`), and the advice fields. Adapting the advice to your city's rules is the easiest way to improve accuracy.

## Limitations

- Text input only; you describe the item.
- General guidance, not a replacement for local rules.
- AI answers for unfamiliar items can be wrong or vague. Hazardous keywords trigger a safety rule, but please double-check unusual items.
- The knowledge base covers common household items only.
- No user testing results yet.

## Future scope (proposed, not built)

Image-based waste identification, location-based recycling-centre suggestions, multilingual support, waste-collection integration, an analytics dashboard and a mobile app.

## Tech stack

HTML, CSS, JavaScript - Python, FastAPI - Gemini API (Google AI Studio) - JSON knowledge base - GitHub and free hosting.
