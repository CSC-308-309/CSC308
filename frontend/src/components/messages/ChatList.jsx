import { useMemo, useState } from "react";
import ChatItem from "./ChatItem";

export default function ChatList({
  chats,
  selectedChat,
  setSelectedChat,
  onNewChat, 
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chats;

    return chats.filter((c) => {
      const nameMatch = (c.name || "").toLowerCase().includes(q);

      const participantMatch = Array.isArray(c.participants)
        ? c.participants.some((u) => String(u).toLowerCase().includes(q))
        : false;

      return nameMatch || participantMatch;
    });
  }, [chats, search]);

  return (
    <div className="w-80 border-r bg-white flex flex-col">
      <div className="px-4 py-3 flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm"
          placeholder="Search by group name or username"
        />

        {onNewChat && (
          <button
            onClick={onNewChat}
            className="shrink-0 bg-melodious-purple text-white rounded-xl px-3 py-2 text-sm"
            title="New chat"
          >
            +
          </button>
        )}
      </div>

      <div className="overflow-y-auto">
        {filtered.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isSelected={chat.id === selectedChat?.id}
            onClick={() => setSelectedChat(chat)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="p-4 text-sm text-gray-500">
            No matches. Try a group name or a username.
          </div>
        )}
      </div>
    </div>
  );
}
