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

  // patch helper for partial updates (useful for message edits, chat settings, etc.)
  patch: (path, data) =>
    request(path, { method: "PATCH", body: JSON.stringify(data) }),
};

// small helper for adding query params to GET routes (specifically for discreet pagination)
function withQuery(path, params = {}) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return path;
  const qs = new URLSearchParams(
    entries.map(([k, v]) => [k, String(v)]),
  ).toString();
  return `${path}?${qs}`;
}

// Helper: get the logged-in username from localStorage (single source of truth).
export function getCurrentUsername() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.username || null;
  } catch {
    return null;
  }
}

// Helper: enforce presence of username when a route needs it.
function requireUsername(username) {
  if (!username) throw new Error("username is required");
  return username;
}

// Helper: resolve username, falling back to the current user.
function resolveUsername(username) {
  return username ?? requireUsername(getCurrentUsername());
}

export const api = {
  // Current user helper (centralized).
  currentUsername: () => getCurrentUsername(),

  // User/Profile routes
  listUsers: () => requestTypes.get("/users"),
  getByUsername: (username) =>
    requestTypes.get(`/users/${encodeURIComponent(resolveUsername(username))}`),
  update: (data, username) =>
    requestTypes.put(
      `/users/${encodeURIComponent(resolveUsername(username))}`,
      data,
    ),
  deleteUser: (username) =>
    requestTypes.delete(`/users/${encodeURIComponent(resolveUsername(username))}`),
  signup: (profile) => requestTypes.post("/auth/signup", profile),
  login: (credentials) => requestTypes.post("/auth/login", credentials),

  // Profile setup (server expects username in body)
  updateProfile: (profileData = {}) =>
    requestTypes.post("/profile", {
      ...profileData,
      username: resolveUsername(profileData.username),
    }),

  // Interaction routes
  like: (targetUsername, username) =>
    requestTypes.post(
      `/users/${encodeURIComponent(resolveUsername(username))}/like`,
      { targetUsername: requireUsername(targetUsername) },
    ),
  dislike: (targetUsername, username) =>
    requestTypes.post(
      `/users/${encodeURIComponent(resolveUsername(username))}/dislike`,
      { targetUsername: requireUsername(targetUsername) },
    ),
  block: (targetUsername, username) =>
    requestTypes.post(
      `/users/${encodeURIComponent(resolveUsername(username))}/block`,
      { targetUsername: requireUsername(targetUsername) },
    ),

  // Messaging routes
  listChats: (params = {}) => {
    const username = resolveUsername(params.username);
    return requestTypes.get(withQuery("/chats", { ...params, username }));
  },
  createChat: (data) => requestTypes.post("/chats", data),
  getChat: (chatId) => requestTypes.get(`/chats/${encodeURIComponent(chatId)}`),
  updateChat: (chatId, data) =>
    requestTypes.patch(`/chats/${encodeURIComponent(chatId)}`, data),
  deleteChat: (chatId) =>
    requestTypes.delete(`/chats/${encodeURIComponent(chatId)}`),
  listChatParticipants: (chatId) =>
    requestTypes.get(`/chats/${encodeURIComponent(chatId)}/participants`),
  addChatParticipants: (chatId, data) =>
    requestTypes.post(
      `/chats/${encodeURIComponent(chatId)}/participants`,
      data,
    ),
  removeChatParticipant: (chatId, username) =>
    requestTypes.delete(
      `/chats/${encodeURIComponent(chatId)}/participants/${encodeURIComponent(username)}`,
    ),
  listMessages: (chatId, params = {}) =>
    requestTypes.get(
      withQuery(`/chats/${encodeURIComponent(chatId)}/messages`, params),
    ),
  getMessage: (chatId, messageId) =>
    requestTypes.get(
      `/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`,
    ),
  sendMessage: (chatId, data) =>
    requestTypes.post(`/chats/${encodeURIComponent(chatId)}/messages`, data),
  updateMessage: (chatId, messageId, data) =>
    requestTypes.patch(
      `/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`,
      data,
    ),
  deleteMessage: (chatId, messageId) =>
    requestTypes.delete(
      `/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`,
    ),
  markChatRead: (chatId, data = {}) =>
    requestTypes.post(`/chats/${encodeURIComponent(chatId)}/read`, data),
  setTyping: (chatId, data) =>
    requestTypes.post(`/chats/${encodeURIComponent(chatId)}/typing`, data),

  // Notification routes
  // NOTE: these two are not valid routes, we don't want to list all notifs in the database
  // fix their usage in the frontend to use listNotifications with username input
  //listMyNotifications: (params = {}) => requestTypes.get(withQuery('/notifications/me', params)),
  //getMyUnreadNotificationsCount: () => requestTypes.get('/notifications/me/unread-count'),
  listNotifications: (params = {}, username) =>
    requestTypes.get(
      withQuery(
        `/notifications/${encodeURIComponent(resolveUsername(username))}`,
        params,
      ),
    ),
  getUnreadNotificationsCount: (username) =>
    requestTypes.get(
      `/notifications/${encodeURIComponent(resolveUsername(username))}/unreadCount`,
    ),
  getNotification: (notificationId) =>
    requestTypes.get(`/notifications/id/${encodeURIComponent(notificationId)}`),
  createNotification: (data) => requestTypes.post("/notifications", data),
  markNotificationRead: (notificationId) =>
    requestTypes.post(
      `/notifications/${encodeURIComponent(notificationId)}/read`,
      {},
    ),
  markNotificationUnread: (notificationId) =>
    requestTypes.post(
      `/notifications/${encodeURIComponent(notificationId)}/unread`,
      {},
    ),

  markAllNotificationsRead: (data = {}) =>
    requestTypes.post("/notifications/readAll", data),
  archiveNotification: (notificationId) =>
    requestTypes.post(
      `/notifications/${encodeURIComponent(notificationId)}/archive`,
      {},
    ),
  unarchiveNotification: (notificationId) =>
    requestTypes.post(
      `/notifications/${encodeURIComponent(notificationId)}/unarchive`,
      {},
    ),
  deleteNotification: (notificationId) =>
    requestTypes.delete(`/notifications/${encodeURIComponent(notificationId)}`),
  //getUnreadNotificationsCount: (params = {}) => requestTypes.get(withQuery('/notifications/unread-count', params)),
  getNotificationPreferences: (username) =>
    requestTypes.get(
      `/notifications/preferences/${encodeURIComponent(resolveUsername(username))}`,
    ),
  updateNotificationPreferences: (data, username) =>
    requestTypes.patch(
      `/notifications/preferences/${encodeURIComponent(resolveUsername(username))}`,
      data,
    ),

  // Event routes
  listEvents: () => requestTypes.get("/events"),

  //Photo Storage routes
  presignUpload: (uploadParams) =>
    requestTypes.put("/media/presign", uploadParams),
  presignView: (viewParams) =>
    requestTypes.put("/media/presign-view", viewParams),
  // Backward-compatible helper used by existing components.
  presignViewUrl: (fileUrl) =>
    requestTypes.put("/media/presign-view", { fileUrl }),
};

export { BASE_URL };
