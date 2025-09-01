from flask import Blueprint, request
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError
from .. import db
from ..models import User

auth_bp = Blueprint('auth', __name__)


@auth_bp.post('/signup')
def signup():
    data = request.get_json(silent=True) or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return {"success": False, "message": "Missing required fields"}, 400

    user = User(name=name, email=email)
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {"success": False, "message": "Email already registered"}, 409

    return {"success": True, "message": "Signup successful"}, 201


@auth_bp.post('/login')
def login():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return {"success": False, "message": "Missing email or password"}, 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return {"success": False, "message": "Invalid credentials"}, 401

    token = create_access_token(identity=str(user.id), additional_claims={"email": user.email, "name": user.name})
    return {
        "success": True,
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }
