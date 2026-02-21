import { useEffect, useState, useCallback } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { api } from "../../client";
import NewChatModel from "./NewChatModel";
import ParticipantsModel from "./ParticipantsModel";

export default function MessagesPanel() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState({});
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  // Single source of truth for current username.
  const myUsername = api.currentUsername();

  function normalizeChat(c) {
    return {
      id: c.id,
      name: c.name || "(Unnamed chat)",
      lastMessage: c.last_message_content || "",
      time: c.last_message_at
        ? new Date(c.last_message_at).toLocaleString()
        : "",
      avatarUrl: c.group_photo_url || null,
      ...c,
    };
  }

  const normalizeMessage = useCallback(
    (m) => {
      return {
        id: m.id,
        sender: m.sender_name || m.sender_username || "Unknown",
        text: m.content ?? "",
        isOwnMessage: !!myUsername && m.sender_username === myUsername,
        ...m,
      };
    },
    [myUsername],
  );

  async function handleSelectChat(chat) {
    setSelectedChat(chat);

    try {
      const fresh = await api.getChat(chat.id);
      setSelectedChat((prev) => (prev ? { ...prev, ...fresh } : prev));
    } catch (e) {
      setError(e?.message || "Failed to get chat details");
    }
  }

  async function openChatInfo() {
    if (!selectedChat?.id) return;

    try {
      setError(null);
      setIsLoadingParticipants(true);
      setIsInfoOpen(true);

      const data = await api.listChatParticipants(selectedChat.id);
      const list = Array.isArray(data) ? data : data?.participants || [];

      setParticipants(list);
    } catch (e) {
      setError(e?.message || "Failed to load participants");
    } finally {
      setIsLoadingParticipants(false);
    }
  }

  async function refreshChats(selectChatId = null) {
    if (!myUsername) return;

    const data = await api.listChats();
    const listRaw = Array.isArray(data) ? data : data?.chats || [];
    const list = listRaw.map(normalizeChat);

    setChats(list);

    if (selectChatId) {
      setSelectedChat(
        list.find((c) => String(c.id) === String(selectChatId)) ||
          list[0] ||
          null,
      );
    } else {
      setSelectedChat((prev) => {
        if (!prev) return list[0] || null;
        return (
          list.find((c) => String(c.id) === String(prev.id)) || list[0] || null
        );
      });
    }
  }

  const refreshMessages = useCallback(
    async (chatId, options = {}) => {
      if (!chatId) return;

      const { silent = false } = options;

      try {
        if (!silent) setError(null);
        if (!silent) setIsLoadingMessages(true);

        const data = await api.listMessages(chatId);
        const raw = Array.isArray(data) ? data : data?.messages || [];
        const msgs = raw.map(normalizeMessage);

        setChatMessages((prev) => ({ ...prev, [chatId]: msgs }));
      } catch (e) {
        if (!silent) setError(e?.message || "Failed to load messages");
      } finally {
        if (!silent) setIsLoadingMessages(false);
      }
    },
    [normalizeMessage],
  );

  // loading chats
  useEffect(() => {
    let isMounted = true;

    async function loadChats() {
      try {
        setError(null);
        setIsLoadingChats(true);

        if (!myUsername) {
          throw new Error(
            "You are not logged in (missing user in localStorage).",
          );
        }

        const data = await api.listChats();
        const listRaw = Array.isArray(data) ? data : data?.chats || [];
        const list = listRaw.map(normalizeChat);

        if (!isMounted) return;

        setChats(list);
        setSelectedChat(list[0] || null);
      } catch (e) {
        if (!isMounted) return;
        setError(e?.message || "Failed to load chats");
        setChats([]);
        setSelectedChat(null);
      } finally {
        if (isMounted) setIsLoadingChats(false);
      }
    }

    loadChats();
    return () => {
      isMounted = false;
    };
  }, [myUsername]);

  // hydrates participants list into chats that don't have them
  useEffect(() => {
    let cancelled = false;

    async function hydrateParticipants() {
      if (!chats.length) return;

      const missing = chats.filter((c) => !Array.isArray(c.participants));
      if (!missing.length) return;

      try {
        const results = await Promise.allSettled(
          missing.map(async (chat) => {
            const data = await api.listChatParticipants(chat.id);
            const usernames = (Array.isArray(data) ? data : []).map(
              (p) => p.username,
            );
            return { chatId: chat.id, participants: usernames };
          }),
        );

        if (cancelled) return;

        setChats((prev) =>
          prev.map((chat) => {
            const found = results.find((r) => r.chatId === chat.id);
            return found ? { ...chat, participants: found.participants } : chat;
          }),
        );
      } catch (e) {
        setError(e?.message || "Failed to load chat participants");
      }
    }

    hydrateParticipants();
    return () => {
      cancelled = true;
    };
  }, [chats]);

  // loads messages whenever selectedChat changes
  useEffect(() => {
    let isMounted = true;

    async function loadMessages(chatId) {
      if (!isMounted) return;
      await refreshMessages(chatId);
    }

    if (selectedChat?.id) loadMessages(selectedChat.id);

    return () => {
      isMounted = false;
    };
  }, [selectedChat?.id, refreshMessages]);

  useEffect(() => {
    if (!myUsername) return;

    // Poll to keep chats and active messages in sync.
    const timer = setInterval(() => {
      refreshChats();
      if (selectedChat?.id) {
        refreshMessages(selectedChat.id, { silent: true });
      }
    }, 60_000);

    return () => {
      clearInterval(timer);
    };
  }, [myUsername, refreshChats, refreshMessages, selectedChat?.id]);

  async function handleSendMessage(chatId, messageText) {
    if (!myUsername) {
      setError("You are not logged in (missing username).");
      return;
    }

    const optimistic = {
      id: `temp-${Date.now()}`,
      sender: "You",
      text: messageText,
      isOwnMessage: true,
    };

    setChatMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), optimistic],
    }));

    try {
      setError(null);

      const created = await api.sendMessage(chatId, {
        sender_username: myUsername,
        content: messageText,
      });

      const createdMsg = normalizeMessage({
        ...created,
        sender_username: myUsername,
        sender_name: myUsername,
      });

      setChatMessages((prev) => {
        const existing = prev[chatId] || [];
        const withoutTemp = existing.filter((m) => m.id !== optimistic.id);
        return { ...prev, [chatId]: [...withoutTemp, createdMsg] };
      });

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                lastMessage: messageText,
                time: new Date().toLocaleString(),
              }
            : c,
        ),
      );
    } catch (e) {
      setError(e?.message || "Failed to send message");
      setChatMessages((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || []).filter((m) => m.id !== optimistic.id),
      }));
    }
  }

  async function handleCreateChat(payload) {
    try {
      setError(null);

      if (!myUsername) {
        throw new Error("You’re not logged in (missing username).");
      }

      const created = await api.createChat(payload);
      await refreshChats(created?.id);

      if (created?.id) {
        setChatMessages((prev) => ({
          ...prev,
          [created.id]: prev[created.id] || [],
        }));
      }
    } catch (e) {
      setError(e?.message || "Failed to create chat");
    }
  }

  if (error) {
    return <div className="p-4 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="flex h-full border rounded-xl overflow-hidden bg-white">
      <ChatList
        chats={chats}
        selectedChat={selectedChat}
        setSelectedChat={handleSelectChat}
        onNewChat={() => setIsNewChatOpen(true)}
      />

      <div className="flex-1 relative">
        {isLoadingChats && (
          <div className="p-6 text-sm text-gray-500">Loading chats...</div>
        )}

        {!isLoadingChats && !selectedChat && (
          <div className="p-6 text-sm text-gray-500">No chats yet.</div>
        )}

        {!isLoadingChats && selectedChat && (
          <ChatWindow
            chat={selectedChat}
            messages={chatMessages[selectedChat.id] || []}
            onSendMessage={handleSendMessage}
            onOpenInfo={openChatInfo}
          />
        )}

        {isLoadingMessages && selectedChat && (
          <div className="absolute bottom-20 right-6 text-xs text-gray-400">
            Loading messages...
          </div>
        )}
      </div>

      <NewChatModel
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onCreate={handleCreateChat}
        api={api}
        myUsername={myUsername}
      />

      <ParticipantsModel
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title={isLoadingParticipants ? "Loading..." : "Participants"}
        participants={participants}
      />
    </div>
  );
}
