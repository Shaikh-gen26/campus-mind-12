import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function StudentAttendance() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.student.attendance().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <h1>Attendance</h1>
        <p>Your record across all subjects.</p>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="figure">{data.overall != null ? `${data.overall}%` : "—"}</div>
          <div className="label">Overall attendance</div>
        </div>
      </div>

      <table className="ledger">
        <thead>
          <tr>
            <th>Date</th>
            <th>Subject</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.records.map((r) => (
            <tr key={r.id}>
              <td>{r.date}</td>
              <td>{r.subject}</td>
              <td>
                <span className={`pill ${r.present ? "active" : "deactivated"}`}>
                  {r.present ? "Present" : "Absent"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
