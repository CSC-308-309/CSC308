import { useEffect, useMemo, useState, useCallback } from "react";
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

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const myUsername = currentUser?.username;

  function normalizeChat(c) {
    return {
      ...c,
      id: c.id,
      name: c.name || "(Unnamed chat)",
      lastMessage: c.last_message_content || "",
      time: c.last_message_at ? new Date(c.last_message_at).toLocaleString() : "",
      avatarUrl: c.avatarUrl ?? c.group_photo_url ?? null,
      displayName: c.displayName ?? c.name ?? "(Unnamed chat)",
      displayHandle: c.displayHandle ?? null,
    };
  }

  const normalizeMessage = useCallback(
    (m) => {
      return {
        id: m.id,
        sender: m.sender_name || m.sender_username || "Unknown",
        senderUsername: m.sender_username || null,
        senderAvatar: m.sender_avatar || null,
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

    const data = await api.listChats({ username: myUsername });
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

        const data = await api.listChats({ username: myUsername });
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
        const settled = await Promise.allSettled(
          missing.map(async (chat) => {
            const data = await api.listChatParticipants(chat.id);
            let participantObjects = Array.isArray(data) ? data : [];

            participantObjects = await Promise.all(
              participantObjects.map(async (p) => {
                if (!p.avatar) return p;

                try {
                  const resp = await api.presignView({
                    fileUrl: p.avatar,  
                    expiresIn: 3600,
                  });

                  return { ...p, avatar: resp?.viewUrl || null };
                } catch {
                  return { ...p, avatar: null };
                }
              })
            );

            const usernames = participantObjects.map((p) => p.username).filter(Boolean);
            return { chatId: chat.id, participants: usernames, participantObjects };
          })
        );

        if (cancelled) return;

        const results = settled
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value);

        setChats((prev) =>
          prev.map((chat) => {
            const found = results.find((r) => String(r.chatId) === String(chat.id));
            if (!found) return chat;

            const isGroup = !!chat.is_group;

            const other =
              found.participantObjects.find((p) => p.username && p.username !== myUsername) ||
              found.participantObjects[0];

            const groupFallbackAvatar =
              chat.group_photo_url || found.participantObjects.find((p) => p.avatar)?.avatar || null;

if (chat.name === "grammys") {
  console.log("GRAMMYS participantObjects:", found.participantObjects);
  console.log("GRAMMYS groupFallbackAvatar:", groupFallbackAvatar);
}

            return {
              ...chat,
              participants: found.participants,
              participantObjects: found.participantObjects,
              displayName: isGroup
                ? (chat.name || "(Unnamed group)")
                : (other?.name || other?.username || chat.name),
              displayHandle: isGroup ? null : (other?.username ? `@${other.username}` : null),
              avatarUrl: isGroup
                ? (chat.group_photo_url || groupFallbackAvatar)
                : (other?.avatar || null),
              };
          })
        );
      } catch (e) {
        setError(e?.message || "Failed to load chat participants");
      }
    }

    hydrateParticipants();
    return () => {
      cancelled = true;
    };
  }, [chats, myUsername]);

  useEffect(() => {
  if (chats.length) console.log("Sample chat after hydrate:", chats[0]);
}, [chats]);


  // loads messages whenever selectedChat changes
  useEffect(() => {
    let isMounted = true;

    async function loadMessages(chatId) {
      try {
        setError(null);
        setIsLoadingMessages(true);

        const data = await api.listMessages(chatId);
        const raw = Array.isArray(data) ? data : data?.messages || [];
        const msgs = raw.map(normalizeMessage);

        if (!isMounted) return;

        setChatMessages((prev) => ({ ...prev, [chatId]: msgs }));
      } catch (e) {
        if (!isMounted) return;
        setError(e?.message || "Failed to load messages");
      } finally {
        if (isMounted) setIsLoadingMessages(false);
      }
    }

    if (selectedChat?.id) loadMessages(selectedChat.id);

    return () => {
      isMounted = false;
    };
  }, [selectedChat?.id, normalizeMessage]);

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
        sender_name: currentUser?.username,
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
