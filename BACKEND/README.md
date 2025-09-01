# Mood-Journal Backend (Flask)

## Quick start (Windows PowerShell)

```powershell
# In BACKEND/
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
./setup.ps1 -Start
```

This will create a venv, install deps, create .env (if missing), run migrations, and start the server.

---

## Manual Setup

1) Create and activate venv (Windows):

```powershell
py -3 -m venv .venv  # or: python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2) Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

3) Configure environment:

Copy `.env.example` to `.env` and set values.

- DATABASE_URL (e.g. mysql+pymysql://user:pass@localhost/mood_journal)
- SECRET_KEY and JWT_SECRET_KEY (random strings)
- HF_API_TOKEN (Hugging Face token)
- CORS_ORIGINS (optional, default *)

4) Initialize database (SQLite by default):

```powershell
$env:FLASK_APP = (Resolve-Path .\wsgi.py)
flask db init
flask db migrate -m "init"
flask db upgrade
```

5) Run:

```powershell
python .\wsgi.py
```

API will be on http://127.0.0.1:5000/api

## Endpoints

- POST /api/signup { name, email, password }
- POST /api/login { email, password } -> { token }
- GET /api/journals (Bearer token)
- POST /api/journals { text } (Bearer token)

## Notes
- Uses Hugging Face InferenceClient with model `j-hartmann/emotion-english-distilroberta-base`.
- Switch DB to MySQL by setting DATABASE_URL.
