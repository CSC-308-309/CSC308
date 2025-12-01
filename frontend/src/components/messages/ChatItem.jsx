export default function ChatItem({ chat, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer 
        ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
    >
      <div
        className={`w-10 h-10 rounded-full ${chat.avatarColor} flex items-center justify-center text-white font-semibold`}
      >
        {chat.name[0]}
      </div>

      <div className="flex-1">
        <div className="font-semibold text-gray-700">{chat.name}</div>
        <div className="text-sm text-gray-500">{chat.lastMessage}</div>
      </div>

      <div className="text-xs text-gray-400">{chat.time}</div>
    </div>
  );
}
