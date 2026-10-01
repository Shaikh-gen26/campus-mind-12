import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

const COURSES = ["CSE", "IT", "ENTC", "ME", "CE", "AIDS"];

export default function SuperAdminStudents() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", course: "", status: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  function load() {
    const params = { page: String(page), perPage: "25" };
    if (filters.search) params.search = filters.search;
    if (filters.course) params.course = filters.course;
    if (filters.status) params.status = filters.status;

    api.superAdmin
      .listStudents(params)
      .then((data) => {
        setStudents(data.students);
        setTotal(data.total);
      })
      .catch((e) => setError(e.message));
  }

  useEffect(load, [page, filters]);

  async function handleDeactivate(studentId) {
    if (!confirm("Deactivate this student's account?")) return;
    await api.superAdmin.deactivateStudent(studentId);
    load();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Students</h1>
        <p>{total} students across all six courses.</p>
      </div>

      <div className="filter-row">
        <input
          placeholder="Search by name or ID"
          value={filters.search}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, search: e.target.value }));
          }}
        />
        <select
          value={filters.course}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, course: e.target.value }));
          }}
        >
          <option value="">All courses</option>
          {COURSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, status: e.target.value }));
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="deactivated">Deactivated</option>
        </select>
        <button className="btn-primary" onClick={() => setShowCreate((s) => !s)}>
          {showCreate ? "Cancel" : "Add student"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {showCreate && <CreateStudentForm onCreated={() => { setShowCreate(false); load(); }} />}

      <table className="ledger">
        <thead>
          <tr>
            <th>Name</th>
            <th>Student ID</th>
            <th>Course</th>
            <th>Year</th>
            <th>Semester</th>
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
              <td>{s.course}</td>
              <td>{s.year}</td>
              <td>{s.semester}</td>
              <td>{s.attendance != null ? `${s.attendance}%` : "—"}</td>
              <td>
                <span className={`pill ${s.status}`}>{s.status}</span>
              </td>
              <td>
                <Link className="link-btn" to={`/admin/students/${s.studentId}`}>
                  View
                </Link>{" "}
                {s.status === "active" && (
                  <button className="link-btn danger" onClick={() => handleDeactivate(s.studentId)}>
                    Deactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="filter-row" style={{ marginTop: 16 }}>
        <button className="link-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>Page {page}</span>
        <button className="link-btn" disabled={page * 25 >= total} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

function CreateStudentForm({ onCreated }) {
  const [form, setForm] = useState({ fullName: "", courseCode: "CSE", email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.superAdmin.createStudent(form);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="filter-row" style={{ alignItems: "flex-end", marginBottom: 20 }}>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>Full name</label>
        <br />
        <input required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
      </div>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>Course</label>
        <br />
        <select value={form.courseCode} onChange={(e) => setForm((f) => ({ ...f, courseCode: e.target.value }))}>
          {COURSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>Email (optional)</label>
        <br />
        <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      </div>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>Password</label>
        <br />
        <input
          required
          type="text"
          placeholder="e.g. Student@2026"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
      </div>
      <button className="btn-primary" type="submit" disabled={saving}>
        {saving ? "Creating…" : "Create student"}
      </button>
      {error && <span className="error">{error}</span>}
    </form>
  );
}
