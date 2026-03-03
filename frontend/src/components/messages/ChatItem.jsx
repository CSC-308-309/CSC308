export default function ChatItem({ chat, isSelected, onClick, onDelete }) {
  const avatarUrl =
    chat.avatarUrl || chat.avatar || chat.profilePicture || chat.avatarColor;

  const hasImage =
    typeof avatarUrl === "string" &&
    (avatarUrl.startsWith("http") ||
      avatarUrl.startsWith("/") ||
      avatarUrl.startsWith("data:"));

  const title = chat.displayName || chat.name || "Chat";
  const initial = title?.[0]?.toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-3 cursor-pointer
        ${isSelected ? "bg-gray-100" : "hover:bg-gray-50"}`}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
        {hasImage ? (
          <img
            src={avatarUrl}
            alt={`${title} avatar`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-600 font-semibold">{initial}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-700 truncate">
          {title}
          {chat.displayHandle && (
            <span className="ml-2 text-xs font-normal text-gray-500">
              {chat.displayHandle}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 truncate">{chat.lastMessage}</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-xs text-gray-400 whitespace-nowrap">{chat.time}</div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
          title="Delete chat"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
