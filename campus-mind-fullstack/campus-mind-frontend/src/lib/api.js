const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "campus_mind_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
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
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  chat: (message, history = []) =>
    request("/api/chat", { method: "POST", body: JSON.stringify({ message, history }) }),
  login: (loginId, password) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ loginId, password }) }),
  me: () => request("/api/auth/me"),

  superAdmin: {
    dashboard: () => request("/api/superadmin/dashboard"),
    listStudents: (params = {}) =>
      request(`/api/superadmin/students?${new URLSearchParams(params)}`),
    studentDetail: (id) => request(`/api/superadmin/students/${id}`),
    createStudent: (payload) =>
      request("/api/superadmin/students", { method: "POST", body: JSON.stringify(payload) }),
    deactivateStudent: (id) =>
      request(`/api/superadmin/students/${id}/deactivate`, { method: "POST" }),
    listAdmins: () => request("/api/superadmin/admins"),
    createAdmin: (payload) =>
      request("/api/superadmin/admins", { method: "POST", body: JSON.stringify(payload) }),
    listCourses: () => request("/api/superadmin/courses"),
    createAnnouncement: (payload) =>
      request("/api/superadmin/announcements", { method: "POST", body: JSON.stringify(payload) }),
  },

  courseAdmin: {
    dashboard: () => request("/api/course-admin/dashboard"),
    listStudents: () => request("/api/course-admin/students"),
    studentDetail: (id) => request(`/api/course-admin/students/${id}`),
    createAnnouncement: (payload) =>
      request("/api/course-admin/announcements", { method: "POST", body: JSON.stringify(payload) }),
  },

  student: {
    dashboard: () => request("/api/student/dashboard"),
    profile: () => request("/api/student/profile"),
    attendance: () => request("/api/student/attendance"),
    grades: () => request("/api/student/grades"),
    assignments: () => request("/api/student/assignments"),
  },
};
