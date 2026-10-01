from datetime import date

from flask import Blueprint, request, jsonify

from app.extensions import db
from app.auth import roles_required, current_user
from app.models import Role, StudentProfile, Assignment, Announcement, ActivityLog

courseadmin_bp = Blueprint("courseadmin", __name__, url_prefix="/api/course-admin")


def _own_course_or_403():
    """Every route in this module is scoped to the logged-in Course Admin's
    single assigned course — mirroring README section 12's example of an
    ENTC/IT/CSE admin being denied access to another course's data. There is
    no course_id parameter accepted from the client for this reason: the
    course is always derived from the authenticated admin's own profile."""
    user = current_user()
    if not user.course_admin_profile:
        return None
    return user.course_admin_profile.course


@courseadmin_bp.get("/dashboard")
@roles_required(Role.COURSE_ADMIN)
def dashboard():
    course = _own_course_or_403()
    if not course:
        return jsonify({"error": "Access Denied"}), 403

    students = course.students
    total = len(students)
    avg_attendance = None
    percents = [s.attendance_percent() for s in students if s.attendance_percent() is not None]
    if percents:
        avg_attendance = round(sum(percents) / len(percents), 1)

    pending_assignments = Assignment.query.filter_by(course_id=course.id).filter(
        Assignment.due_date >= date.today()
    ).count()

    recent_announcements = (
        Announcement.query.filter(
            db.or_(Announcement.course_id == course.id, Announcement.course_id.is_(None))
        )
        .order_by(Announcement.created_at.desc())
        .limit(5)
        .all()
    )

    return jsonify(
        {
            "course": course.to_dict(),
            "totalStudents": total,
            "averageAttendance": avg_attendance,
            "pendingAssignments": pending_assignments,
            "recentAnnouncements": [a.to_dict() for a in recent_announcements],
        }
    )


@courseadmin_bp.get("/students")
@roles_required(Role.COURSE_ADMIN)
def list_students():
    course = _own_course_or_403()
    if not course:
        return jsonify({"error": "Access Denied"}), 403

    students = StudentProfile.query.filter_by(course_id=course.id).order_by(
        StudentProfile.roll_number
    ).all()
    return jsonify([s.to_dict() for s in students])


@courseadmin_bp.get("/students/<student_login_id>")
@roles_required(Role.COURSE_ADMIN)
def student_detail(student_login_id):
    course = _own_course_or_403()
    if not course:
        return jsonify({"error": "Access Denied"}), 403

    sp = (
        StudentProfile.query.join(StudentProfile.user)
        .filter_by(login_id=student_login_id)
        .first()
    )
    # README section 12: CSE admin opening an IT student's URL -> Access Denied
    if not sp or sp.course_id != course.id:
        return jsonify({"error": "Access Denied"}), 403

    return jsonify(
        {
            **sp.to_dict(detailed=True),
            "attendanceRecords": [a.to_dict() for a in sp.attendance_records],
            "submissions": [s.to_dict() for s in sp.submissions],
            "grades": [g.to_dict() for g in sp.grades],
        }
    )


@courseadmin_bp.post("/announcements")
@roles_required(Role.COURSE_ADMIN)
def create_announcement():
    course = _own_course_or_403()
    if not course:
        return jsonify({"error": "Access Denied"}), 403

    payload = request.get_json(force=True)
    ann = Announcement(title=payload["title"], body=payload["body"], course_id=course.id)
    db.session.add(ann)
    db.session.add(ActivityLog(message=f"New announcement published: {ann.title}", course_id=course.id))
    db.session.commit()
    return jsonify(ann.to_dict()), 201
