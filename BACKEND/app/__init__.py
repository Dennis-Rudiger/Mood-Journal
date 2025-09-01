import os
from flask import Flask, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

# Initialize extensions

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app():
    # Load environment variables
    load_dotenv()

    app = Flask(__name__)

    # Config
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///mood_journal.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # CORS for frontend directory (allow all origins in dev)
    CORS(app, resources={r"/api/*": {"origins": os.getenv('CORS_ORIGINS', '*')}})

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config['SECRET_KEY'])

    # Models need to be imported after db is initialized
    from . import models  # noqa: F401

    # Init JWT
    jwt.init_app(app)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.journals import journals_bp
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(journals_bp, url_prefix='/api')

    @app.get('/api/health')
    def health():
        return {"status": "ok"}

    # Developer-friendly redirects so base URL doesn't 404
    @app.get('/')
    def index():
        return redirect('/api/health', code=302)

    @app.get('/api')
    def api_root():
        return redirect('/api/health', code=302)

    return app
