// Creates a simple api client for interacting with backend
// Simple wrapper

// For now, just localhost URL
// TODO: allow injection of env var
const BASE_URL = "melodious-aec4gpergpb0bsd6.westus3-01.azurewebsites.net";

// async function request(path, options = {}) {
//   const res = await fetch(`${BASE_URL}${path}`, {
//     headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
//     ...options,
//   });
//   const body = await res.json().catch(() => null);
//   if (!res.ok) {
//     const message = body && body.error ? body.error : res.statusText;
//     const error = new Error(message || 'Request failed');
//     error.status = res.status;
//     error.body = body;
//     throw error;
//   }
//   return body;
// }

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const body = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => "");

  if (!res.ok) {
    const message =
      body && typeof body === "object" && body.details
        ? `${body.error}: ${body.details}`
        : body && typeof body === "object" && body.error
          ? body.error
          : typeof body === "string" && body.trim()
            ? body
            : res.statusText;

    const error = new Error(message || "Request failed");
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return body;
}

const requestTypes = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, data) =>
    request(path, { method: "POST", body: JSON.stringify(data) }),
  put: (path, data) =>
    request(path, { method: "PUT", body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export const api = {
  // User/Profile routes
  listUsers: () => requestTypes.get("/users"),
  getByUsername: (username) =>
    requestTypes.get(`/users/${encodeURIComponent(username)}`),
  update: (username, data) =>
    requestTypes.put(`/users/${encodeURIComponent(username)}`, data),
  deleteUser: (username) =>
    requestTypes.delete(`/users/${encodeURIComponent(username)}`),
  signup: (profile) => requestTypes.post("/auth/signup", profile),
  login: (credentials) => requestTypes.post("/auth/login", credentials),

  // Interaction routes
  like: (username, targetUsername) =>
    requestTypes.post(`/users/${encodeURIComponent(username)}/like`, {
      targetUsername,
    }),
  dislike: (username, targetUsername) =>
    requestTypes.post(`/users/${encodeURIComponent(username)}/dislike`, {
      targetUsername,
    }),
  block: (username, targetUsername) =>
    requestTypes.post(`/users/${encodeURIComponent(username)}/block`, {
      targetUsername,
    }),

  //Photo Storage routes
  presignUpload: (uploadParams) =>
    requestTypes.put("/media/presign", uploadParams),
};

export { BASE_URL };
