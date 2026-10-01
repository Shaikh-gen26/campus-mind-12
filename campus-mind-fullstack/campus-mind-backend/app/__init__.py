from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from app.extensions import db, jwt


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}}, supports_credentials=True)

    from app.auth import auth_bp
    from app.routes_superadmin import superadmin_bp
    from app.routes_courseadmin import courseadmin_bp
    from app.routes_student import student_bp
    from app.routes_chat import chat_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(superadmin_bp)
    app.register_blueprint(courseadmin_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(chat_bp)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @jwt.unauthorized_loader
    def unauthorized(reason):
        return jsonify({"error": "Authentication required"}), 401

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return jsonify({"error": "Invalid or expired token"}), 401

    return app
