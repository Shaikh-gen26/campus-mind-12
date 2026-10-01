import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import AccessDenied from "./pages/AccessDenied";

import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import SuperAdminStudents from "./pages/superadmin/Students";
import SuperAdminStudentDetail from "./pages/superadmin/StudentDetail";
import SuperAdminAdmins from "./pages/superadmin/Admins";

import CourseAdminDashboard from "./pages/courseadmin/Dashboard";
import CourseAdminStudents from "./pages/courseadmin/Students";
import CourseAdminStudentDetail from "./pages/courseadmin/StudentDetail";

import StudentDashboard from "./pages/student/Dashboard";
import StudentAttendance from "./pages/student/Attendance";
import StudentGrades from "./pages/student/Grades";
import StudentAssignments from "./pages/student/Assignments";
import CampusGPT from "./pages/CampusGPT";

const HOME_BY_ROLE = {
  super_admin: "/admin/dashboard",
  course_admin: "/course-admin/dashboard",
  student: "/student/dashboard",
};

function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/campus-gpt" element={
          <ProtectedRoute roles={["super_admin", "course_admin", "student"]}>
            <CampusGPT />
          </ProtectedRoute>
        } />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <SuperAdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/:studentId"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <SuperAdminStudentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/admins"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <SuperAdminAdmins />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course-admin/dashboard"
          element={
            <ProtectedRoute roles={["course_admin"]}>
              <CourseAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-admin/students"
          element={
            <ProtectedRoute roles={["course_admin"]}>
              <CourseAdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-admin/students/:studentId"
          element={
            <ProtectedRoute roles={["course_admin"]}>
              <CourseAdminStudentDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/grades"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentGrades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentAssignments />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
