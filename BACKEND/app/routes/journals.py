from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import JournalEntry
from ..services.hf_client import EmotionService

journals_bp = Blueprint('journals', __name__)
_emotion_service = EmotionService()


@journals_bp.get('/journals')
@jwt_required()
def list_journals():
    user_id = int(get_jwt_identity())
    # Simple listing (could be paginated later)
    entries = (JournalEntry.query
               .filter_by(user_id=user_id)
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
@jwt_required()
def create_journal():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    text = data.get('text', '').strip()

    if not text:
        return {"success": False, "message": "Text is required"}, 400

    # Analyze with HF
    emotion, score = _emotion_service.classify(text)

    entry = JournalEntry(user_id=user_id, text=text, emotion=emotion, score=score)
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
