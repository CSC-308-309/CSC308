export default function ChatItem({ chat, isSelected, onClick }) {
  // supports avatar transition
  const avatarUrl =
    chat.avatarUrl || chat.avatar || chat.profilePicture || chat.avatarColor;
  const hasImage =
    typeof avatarUrl === "string" &&
    (avatarUrl.startsWith("http") ||
      avatarUrl.startsWith("/") ||
      avatarUrl.startsWith("data:"));

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer 
        ${isSelected ? "bg-gray-100" : "hover:bg-gray-50"}`}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
        {hasImage ? (
          <img
            src={avatarUrl}
            alt={`${chat.name} avatar`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-600 font-semibold">{chat.name?.[0]}</span>
        )}
      </div>

      <div className="flex-1">
        <div className="font-semibold text-gray-700">{chat.name}</div>
        <div className="text-sm text-gray-500">{chat.lastMessage}</div>
      </div>

      <div className="text-xs text-gray-400">{chat.time}</div>
    </div>
  );
}
