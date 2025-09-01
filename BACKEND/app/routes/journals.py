from flask import Blueprint, request
from .. import db
from ..models import JournalEntry, User
from ..services.hf_client import EmotionService

journals_bp = Blueprint('journals', __name__)
_emotion_service = EmotionService()


@journals_bp.get('/journals')
def list_journals():
    email = request.args.get('email', '').strip().lower()
    if not email:
        return {"success": False, "message": "email is required"}, 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return {"success": True, "entries": []}
    # Simple listing (could be paginated later)
    entries = (JournalEntry.query
               .filter_by(user_id=user.id)
               .order_by(JournalEntry.created_at.desc())
               .limit(100)
               .all())
    return {
        "success": True,
        "entries": [
            {
                "id": e.id,
                "text": e.text,
                "emotion": e.emotion,
                "score": e.score,
                "createdAt": e.created_at.isoformat()
            } for e in entries
        ]
    }


@journals_bp.post('/journals')
def create_journal():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    text = data.get('text', '').strip()

    if not email:
        return {"success": False, "message": "Email is required"}, 400
    if not text:
        return {"success": False, "message": "Text is required"}, 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return {"success": False, "message": "User not found"}, 404

    # Analyze with HF
    emotion, score = _emotion_service.classify(text)

    entry = JournalEntry(user_id=user.id, text=text, emotion=emotion, score=score)
    db.session.add(entry)
    db.session.commit()

    return {
        "success": True,
        "entry": {
            "id": entry.id,
            "text": entry.text,
            "emotion": entry.emotion,
            "score": entry.score,
            "createdAt": entry.created_at.isoformat()
        }
    }, 201
