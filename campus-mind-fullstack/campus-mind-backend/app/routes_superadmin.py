from flask import Blueprint, request, jsonify

from app.extensions import db
from app.auth import roles_required
from app.models import (
    Role,
    User,
    AccountStatus,
    Course,
    StudentProfile,
    CourseAdminProfile,
    Announcement,
    ActivityLog,
)

superadmin_bp = Blueprint("superadmin", __name__, url_prefix="/api/superadmin")


# ---- Dashboard (README section 13) ----------------------------------------
@superadmin_bp.get("/dashboard")
@roles_required(Role.SUPER_ADMIN)
def dashboard():
    total_students = StudentProfile.query.count()
    courses = Course.query.all()
    course_distribution = [
        {"course": c.name, "code": c.code, "students": len(c.students)} for c in courses
    ]
    recent_activity = [
        a.to_dict()
        for a in ActivityLog.query.order_by(ActivityLog.created_at.desc()).limit(10)
    ]
    active_users = User.query.filter_by(status=AccountStatus.ACTIVE).count()

    return jsonify(
        {
            "totalStudents": total_students,
            "totalCourses": len(courses),
            "totalCourseAdmins": CourseAdminProfile.query.count(),
            "activeUsers": active_users,
            "courseDistribution": course_distribution,
            "recentActivity": recent_activity,
        }
    )


# ---- Student management (README sections 14-15) ---------------------------
@superadmin_bp.get("/students")
@roles_required(Role.SUPER_ADMIN)
def list_students():
    q = StudentProfile.query.join(User)

    search = request.args.get("search")
    if search:
        like = f"%{search}%"
        q = q.filter(db.or_(User.full_name.ilike(like), User.login_id.ilike(like)))

    course_code = request.args.get("course")
    if course_code:
        q = q.join(Course).filter(Course.code == course_code)

    year = request.args.get("year", type=int)
    if year:
        q = q.filter(StudentProfile.year == year)

    semester = request.args.get("semester", type=int)
    if semester:
        q = q.filter(StudentProfile.semester == semester)

    status = request.args.get("status")
    if status:
        q = q.filter(User.status == AccountStatus(status))

    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("perPage", default=25, type=int)
    pagination = q.order_by(User.full_name).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        {
            "students": [s.to_dict() for s in pagination.items],
            "total": pagination.total,
            "page": page,
            "perPage": per_page,
        }
    )


@superadmin_bp.get("/students/<student_login_id>")
@roles_required(Role.SUPER_ADMIN)
def student_profile(student_login_id):
    user = User.query.filter_by(login_id=student_login_id, role=Role.STUDENT).first()
    if not user or not user.student_profile:
        return jsonify({"error": "Not found"}), 404

    sp = user.student_profile
    return jsonify(
        {
            **sp.to_dict(detailed=True),
            "attendanceRecords": [a.to_dict() for a in sp.attendance_records],
            "submissions": [s.to_dict() for s in sp.submissions],
            "grades": [g.to_dict() for g in sp.grades],
        }
    )


@superadmin_bp.post("/students/<student_login_id>/deactivate")
@roles_required(Role.SUPER_ADMIN)
def deactivate_student(student_login_id):
    user = User.query.filter_by(login_id=student_login_id, role=Role.STUDENT).first()
    if not user:
        return jsonify({"error": "Not found"}), 404
    user.status = AccountStatus.DEACTIVATED
    db.session.add(ActivityLog(message=f"{user.full_name} ({user.login_id}) was deactivated"))
    db.session.commit()
    return jsonify(user.to_dict())


@superadmin_bp.post("/students")
@roles_required(Role.SUPER_ADMIN)
def create_student():
    """README section 5/24: Super Admin can create student accounts."""
    payload = request.get_json(force=True)
    course = Course.query.filter_by(code=payload["courseCode"]).first()
    if not course:
        return jsonify({"error": "Unknown course code"}), 400

    existing_count = StudentProfile.query.filter_by(course_id=course.id).count()
    roll_number = existing_count + 1
    login_id = f"{course.code}{payload.get('admissionYear', 2026)}{roll_number:03d}"

    user = User(
        login_id=login_id,
        email=payload.get("email"),
        full_name=payload["fullName"],
        role=Role.STUDENT,
    )
    user.set_password(payload.get("password") or "Student@2026")
    db.session.add(user)
    db.session.flush()

    sp = StudentProfile(
        user_id=user.id,
        course_id=course.id,
        roll_number=roll_number,
        year=payload.get("year", 1),
        semester=payload.get("semester", 1),
        section=payload.get("section", "A"),
        admission_year=payload.get("admissionYear", 2026),
        phone=payload.get("phone"),
        gender=payload.get("gender"),
    )
    db.session.add(sp)
    db.session.add(ActivityLog(message=f"New student account created: {user.full_name} ({login_id})"))
    db.session.commit()

    return jsonify(sp.to_dict(detailed=True)), 201


# ---- Admin management (README section 23) ----------------------------------
@superadmin_bp.get("/admins")
@roles_required(Role.SUPER_ADMIN)
def list_admins():
    admins = User.query.filter_by(role=Role.COURSE_ADMIN).all()
    return jsonify(
        [
            {
                **a.to_dict(),
                "course": a.course_admin_profile.course.code if a.course_admin_profile else None,
            }
            for a in admins
        ]
    )


@superadmin_bp.post("/admins")
@roles_required(Role.SUPER_ADMIN)
def create_admin():
    payload = request.get_json(force=True)
    course = Course.query.filter_by(code=payload["courseCode"]).first()
    if not course:
        return jsonify({"error": "Unknown course code"}), 400
    if course.admin_profile:
        return jsonify({"error": "Course already has an admin"}), 409

    user = User(
        login_id=payload["loginId"],
        email=payload.get("email"),
        full_name=payload["fullName"],
        role=Role.COURSE_ADMIN,
    )
    user.set_password(payload["password"])
    db.session.add(user)
    db.session.flush()

    db.session.add(CourseAdminProfile(user_id=user.id, course_id=course.id))
    db.session.add(ActivityLog(message=f"Course administrator added: {user.full_name} ({course.code})"))
    db.session.commit()
    return jsonify(user.to_dict()), 201


# ---- Announcements (university-wide) ---------------------------------------
@superadmin_bp.post("/announcements")
@roles_required(Role.SUPER_ADMIN)
def create_announcement():
    payload = request.get_json(force=True)
    ann = Announcement(
        title=payload["title"],
        body=payload["body"],
        course_id=payload.get("courseId"),
    )
    db.session.add(ann)
    db.session.add(ActivityLog(message=f"New announcement published: {ann.title}"))
    db.session.commit()
    return jsonify(ann.to_dict()), 201


@superadmin_bp.get("/courses")
@roles_required(Role.SUPER_ADMIN)
def list_courses():
    return jsonify([c.to_dict(include_counts=True) for c in Course.query.all()])
