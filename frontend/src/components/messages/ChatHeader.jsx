export default function ChatHeader({ chat }) {
  
  // supports avatar transition
  const avatarUrl = chat.avatarUrl || chat.avatar || chat.profilePicture || chat.avatarColor;
  const hasImage = typeof avatarUrl === "string" && (avatarUrl.startsWith("http") || avatarUrl.startsWith("/") || avatarUrl.startsWith("data:"));

  return (
    <div className="px-6 py-4 border-b bg-white flex items-center gap-3">
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

      <h2 className="font-semibold text-lg text-gray-700">{chat.name}</h2>
    </div>
  );
}
