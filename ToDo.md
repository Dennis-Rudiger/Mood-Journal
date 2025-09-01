# Mood-Journal Fullstack To‑Do & Runbook

Use this as your single source of truth to finish and operate the project. Check items off as you complete them.

Legend: [ ] pending • [x] done • [~] optional

---

## 0) Prerequisites
- [ ] Windows PowerShell 5.1+ or PowerShell 7+ installed
- [ ] Python 3.11+ installed (with "Add python.exe to PATH")
- [ ] MySQL Server 8.x installed and running (local dev)
- [ ] MySQL Workbench installed (GUI), or MySQL CLI available
- [ ] Git + VS Code installed

Tips
- If `python` is missing, use `py -3` on Windows.
- If `python` opens Microsoft Store, disable App execution aliases for Python in Windows Settings.

---

## 1) Database (MySQL)

### 1.1 Create DB and user with MySQL Workbench (GUI)
- [ ] Open Workbench → "Local instance MySQL" → Connect
- [ ] Create schema:
  - Navigator → Schemas → Right‑click → Create Schema → Name: `mood_journal` → Apply
- [ ] Create user:
  - Navigator → Administration → Users and Privileges → Add Account
  - Login Name: `mood_user`
  - Password: `StrongPassword!` (choose your own strong password)
  - Authentication: Standard
- [ ] Grant privileges:
  - Select `mood_user` → Schema Privileges → Add Entry → Select `mood_journal`
  - Set "All Privileges" → Apply
- [ ] Test connection in Workbench (Database → Connect to Database…)

### 1.2 Create DB and user with MySQL CLI (alternative)
- [ ] Run the following (adjust password as needed):
```
CREATE DATABASE mood_journal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mood_user'@'127.0.0.1' IDENTIFIED BY 'StrongPassword!';
GRANT ALL PRIVILEGES ON mood_journal.* TO 'mood_user'@'127.0.0.1';
FLUSH PRIVILEGES;
```

### 1.3 Configure connection in `.env`
- [ ] In `BACKEND/.env`, set:
```
DATABASE_URL=mysql+pymysql://mood_user:StrongPassword!@127.0.0.1:3306/mood_journal
```
- [ ] Ensure MySQL service is running (Services app → MySQL → Running)

---

## 2) Backend (Flask + SQLAlchemy + JWT + HF)

### 2.1 Environment & dependencies
- [ ] From `BACKEND/`, run once (automated):
```
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
./setup.ps1
```
  - This creates `.venv`, installs requirements, and prepares `.env`.
