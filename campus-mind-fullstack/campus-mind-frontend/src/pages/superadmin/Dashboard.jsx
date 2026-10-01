import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.superAdmin.dashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <h1>University overview</h1>
        <p>Every course, every student, one register.</p>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="figure">{data.totalStudents}</div>
          <div className="label">Total students</div>
        </div>
        <div className="stat">
          <div className="figure">{data.totalCourses}</div>
          <div className="label">Courses</div>
        </div>
        <div className="stat">
          <div className="figure">{data.totalCourseAdmins}</div>
          <div className="label">Course administrators</div>
        </div>
        <div className="stat">
          <div className="figure">{data.activeUsers}</div>
          <div className="label">Active accounts</div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <h2 className="section-title">Course distribution</h2>
          <table className="ledger">
            <tbody>
              {data.courseDistribution.map((c) => (
                <tr key={c.code}>
                  <td>{c.course}</td>
                  <td>{c.students} students</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="section-title">Recent activity</h2>
          {data.recentActivity.length === 0 ? (
            <p className="empty-state">Nothing logged yet.</p>
          ) : (
            <table className="ledger">
              <tbody>
                {data.recentActivity.map((a) => (
                  <tr key={a.id}>
                    <td>{a.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <h2 className="section-title">Quick actions</h2>
      <div className="filter-row">
        <Link className="btn-primary" style={{ textDecoration: "none" }} to="/admin/students">
          View students
        </Link>
        <Link className="btn-primary" style={{ textDecoration: "none" }} to="/admin/admins">
          Manage course admins
        </Link>
      </div>
    </div>
  );
}
