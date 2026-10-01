import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = {
  super_admin: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/campus-gpt", label: "My CampusGPT" },
    { to: "/admin/students", label: "Students" },
    { to: "/admin/admins", label: "Course Admins" },
  ],
  course_admin: [
    { to: "/course-admin/dashboard", label: "Dashboard" },
    { to: "/campus-gpt", label: "My CampusGPT" },
    { to: "/course-admin/students", label: "My Students" },
  ],
  student: [
    { to: "/student/dashboard", label: "Dashboard" },
    { to: "/campus-gpt", label: "My CampusGPT" },
    { to: "/student/attendance", label: "Attendance" },
    { to: "/student/grades", label: "Grades" },
    { to: "/student/assignments", label: "Assignments" },
  ],
};

const ROLE_LABEL = {
  super_admin: "Super Admin",
  course_admin: "Course Admin",
  student: "Student",
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return children;

  function handleSignOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          Campus
          <br />
          Intelligence Hub
        </div>
        <nav>
          {NAV[user.role].map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "active" : "")}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="who">
          <strong>{user.fullName}</strong>
          {ROLE_LABEL[user.role]} · {user.loginId}
          <button className="signout" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
