import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.student.grades().then(setGrades).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Grades</h1>
        <p>Internal and external marks by subject.</p>
      </div>

      {error && <p className="error">{error}</p>}

      <table className="ledger">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Internal</th>
            <th>External</th>
            <th>Total</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g, i) => (
            <tr key={i}>
              <td>{g.subject}</td>
              <td>{g.internal}</td>
              <td>{g.external}</td>
              <td>{g.total}</td>
              <td>{g.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
