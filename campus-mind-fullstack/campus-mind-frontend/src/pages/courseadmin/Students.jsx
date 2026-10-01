import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

export default function CourseAdminStudents() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.courseAdmin.listStudents().then(setStudents).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>My students</h1>
        <p>{students.length} students in your course.</p>
      </div>

      {error && <p className="error">{error}</p>}

      <table className="ledger">
        <thead>
          <tr>
            <th>Name</th>
            <th>Student ID</th>
            <th>Roll No.</th>
            <th>Attendance</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.fullName}</td>
              <td>{s.studentId}</td>
              <td>{s.rollNumber}</td>
              <td>{s.attendance != null ? `${s.attendance}%` : "—"}</td>
              <td>
                <span className={`pill ${s.status}`}>{s.status}</span>
              </td>
              <td>
                <Link className="link-btn" to={`/course-admin/students/${s.studentId}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
