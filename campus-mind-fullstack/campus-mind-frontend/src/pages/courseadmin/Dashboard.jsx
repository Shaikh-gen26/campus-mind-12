import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function CourseAdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.courseAdmin.dashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <h1>{data.course.name}</h1>
        <p>Your course register — {data.course.code}.</p>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="figure">{data.totalStudents}</div>
          <div className="label">Total students</div>
        </div>
        <div className="stat">
          <div className="figure">{data.averageAttendance != null ? `${data.averageAttendance}%` : "—"}</div>
          <div className="label">Average attendance</div>
        </div>
        <div className="stat">
          <div className="figure">{data.pendingAssignments}</div>
          <div className="label">Open assignments</div>
        </div>
      </div>

      <h2 className="section-title">Recent announcements</h2>
      {data.recentAnnouncements.length === 0 ? (
        <p className="empty-state">No announcements yet.</p>
      ) : (
        <table className="ledger">
          <tbody>
            {data.recentAnnouncements.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.body}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
