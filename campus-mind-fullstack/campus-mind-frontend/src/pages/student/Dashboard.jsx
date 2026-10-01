import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.student.dashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

  const firstName = data.fullName.split(" ")[0];

  return (
    <div>
      <div className="page-header">
        <h1>Good day, {firstName}</h1>
        <p>Here's what needs your attention today.</p>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="figure">{data.attendance != null ? `${data.attendance}%` : "—"}</div>
          <div className="label">Attendance</div>
        </div>
        <div className="stat">
          <div className="figure">{data.pendingAssignments.length}</div>
          <div className="label">Pending assignments</div>
        </div>
        <div className="stat">
          <div className="figure">{data.upcomingEvents.length}</div>
          <div className="label">Upcoming events</div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <h2 className="section-title">Pending assignments</h2>
          {data.pendingAssignments.length === 0 ? (
            <p className="empty-state">Nothing pending — you're caught up.</p>
          ) : (
            <table className="ledger">
              <tbody>
                {data.pendingAssignments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.assignment}</td>
                    <td>{a.subject}</td>
                    <td>{a.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h2 className="section-title">Upcoming events</h2>
          {data.upcomingEvents.length === 0 ? (
            <p className="empty-state">No events scheduled.</p>
          ) : (
            <table className="ledger">
              <tbody>
                {data.upcomingEvents.map((e) => (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td>{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <h2 className="section-title">Announcements</h2>
      {data.announcements.length === 0 ? (
        <p className="empty-state">No announcements yet.</p>
      ) : (
        <table className="ledger">
          <tbody>
            {data.announcements.map((a) => (
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
