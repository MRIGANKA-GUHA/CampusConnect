import api from "./api";

// ─── Friend Requests ─────────────────────────────────────────────────────────
export const sendFriendRequest = (toUid) =>
  api.post("/chat/friend-request", { toUid });

export const respondToFriendRequest = (friendshipId, action) =>
  api.patch(`/chat/friend-request/${friendshipId}`, { action });

export const getFriendRequests = () =>
  api.get("/chat/friend-requests");

// ─── Friends ─────────────────────────────────────────────────────────────────
export const getFriends = () =>
  api.get("/chat/friends");

export const removeFriend = (friendUid) =>
  api.delete(`/chat/friends/${friendUid}`);

// ─── Messages ─────────────────────────────────────────────────────────────────
export const getConversationHistory = (friendUid, limit = 50) =>
  api.get(`/chat/messages/${friendUid}`, { params: { limit } });

export const postMessage = (toUid, text) =>
  api.post("/chat/messages", { toUid, text });

export const patchMarkRead = (convId, friendUid) =>
  api.patch("/chat/mark-read", { convId, friendUid });

// ─── Student Search ───────────────────────────────────────────────────────────
export const searchStudents = (q) =>
  api.get("/chat/search-students", { params: { q } });
