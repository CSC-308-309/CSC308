// Creates a simple api client for interacting with backend
// Simple wrapper

// For now, just localhost URL
// TODO: allow injection of env var
const BASE_URL = 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body && body.error ? body.error : res.statusText;
    const error = new Error(message || 'Request failed');
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return body;
}

const requestTypes = {
    get: (path) => request(path, { method: 'GET' }),
    post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
    put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (path) => request(path, { method: 'DELETE' }),

    // patch helper for partial updates (useful for message edits, chat settings, etc.)
    patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
}

// small helper for adding query params to GET routes (specifically for discreet pagination)
function withQuery(path, params = {}) {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
    if (entries.length === 0) return path;
    const qs = new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
    return `${path}?${qs}`;
}

export const api = {
    // User/Profile routes
    listUsers: () => requestTypes.get('/users'),
    getByUsername: (username) => requestTypes.get(`/users/${encodeURIComponent(username)}`),
    update: (username, data) => requestTypes.put(`/users/${encodeURIComponent(username)}`, data),
    deleteUser: (username) => requestTypes.delete(`/users/${encodeURIComponent(username)}`),
    signup: (profile) => requestTypes.post('/auth/signup', profile),
    login: (credentials) => requestTypes.post('/auth/login', credentials),
    
    // Interaction routes
    like: (username, targetUsername) => requestTypes.post(`/users/${encodeURIComponent(username)}/like`, { targetUsername }),
    dislike: (username, targetUsername) => requestTypes.post(`/users/${encodeURIComponent(username)}/dislike`, { targetUsername }),
    block: (username, targetUsername) => requestTypes.post(`/users/${encodeURIComponent(username)}/block`, { targetUsername }),

<<<<<<< HEAD
    // Message routes
    listUserChats: (username) => requestTypes.get(`/messages/${encodeURIComponent(username)}/chats`),

    // Notification routes


    // Media routes
    

    // Event routes
    listEvents: () => requestTypes.get('/events'),

  }

=======
    // Messaging routes
    listChats: (params = {}) => requestTypes.get(withQuery('/chats', params)),
    createChat: (data) => requestTypes.post('/chats', data),
    getChat: (chatId) => requestTypes.get(`/chats/${encodeURIComponent(chatId)}`),
    updateChat: (chatId, data) => requestTypes.patch(`/chats/${encodeURIComponent(chatId)}`, data),
    deleteChat: (chatId) => requestTypes.delete(`/chats/${encodeURIComponent(chatId)}`),
    listChatParticipants: (chatId) => requestTypes.get(`/chats/${encodeURIComponent(chatId)}/participants`),
    addChatParticipants: (chatId, data) => requestTypes.post(`/chats/${encodeURIComponent(chatId)}/participants`, data),
    removeChatParticipant: (chatId, username) => requestTypes.delete(`/chats/${encodeURIComponent(chatId)}/participants/${encodeURIComponent(username)}`),
    listMessages: (chatId, params = {}) => requestTypes.get(withQuery(`/chats/${encodeURIComponent(chatId)}/messages`, params)),
    getMessage: (chatId, messageId) => requestTypes.get(`/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`),
    sendMessage: (chatId, data) => requestTypes.post(`/chats/${encodeURIComponent(chatId)}/messages`, data),
    updateMessage: (chatId, messageId, data) => requestTypes.patch(`/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`, data),
    deleteMessage: (chatId, messageId) => requestTypes.delete(`/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`),
    markChatRead: (chatId, data = {}) => requestTypes.post(`/chats/${encodeURIComponent(chatId)}/read`, data),
    setTyping: (chatId, data) => requestTypes.post(`/chats/${encodeURIComponent(chatId)}/typing`, data),
}
>>>>>>> messagingAPI

export { BASE_URL };