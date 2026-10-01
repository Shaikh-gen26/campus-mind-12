/**
 * Drop this in as src/lib/api.ts in the existing frontend, replacing the
 * Supabase client (src/lib/supabase.ts or similar) as the thing your
 * components import for data. It talks to the new Flask backend instead.
 *
 * Set VITE_API_URL in your frontend .env, e.g.:
 *   VITE_API_URL=http://localhost:5000
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "campus_mind_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    clearToken();
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  // --- Auth ---
  login: (loginId: string, password: string) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ loginId, password }) }),
  me: () => request("/api/auth/me"),

  // --- Super Admin ---
  superAdmin: {
    dashboard: () => request("/api/superadmin/dashboard"),
    listStudents: (params: Record<string, string> = {}) =>
      request(`/api/superadmin/students?${new URLSearchParams(params)}`),
    studentDetail: (studentId: string) => request(`/api/superadmin/students/${studentId}`),
    createStudent: (payload: object) =>
      request("/api/superadmin/students", { method: "POST", body: JSON.stringify(payload) }),
    deactivateStudent: (studentId: string) =>
      request(`/api/superadmin/students/${studentId}/deactivate`, { method: "POST" }),
    listAdmins: () => request("/api/superadmin/admins"),
    createAdmin: (payload: object) =>
      request("/api/superadmin/admins", { method: "POST", body: JSON.stringify(payload) }),
    listCourses: () => request("/api/superadmin/courses"),
    createAnnouncement: (payload: object) =>
      request("/api/superadmin/announcements", { method: "POST", body: JSON.stringify(payload) }),
  },

  // --- Course Admin ---
  courseAdmin: {
    dashboard: () => request("/api/course-admin/dashboard"),
    listStudents: () => request("/api/course-admin/students"),
    studentDetail: (studentId: string) => request(`/api/course-admin/students/${studentId}`),
    createAnnouncement: (payload: object) =>
      request("/api/course-admin/announcements", { method: "POST", body: JSON.stringify(payload) }),
  },

  // --- Student ---
  student: {
    dashboard: () => request("/api/student/dashboard"),
    profile: () => request("/api/student/profile"),
    attendance: () => request("/api/student/attendance"),
    grades: () => request("/api/student/grades"),
    assignments: () => request("/api/student/assignments"),
  },
};
