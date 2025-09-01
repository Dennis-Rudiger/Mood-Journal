from datetime import datetime
from . import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    entries = db.relationship('JournalEntry', backref='user', lazy=True, cascade='all, delete-orphan')

    def __init__(self, name: str, email: str, **kwargs):
        """Explicit init for type checkers (SQLAlchemy accepts kwargs by default).

        Parameters
        - name: display name for the user
        - email: unique email address
        """
        super().__init__(**kwargs)
        self.name = name
        self.email = email

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


class JournalEntry(db.Model):
    __tablename__ = 'journal_entries'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    text = db.Column(db.Text, nullable=False)
    emotion = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def __init__(self, user_id: int, text: str, emotion: str, score: float, **kwargs):
        """Explicit init for type checkers (matches usage in routes)."""
        super().__init__(**kwargs)
        self.user_id = user_id
        self.text = text
        self.emotion = emotion
        self.score = score
