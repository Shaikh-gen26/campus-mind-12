"""
Seeds the database exactly per the README spec:
  - 6 engineering courses, 60 students each (360 total)
  - 1 primary Super Admin + 6 Course Admins (one per course)
  - 5-6 realistic subjects per course
  - Sample attendance, grades, assignments/submissions, announcements, events

Run with:  python -m app.seed
"""
import random
from datetime import date, timedelta

from app import create_app
from app.extensions import db
from app.models import (
    Role,
    User,
    Course,
    Subject,
    CourseAdminProfile,
    StudentProfile,
    Attendance,
    Assignment,
    Submission,
    Grade,
    Announcement,
    Event,
)

COURSES = [
    {
        "code": "CSE",
        "name": "Computer Engineering",
        "admin_name": "Dr. Rahul Mehta",
        "admin_id": "ADM-CSE-001",
        "admin_password": "CSE@2026Admin",
        "subjects": [
            "Data Structures",
            "Database Management Systems",
            "Operating Systems",
            "Computer Networks",
            "Software Engineering",
            "Machine Learning",
        ],
    },
    {
        "code": "IT",
        "name": "Information Technology",
        "admin_name": "Prof. Neha Kulkarni",
        "admin_id": "ADM-IT-001",
        "admin_password": "IT@2026Admin",
        "subjects": [
            "Web Technologies",
            "Database Management Systems",
            "Information Security",
            "Cloud Computing",
            "Software Testing",
        ],
    },
    {
        "code": "ENTC",
        "name": "Electronics & Telecommunication Engineering",
        "admin_name": "Prof. Amit Desai",
        "admin_id": "ADM-ENTC-001",
        "admin_password": "ENTC@2026Admin",
        "subjects": [
            "Digital Electronics",
            "Signals & Systems",
            "Microprocessors",
            "Communication Systems",
            "VLSI Design",
        ],
    },
    {
        "code": "ME",
        "name": "Mechanical Engineering",
        "admin_name": "Prof. Priya Sharma",
        "admin_id": "ADM-ME-001",
        "admin_password": "ME@2026Admin",
        "subjects": [
            "Thermodynamics",
            "Fluid Mechanics",
            "Machine Design",
            "Manufacturing Processes",
            "Heat Transfer",
        ],
    },
    {
        "code": "CE",
        "name": "Civil Engineering",
        "admin_name": "Prof. Sameer Patil",
        "admin_id": "ADM-CE-001",
        "admin_password": "CE@2026Admin",
        "subjects": [
            "Structural Analysis",
            "Geotechnical Engineering",
            "Surveying",
            "Concrete Technology",
            "Transportation Engineering",
        ],
    },
    {
        "code": "AIDS",
        "name": "Artificial Intelligence & Data Science",
        "admin_name": "Dr. Sneha Joshi",
        "admin_id": "ADM-AIDS-001",
        "admin_password": "AIDS@2026Admin",
        "subjects": [
            "Machine Learning",
            "Data Mining",
            "Deep Learning",
            "Statistics for AI",
            "Natural Language Processing",
        ],
    },
]

FIRST_NAMES = [
    "Aarav", "Ananya", "Rohan", "Ishita", "Aditya", "Sneha", "Vivaan", "Diya",
    "Arjun", "Kavya", "Reyansh", "Myra", "Sai", "Anika", "Krishna", "Riya",
    "Ishaan", "Aadhya", "Aryan", "Saanvi", "Kabir", "Pari", "Vihaan", "Navya",
    "Dhruv", "Siya", "Yash", "Tanvi", "Aarush", "Mahi", "Om", "Prisha",
    "Atharv", "Anvi", "Rudra", "Kiara", "Shaurya", "Aarohi", "Advait", "Zara",
]
LAST_NAMES = [
    "Sharma", "Patil", "Deshmukh", "Kulkarni", "Joshi", "Shah", "Gupta",
    "Kumar", "Singh", "Rao", "Reddy", "Iyer", "Nair", "Menon", "Pillai",
    "Chavan", "Jadhav", "Bhosale", "Kale", "Pawar", "Kadam", "Naik",
    "Mehta", "Desai", "Bhatt", "Trivedi", "Verma", "Yadav", "Mishra", "Agarwal",
]


def unique_names(n):
    seen = set()
    names = []
    while len(names) < n:
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        if name not in seen:
            seen.add(name)
            names.append(name)
    return names


