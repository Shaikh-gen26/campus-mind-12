import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.student.assignments().then(setAssignments).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Assignments</h1>
        <p>Everything assigned to you this semester.</p>
      </div>

      {error && <p className="error">{error}</p>}

      <table className="ledger">
        <thead>
          <tr>
            <th>Assignment</th>
            <th>Subject</th>
            <th>Due date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => (
            <tr key={a.id}>
              <td>{a.assignment}</td>
              <td>{a.subject}</td>
              <td>{a.dueDate}</td>
              <td>
                <span className={`pill ${a.status}`}>{a.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