- [ ] Or manual:
```
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

### 2.2 Configure `.env`
- [ ] Copy `BACKEND/.env.example` → `BACKEND/.env`
- [ ] Set secrets:
```
SECRET_KEY=<random-hex>
JWT_SECRET_KEY=<random-hex>
```
- [ ] Set DB URL (MySQL as above)
- [ ] Optional Hugging Face API token for real classification:
```
HF_API_TOKEN=hf_xxx
HF_EMOTION_MODEL=j-hartmann/emotion-english-distilroberta-base
```
- [ ] Restrict CORS for local dev frontend (adjust ports as needed):
```
CORS_ORIGINS=http://127.0.0.1:5500,http://localhost:5500
```

### 2.3 Migrations
- [ ] Apply migrations (dev):
```
$env:FLASK_APP = (Resolve-Path .\wsgi.py)
.\.venv\Scripts\python.exe -m flask db upgrade
```
- [ ] If you change models:
```
.\.venv\Scripts\python.exe -m flask db migrate -m "change"
.\.venv\Scripts\python.exe -m flask db upgrade
```

### 2.4 Run dev server
- [ ] Start server:
```
.\.venv\Scripts\python.exe .\wsgi.py
```
- [ ] Verify health: open http://127.0.0.1:5000/api/health (or just http://127.0.0.1:5000/)

### 2.5 Production serving (optional)
- [~] Windows: Waitress
```
python -m pip install waitress
waitress-serve --listen=127.0.0.1:5000 wsgi:app
```
- [~] Linux: Gunicorn + Nginx (reverse proxy, TLS)

### 2.6 Hardening (backend)
- [ ] Set `FLASK_ENV=production` in prod
- [ ] Set proper `CORS_ORIGINS`
- [ ] Add JWT expiry/refresh if desired
- [~] Rate limiting (Flask-Limiter) on auth/journals endpoints
- [~] Request body size limits for `/api/journals`
- [~] Structured logging to file (RotatingFileHandler) in prod

---

## 3) Frontend
- [ ] Confirm API base in `FRONTEND/script.js` and `FRONTEND/auth-script.js`:
```
const API_BASE = 'http://127.0.0.1:5000/api';
```
- [ ] Auth stores JWT in `localStorage.userToken`; journal POST includes `Authorization: Bearer <token>`
- [ ] If serving frontend via a local server (Live Server / VS Code), ensure the origin is included in `CORS_ORIGINS`

---

## 4) End-to-End Smoke Tests

### 4.1 API tests (PowerShell)
- [ ] Health
```
Invoke-RestMethod http://127.0.0.1:5000/api/health -Method GET
```
- [ ] Signup
```
Invoke-RestMethod http://127.0.0.1:5000/api/signup -Method POST -ContentType 'application/json' -Body (@{name='Demo';email='demo@mood.com';password='demo123'} | ConvertTo-Json)
```
- [ ] Login (capture token)
```
$login = Invoke-RestMethod http://127.0.0.1:5000/api/login -Method POST -ContentType 'application/json' -Body (@{email='demo@mood.com';password='demo123'} | ConvertTo-Json)
$token = $login.token
```
- [ ] Create journal
```
Invoke-RestMethod http://127.0.0.1:5000/api/journals -Method POST -Headers @{Authorization = "Bearer $token"} -ContentType 'application/json' -Body (@{text='Feeling great today!'} | ConvertTo-Json)
```
- [ ] List journals
```
Invoke-RestMethod http://127.0.0.1:5000/api/journals -Method GET -Headers @{Authorization = "Bearer $token"}
```

### 4.2 Frontend tests (Browser)
- [ ] Open `FRONTEND/login.html` via a static server or file URL
- [ ] Create account, then log in (JWT saved)
- [ ] Submit a journal entry; see emotion/score and recent entries update
- [ ] Refresh page; ensure data still loads and chart updates

---

## 5) Hugging Face Integration
- [ ] Set `HF_API_TOKEN` in `.env` (to avoid rate limits and ensure consistent results)
- [ ] Verify `/api/journals` returns non‑neutral labels/score
- [~] Optional: add simple in‑memory cache for classify(text) to minimize repeat calls

---

## 6) Security & Privacy
- [ ] Keep `.env` out of git (already ignored)
- [ ] Use strong `SECRET_KEY` / `JWT_SECRET_KEY`
- [ ] Tighten CORS to exact origins
- [ ] Enforce HTTPS in prod (reverse proxy)
- [ ] Consider account lockout/backoff on repeated failed logins
- [ ] Consider password reset flow (email delivery) and email verification (future)

---

## 7) Observability
- [~] Configure application logs (INFO in dev, WARNING/ERROR in prod) with rotation
- [~] Health endpoint is in place; consider a simple `/api/version` and uptime metrics
- [~] Add basic error tracking (e.g., Sentry) if desired

---

## 8) Database Operations
- [ ] Backup (mysqldump) command (dev):
```
mysqldump -h 127.0.0.1 -u mood_user -p mood_journal > backup_YYYYMMDD.sql
```
- [ ] Restore:
```
mysql -h 127.0.0.1 -u mood_user -p mood_journal < backup_YYYYMMDD.sql
```
- [~] Add indexes later if query patterns expand (currently using PK + created_at)

---

## 9) CI/CD (optional)
- [~] GitHub Actions: python lint/test job for `BACKEND` on PR
- [~] Pre-commit hooks for formatting and basic checks

---

## 10) Future Enhancements
- [~] Pagination for `/api/journals`
- [~] Search/filter journals by date/emotion
- [~] Tags/categories on journal entries
- [~] Export to CSV/JSON
- [~] Paystack integration & premium gating
- [~] Profile page and account settings
- [~] Model switcher / multi‑language support

---

## Quick References
- Backend dev run: `.\.venv\Scripts\python.exe .\wsgi.py`
- Automated setup: `./setup.ps1` (Windows PowerShell)
- API base: `http://127.0.0.1:5000/api`
- Health: `GET /api/health`

---

## Completion Criteria
- [ ] `.env` configured (MySQL URL, secrets, CORS, optional HF token)
- [ ] DB migrated and reachable; CRUD works via API
- [ ] Login returns JWT; journals endpoints work with Bearer token
- [ ] Frontend flows work against live backend (no fallback)
- [ ] Basic hardening applied for dev/prod
- [ ] Backup/restore verified for DB
