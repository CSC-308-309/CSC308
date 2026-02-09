import { useState } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

export default function MessagesPanel() {
  const chats = [
    {
      id: 1,
      name: "Talia",
      lastMessage: "you: yessss",
      time: "1m",
      avatarColor: "bg-purple-300",
    },
    {
      id: 2,
      name: "CMIYGL",
      lastMessage: "you: oh wow",
      time: "2h",
      avatarColor: "bg-indigo-400",
    },
    {
      id: 3,
      name: "Yanitsa",
      lastMessage: "Yanitsa: loveee",
      time: "4h",
      avatarColor: "bg-blue-300",
    },
  ];

  const [chatMessages, setChatMessages] = useState({
    1: [{ id: 1, sender: "Talia", text: "omg hiiii", time: "2:30 PM" }],
    2: [
      {
        id: 1,
        sender: "CMIYGL",
        text: "Loved your jam sesh video!",
        time: "10:37 AM",
      },
    ],
    3: [{ id: 1, sender: "Yanitsa", text: "how are you?", time: "3:10 PM" }],
  });

  const [selectedChat, setSelectedChat] = useState(chats[1]);

  function handleSendMessage(chatId, messageText) {
    setChatMessages((prev) => ({
      ...prev,
      [chatId]: [
        ...(prev[chatId] || []),
        {
          id: Date.now(),
          sender: "You",
          text: messageText,
          isOwnMessage: true,
        },
      ],
    }));
  }

  return (
    <div className="flex h-full border rounded-xl overflow-hidden bg-white">
      <ChatList
        chats={chats}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />

      <ChatWindow
        chat={selectedChat}
        messages={chatMessages[selectedChat.id] || []}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
