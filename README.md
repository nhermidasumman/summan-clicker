# 🎮 Summan Data Clicker

Un juego incremental temático de **Summan** — Transformación Digital, un dato a la vez.

## 🚀 Quick Start (Dev)

```bash
pip install -r requirements-dev.txt
uvicorn main:app --reload
```

Abrir [http://localhost:8000](http://localhost:8000)

## 🧪 Tests

```bash
playwright install chromium
pytest -v test_game.py
```

## 📦 Deploy

El juego se despliega automáticamente en **Render** con cada push a `main`.

## 🛠️ Stack

- **Backend**: FastAPI + Uvicorn
- **Frontend**: Vanilla HTML/CSS/JS
- **Persistencia**: LocalStorage (client-side)
- **Deploy**: Render (free tier)