def run_seed():
    app = create_app()
    with app.app_context():
        
        db.create_all()

        # --- Super Admin ---
        super_admin = User(
            login_id="SUPERADMIN001",
            full_name="CampusMind Administrator",
            role=Role.SUPER_ADMIN,
        )
        super_admin.set_password("Campus@2026Admin")
        db.session.add(super_admin)

        course_objs = {}
        subject_objs = {}

        for c in COURSES:
            course = Course(code=c["code"], name=c["name"])
            db.session.add(course)
            db.session.flush()
            course_objs[c["code"]] = course

            subjects = []
            for sname in c["subjects"]:
                subj = Subject(course_id=course.id, name=sname)
                db.session.add(subj)
                subjects.append(subj)
            db.session.flush()
            subject_objs[c["code"]] = subjects

            # Course admin
            admin_user = User(
                login_id=c["admin_id"],
                full_name=c["admin_name"],
                role=Role.COURSE_ADMIN,
            )
            admin_user.set_password(c["admin_password"])
            db.session.add(admin_user)
            db.session.flush()
            db.session.add(CourseAdminProfile(user_id=admin_user.id, course_id=course.id))

        db.session.flush()

        today = date.today()

        # --- 360 students, 60 per course ---
        for c in COURSES:
            course = course_objs[c["code"]]
            subjects = subject_objs[c["code"]]
            names = unique_names(60)

            for i, name in enumerate(names, start=1):
                login_id = f"{c['code']}2026{i:03d}"
                user = User(
                    login_id=login_id,
                    email=f"{login_id.lower()}@campusmind.edu",
                    full_name=name,
                    role=Role.STUDENT,
                )
                user.set_password(f"{c['code']}@Student{i:03d}")
                db.session.add(user)
                db.session.flush()

                sp = StudentProfile(
                    user_id=user.id,
                    course_id=course.id,
                    roll_number=i,
                    year=random.choice([1, 2, 3, 4]),
                    semester=random.choice([1, 2, 3, 4, 5, 6, 7, 8]),
                    section=random.choice(["A", "B"]),
                    admission_year=2026,
                    phone=f"9{random.randint(100000000, 999999999)}",
                    gender=random.choice(["Male", "Female"]),
                    dob=date(2005 + random.randint(0, 3), random.randint(1, 12), random.randint(1, 28)),
                )
                db.session.add(sp)
                db.session.flush()

                # Attendance: last 20 days, per subject
                for day_offset in range(20):
                    subj = random.choice(subjects)
                    db.session.add(
                        Attendance(
                            student_id=sp.id,
                            subject_id=subj.id,
                            date=today - timedelta(days=day_offset),
                            present=random.random() > 0.12,
                        )
                    )

                # Grades: one per subject
                for subj in subjects:
                    db.session.add(
                        Grade(
                            student_id=sp.id,
                            subject_id=subj.id,
                            internal_marks=random.randint(12, 25),
                            external_marks=random.randint(35, 70),
                        )
                    )

            db.session.flush()

            # Assignments per course (one per subject) + submissions for all 60 students
            students_in_course = StudentProfile.query.filter_by(course_id=course.id).all()
            for subj in subjects:
                assignment = Assignment(
                    subject_id=subj.id,
                    course_id=course.id,
                    title=f"{subj.name} — Assignment 1",
                    due_date=today + timedelta(days=random.randint(3, 21)),
                )
                db.session.add(assignment)
                db.session.flush()

                for sp in students_in_course:
                    db.session.add(
                        Submission(
                            assignment_id=assignment.id,
                            student_id=sp.id,
                            status=random.choice(["pending", "submitted", "graded"]),
                        )
                    )

            db.session.add(
                Announcement(
                    title=f"{course.name} department meeting",
                    body=f"All {course.code} students should check the notice board for the upcoming semester schedule.",
                    course_id=course.id,
                )
            )

        # University-wide announcements + events
        db.session.add(
            Announcement(title="Semester Registration Open", body="Registration for the new semester is now open for all courses.")
        )
        db.session.add(
            Announcement(title="Annual Tech Fest", body="The annual inter-college tech fest will be held next month.")
        )
        db.session.add(Event(title="Orientation Day", date=today + timedelta(days=5), description="New batch orientation."))
        db.session.add(Event(title="Sports Meet", date=today + timedelta(days=18), description="Annual university sports meet."))

        db.session.commit()
        print("Seed complete: 1 super admin, 6 course admins, 6 courses, 360 students.")


if __name__ == "__main__":
    run_seed()
