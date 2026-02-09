import { useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ chat, messages, onSendMessage, onOpenInfo }) {
  const [input, setInput] = useState("");

  function handleSend() {
    if (!input.trim()) return;
    onSendMessage(chat.id, input.trim());
    setInput("");
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <ChatHeader chat={chat} onInfo={onOpenInfo} />

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      <div className="p-4 border-t bg-white flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Message..."
          className="flex-1 bg-gray-100 px-4 py-2 rounded-xl"
        />
        <button onClick={handleSend} className="bg-melodious-purple text-white rounded-xl px-4 py-2">
          Send
        </button>
      </div>
    </div>
  );
}
