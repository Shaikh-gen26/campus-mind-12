import enum
from datetime import datetime, date

from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import db


class Role(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    COURSE_ADMIN = "course_admin"
    STUDENT = "student"


class AccountStatus(str, enum.Enum):
    ACTIVE = "active"
    DEACTIVATED = "deactivated"


# ---------------------------------------------------------------------------
# Core identity
# ---------------------------------------------------------------------------
class User(db.Model):
    """Base identity/auth record for every login: super admin, course admin,
    or student. Replaces Supabase Auth entirely — password hashes and roles
    live here, in our own database."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    login_id = db.Column(db.String(64), unique=True, nullable=False, index=True)  # e.g. CSE2026001, ADM-CSE-001, SUPERADMIN001
    email = db.Column(db.String(255), unique=True, nullable=True)
    full_name = db.Column(db.String(255), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(Role), nullable=False)
    status = db.Column(db.Enum(AccountStatus), nullable=False, default=AccountStatus.ACTIVE)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # One-to-one profile extensions
    student_profile = db.relationship("StudentProfile", backref="user", uselist=False, cascade="all, delete-orphan")
    course_admin_profile = db.relationship("CourseAdminProfile", backref="user", uselist=False, cascade="all, delete-orphan")

    def set_password(self, raw_password: str) -> None:
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        return {
            "id": self.id,
            "loginId": self.login_id,
            "email": self.email,
            "fullName": self.full_name,
            "role": self.role.value,
            "status": self.status.value,
        }


# ---------------------------------------------------------------------------
# Courses & subjects
# ---------------------------------------------------------------------------
class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(16), unique=True, nullable=False)  # CSE, IT, ENTC, ME, CE, AIDS
    name = db.Column(db.String(128), nullable=False)

    subjects = db.relationship("Subject", backref="course", cascade="all, delete-orphan")
    students = db.relationship("StudentProfile", backref="course", cascade="all, delete-orphan")
    admin_profile = db.relationship("CourseAdminProfile", backref="course", uselist=False)

    def to_dict(self, include_counts=False):
        data = {"id": self.id, "code": self.code, "name": self.name}
        if include_counts:
            data["studentCount"] = len(self.students)
        return data


class Subject(db.Model):
    __tablename__ = "subjects"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    name = db.Column(db.String(128), nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "courseId": self.course_id}


# ---------------------------------------------------------------------------
# Course admin (class teacher) profile
# ---------------------------------------------------------------------------
class CourseAdminProfile(db.Model):
    __tablename__ = "course_admin_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), unique=True, nullable=False)


# ---------------------------------------------------------------------------
# Student profile
# ---------------------------------------------------------------------------
class StudentProfile(db.Model):
    __tablename__ = "student_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)

    roll_number = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False, default=1)
    semester = db.Column(db.Integer, nullable=False, default=1)
    section = db.Column(db.String(4), nullable=False, default="A")
    admission_year = db.Column(db.Integer, nullable=False, default=2026)

    phone = db.Column(db.String(20))
    dob = db.Column(db.Date)
    gender = db.Column(db.String(16))

    attendance_records = db.relationship("Attendance", backref="student", cascade="all, delete-orphan")
    grades = db.relationship("Grade", backref="student", cascade="all, delete-orphan")
    submissions = db.relationship("Submission", backref="student", cascade="all, delete-orphan")

    def attendance_percent(self):
        records = self.attendance_records
        if not records:
            return None
        present = sum(1 for r in records if r.present)
        return round(100 * present / len(records), 1)

    def to_dict(self, detailed=False):
        data = {
            "id": self.id,
            "userId": self.user_id,
            "studentId": self.user.login_id,
            "fullName": self.user.full_name,
            "email": self.user.email,
            "status": self.user.status.value,
            "course": self.course.code,
            "courseName": self.course.name,
            "year": self.year,
            "semester": self.semester,
            "section": self.section,
            "rollNumber": self.roll_number,
            "admissionYear": self.admission_year,
            "attendance": self.attendance_percent(),
        }
        if detailed:
            data.update(
                {
                    "phone": self.phone,
                    "dob": self.dob.isoformat() if self.dob else None,
                    "gender": self.gender,
                }
            )
        return data


# ---------------------------------------------------------------------------
# Attendance / Assignments / Submissions / Grades
# ---------------------------------------------------------------------------
class Attendance(db.Model):
    __tablename__ = "attendance"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student_profiles.id"), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey("subjects.id"), nullable=False)
    date = db.Column(db.Date, nullable=False, default=date.today)
    present = db.Column(db.Boolean, nullable=False, default=True)

    subject = db.relationship("Subject")

    def to_dict(self):
        return {
            "id": self.id,
            "subject": self.subject.name,
            "date": self.date.isoformat(),
            "present": self.present,
        }


class Assignment(db.Model):
    __tablename__ = "assignments"

    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey("subjects.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    subject = db.relationship("Subject")
    submissions = db.relationship("Submission", backref="assignment", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "subject": self.subject.name,
            "dueDate": self.due_date.isoformat(),
        }


class Submission(db.Model):
    __tablename__ = "submissions"

    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey("assignments.id"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("student_profiles.id"), nullable=False)
    status = db.Column(db.String(24), nullable=False, default="pending")  # pending, submitted, late, graded

    def to_dict(self):
        a = self.assignment
        return {
            "id": self.id,
            "assignment": a.title,
            "subject": a.subject.name,
            "dueDate": a.due_date.isoformat(),
            "status": self.status,
        }


class Grade(db.Model):
    __tablename__ = "grades"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student_profiles.id"), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey("subjects.id"), nullable=False)
    internal_marks = db.Column(db.Integer, nullable=False, default=0)
    external_marks = db.Column(db.Integer, nullable=False, default=0)

    subject = db.relationship("Subject")

    @property
    def total(self):
        return self.internal_marks + self.external_marks

    @property
    def letter_grade(self):
        t = self.total
        if t >= 90:
            return "A+"
        if t >= 80:
            return "A"
        if t >= 70:
            return "B+"
        if t >= 60:
            return "B"
        if t >= 50:
            return "C"
        return "F"

    def to_dict(self):
        return {
            "subject": self.subject.name,
            "internal": self.internal_marks,
            "external": self.external_marks,
            "total": self.total,
            "grade": self.letter_grade,
        }


# ---------------------------------------------------------------------------
# Announcements / Events / Notifications
# ---------------------------------------------------------------------------
class Announcement(db.Model):
    __tablename__ = "announcements"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=True)  # null = university-wide
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "scope": "course" if self.course_id else "university",
            "createdAt": self.created_at.isoformat(),
        }


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "date": self.date.isoformat(),
            "description": self.description,
        }


class ActivityLog(db.Model):
    """Powers the "Recent Activity" feeds on the dashboards."""

    __tablename__ = "activity_log"

    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(255), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {"id": self.id, "message": self.message, "createdAt": self.created_at.isoformat()}
