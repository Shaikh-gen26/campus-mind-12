import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const COURSES = ["CSE", "IT", "ENTC", "ME", "CE", "AIDS"];

export default function SuperAdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  function load() {
    api.superAdmin.listAdmins().then(setAdmins).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  return (
    <div>
      <div className="page-header">
        <h1>Course administrators</h1>
        <p>One class teacher per course, scoped to that course only.</p>
      </div>

      <button className="btn-primary" onClick={() => setShowCreate((s) => !s)}>
        {showCreate ? "Cancel" : "Add administrator"}
      </button>

      {error && <p className="error">{error}</p>}
      {showCreate && <CreateAdminForm onCreated={() => { setShowCreate(false); load(); }} />}

      <table className="ledger" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Admin ID</th>
            <th>Course</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id}>
              <td>{a.fullName}</td>
              <td>{a.loginId}</td>
              <td>{a.course}</td>
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

function CreateAdminForm({ onCreated }) {
  const [form, setForm] = useState({ fullName: "", loginId: "", courseCode: "CSE", password: "", email: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.superAdmin.createAdmin(form);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="filter-row" style={{ alignItems: "flex-end", marginTop: 16 }}>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>Full name</label>
        <br />
        <input required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
      </div>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>Admin ID</label>
        <br />
        <input
          required
          placeholder="ADM-XXX-001"
          value={form.loginId}
          onChange={(e) => setForm((f) => ({ ...f, loginId: e.target.value }))}
        />
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
        <label style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>Password</label>
        <br />
        <input required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
      </div>
      <button className="btn-primary" type="submit" disabled={saving}>
        {saving ? "Creating…" : "Create admin"}
      </button>
      {error && <span className="error">{error}</span>}
    </form>
  );
}
