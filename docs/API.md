# Mood Journal API Contract (Draft)

Base URL: /api

Auth uses JWT in an Authorization: Bearer <token> header.

## Auth

POST /signup
- Body (JSON): { name: string, email: string, password: string }
- 201 Created: { success: true, user: { id, name, email } }
- Errors:
  - 400: { success: false, message: "Invalid input" }
  - 409: { success: false, message: "Email already in use" }

POST /login
- Body (JSON): { email: string, password: string }
- 200 OK: { success: true, token: string, user: { id, name, email } }
- Errors:
  - 401: { success: false, message: "Invalid credentials" }

## Journals

GET /journals
- Auth required
- Query (optional): page (number), limit (number)
- 200 OK: {
  success: true,
  entries: [
    { id, date: ISO8601, text, emotion, score }
  ],
  page, limit, total
}

POST /journals
- Auth required
- Body (JSON): { text: string }
- 201 Created: {
  success: true,
  entry: { id, date, text, emotion, score }
}
- Errors:
  - 400: { success: false, message: "Text required" }

PUT /journals/:id (optional, later)
- Auth required
- Body: { text?: string }
- 200 OK: { success: true, entry }

DELETE /journals/:id (optional, later)
- Auth required
- 204 No Content

## Sentiment Analysis
- Performed server-side on POST /journals using Hugging Face Inference API.
- Suggested output fields to persist on entry: emotion (string), score (0-100 integer).

## Errors & Conventions
- All responses JSON with `success` boolean.
- Use standard HTTP status codes.
- Rate limit unauthenticated endpoints (e.g., /login) server-side.
