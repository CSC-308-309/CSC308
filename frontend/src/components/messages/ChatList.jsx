import ChatItem from './ChatItem';

export default function ChatList({ chats, selectedChat, setSelectedChat }) {
  return (
    <div className="w-80 border-r bg-white flex flex-col">
      <div className="px-4 py-3">
        <input
          className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm"
          placeholder="Search"
        />
      </div>

      <div className="overflow-y-auto">
        {chats.map(chat => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isSelected={chat.id === selectedChat?.id}
            onClick={() => setSelectedChat(chat)}
          />
        ))}
      </div>
    </div>
  );
}
