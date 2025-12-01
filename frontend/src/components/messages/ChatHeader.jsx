export default function ChatHeader({ chat }) {
  return (
    <div className="px-6 py-4 border-b bg-white flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-full ${chat.avatarColor} flex items-center justify-center text-white`}
      >
        {chat.name[0]}
      </div>
      <h2 className="font-semibold text-lg text-gray-700">{chat.name}</h2>
    </div>
  );
}
