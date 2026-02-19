const API_URL = import.meta.env.VITE_API_URL || "";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || "Request failed");
  return data;
}

export const api = {
  auth: {
    register: (email, password) =>
      request("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
    login: (email, password) =>
      request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  },
  bills: {
    list: (params = {}) => {
      const sp = new URLSearchParams();
      if (params.month) sp.set("month", params.month);
      if (params.status) sp.set("status", params.status);
      const q = sp.toString();
      return request(`/api/bills${q ? `?${q}` : ""}`);
    },
    get: (id) => request(`/api/bills/${id}`),
    create: (body) => request("/api/bills", { method: "POST", body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/bills/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id) => request(`/api/bills/${id}`, { method: "DELETE" }),
  },
};

export { getToken };
