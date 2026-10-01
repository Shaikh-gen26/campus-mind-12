export default function StudentProfileView({ data }) {
  return (
    <div>
      <h2 className="section-title">Personal information</h2>
      <dl className="profile-grid">
        <dt>Full name</dt>
        <dd>{data.fullName}</dd>
        <dt>Student ID</dt>
        <dd>{data.studentId}</dd>
        <dt>Email</dt>
        <dd>{data.email || "—"}</dd>
        <dt>Phone</dt>
        <dd>{data.phone || "—"}</dd>
        <dt>Date of birth</dt>
        <dd>{data.dob || "—"}</dd>
        <dt>Gender</dt>
        <dd>{data.gender || "—"}</dd>
      </dl>

      <h2 className="section-title">Academic information</h2>
      <dl className="profile-grid">
        <dt>Course</dt>
        <dd>{data.courseName} ({data.course})</dd>
        <dt>Year</dt>
        <dd>{data.year}</dd>
        <dt>Semester</dt>
        <dd>{data.semester}</dd>
        <dt>Section</dt>
        <dd>{data.section}</dd>
        <dt>Roll number</dt>
        <dd>{data.rollNumber}</dd>
        <dt>Admission year</dt>
        <dd>{data.admissionYear}</dd>
        <dt>Status</dt>
        <dd>
          <span className={`pill ${data.status}`}>{data.status}</span>
        </dd>
        <dt>Attendance</dt>
        <dd>{data.attendance != null ? `${data.attendance}%` : "—"}</dd>
      </dl>

      <h2 className="section-title">Assignments</h2>
      {data.submissions.length === 0 ? (
        <p className="empty-state">No assignments recorded.</p>
      ) : (
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
            {data.submissions.map((s) => (
              <tr key={s.id}>
                <td>{s.assignment}</td>
                <td>{s.subject}</td>
                <td>{s.dueDate}</td>
                <td>
                  <span className={`pill ${s.status}`}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="section-title">Grades</h2>
      {data.grades.length === 0 ? (
        <p className="empty-state">No grades recorded.</p>
      ) : (
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
            {data.grades.map((g, i) => (
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
      )}
    </div>
  );
}
