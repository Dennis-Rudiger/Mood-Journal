# Mood-Journal

AI-powered mood journal (frontend prototype). Tracks entries, shows mood trends with Chart.js, and includes a styled auth page ready to wire to a backend.

Core Features (planned):
- Journal entry form (HTML/CSS/JS frontend)
- Flask backend with MySQL for storing entries
- Hugging Face Inference API for sentiment analysis
- Chart.js for displaying mood trends
- User authentication (login/signup)
- Optional Paystack subscription integration

Current Status
- Frontend works locally with mock AI analysis and localStorage persistence for entries.
- Auth page is functional on the client side with demo credentials and mock API calls; real backend not yet implemented.
- Backend, AI, and payments are not yet in this repo.

Tech Stack
- Frontend: HTML, CSS, JavaScript, Chart.js
- Backend (planned): Python Flask, MySQL
- AI (planned): Hugging Face Inference API
- Payments (optional, planned): Paystack

What’s Included (Frontend)
- `FRONTEND/index.html` – Dashboard with journal form and mood visualization
- `FRONTEND/login.html` – Auth UI (login/register) with client-side validation
- `FRONTEND/styles.css` – App styling for dashboard
- `FRONTEND/style/auth-styles.css` – Auth page styling
- `FRONTEND/script.js` – Frontend logic + Chart.js + localStorage persistence
- `FRONTEND/auth-script.js` – Auth form logic with mock API and demo credentials

Run Locally
1) Open `FRONTEND/index.html` in your browser.
2) Use the “Login / Sign Up” button to navigate to auth.
3) Use demo login: Email `demo@moodtracker.com`, Password `demo123` (mocked on client).

Next Steps
- Scaffold Flask backend with auth and journal CRUD.
- Wire real endpoints in `auth-script.js` and `script.js`.
- Integrate Hugging Face for real sentiment analysis.
- Add `.env` management and document required keys.
