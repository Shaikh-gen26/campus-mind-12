from datetime import date, timedelta

from flask import Blueprint, jsonify

from app.auth import roles_required, current_user
from app.models import Role, Announcement, Event

student_bp = Blueprint("student", __name__, url_prefix="/api/student")


def _own_profile_or_403():
    user = current_user()
    if not user.student_profile:
        return None
    return user.student_profile


@student_bp.get("/dashboard")
@roles_required(Role.STUDENT)
def dashboard():
    sp = _own_profile_or_403()
    if not sp:
        return jsonify({"error": "Access Denied"}), 403

    upcoming_assignments = [
        s.to_dict() for s in sp.submissions if s.status == "pending"
    ]
    upcoming_events = (
        Event.query.filter(Event.date >= date.today())
        .order_by(Event.date)
        .limit(5)
        .all()
    )
    announcements = (
        Announcement.query.filter(
            (Announcement.course_id == sp.course_id) | (Announcement.course_id.is_(None))
        )
        .order_by(Announcement.created_at.desc())
        .limit(5)
        .all()
    )

    return jsonify(
        {
            "fullName": sp.user.full_name,
            "course": sp.course.to_dict(),
            "attendance": sp.attendance_percent(),
            "pendingAssignments": upcoming_assignments,
            "upcomingEvents": [e.to_dict() for e in upcoming_events],
            "announcements": [a.to_dict() for a in announcements],
        }
    )


@student_bp.get("/profile")
@roles_required(Role.STUDENT)
def profile():
    sp = _own_profile_or_403()
    if not sp:
        return jsonify({"error": "Access Denied"}), 403
    return jsonify(sp.to_dict(detailed=True))


@student_bp.get("/attendance")
@roles_required(Role.STUDENT)
def attendance():
    sp = _own_profile_or_403()
    if not sp:
        return jsonify({"error": "Access Denied"}), 403
    return jsonify(
        {
            "overall": sp.attendance_percent(),
            "records": [a.to_dict() for a in sp.attendance_records],
        }
    )


@student_bp.get("/grades")
@roles_required(Role.STUDENT)
def grades():
    sp = _own_profile_or_403()
    if not sp:
        return jsonify({"error": "Access Denied"}), 403
    return jsonify([g.to_dict() for g in sp.grades])


@student_bp.get("/assignments")
@roles_required(Role.STUDENT)
def assignments():
    sp = _own_profile_or_403()
    if not sp:
        return jsonify({"error": "Access Denied"}), 403
    return jsonify([s.to_dict() for s in sp.submissions])
