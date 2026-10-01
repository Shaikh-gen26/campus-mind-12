from functools import wraps

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt,
    get_jwt_identity,
)

from app.extensions import db
from app.models import User, AccountStatus, Role

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/login")
def login():
    """Single login endpoint for every role, matching README section 11:
    the user enters ID/email + password; the server determines the role
    and the frontend redirects based on the role in the response."""
    payload = request.get_json(silent=True) or {}
    login_id = (payload.get("loginId") or payload.get("email") or "").strip()
    password = payload.get("password") or ""

    if not login_id or not password:
        return jsonify({"error": "loginId and password are required"}), 400

    user = User.query.filter(
        (User.login_id == login_id) | (User.email == login_id)
    ).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    if user.status == AccountStatus.DEACTIVATED:
        return jsonify({"error": "This account has been deactivated"}), 403

    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role.value},
    )

    redirect_map = {
        Role.SUPER_ADMIN.value: "/admin/dashboard",
        Role.COURSE_ADMIN.value: "/course-admin/dashboard",
        Role.STUDENT.value: "/student/dashboard",
    }

    return jsonify(
        {
            "token": token,
            "user": user.to_dict(),
            "redirectTo": redirect_map[user.role.value],
        }
    )


@auth_bp.get("/me")
@jwt_required()
def me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "Not found"}), 404
    return jsonify(user.to_dict())


def roles_required(*allowed_roles):
    """Decorator enforcing README section 12 (strict access control).
    Use on top of @jwt_required(). Any role not listed gets a 403,
    mirroring the "Access Denied" behavior specified for every
    cross-role route example in the README."""

    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            if claims.get("role") not in [r.value for r in allowed_roles]:
                return jsonify({"error": "Access Denied"}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def current_user() -> User:
    return User.query.get(int(get_jwt_identity()))
