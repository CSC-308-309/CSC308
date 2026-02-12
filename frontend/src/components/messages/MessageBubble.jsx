export default function MessageBubble({ message }) {
  const isOwn = message.isOwnMessage;

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-xs px-4 py-2 rounded-xl
          ${
            isOwn
              ? "bg-melodious-purple text-white rounded-br-none"
              : "bg-gray-200 text-gray-800 rounded-bl-none"
          }
        `}
      >
        {!isOwn && (
          <div className="text-sm font-semibold text-gray-600 mb-1">
            {message.sender}
          </div>
        )}

        <div>{message.text}</div>
      </div>
    </div>
  );
}
