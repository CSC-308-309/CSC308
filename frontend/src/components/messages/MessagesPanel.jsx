import { useState } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

export default function MessagesPanel() {
  // Placeholder for actual user retrieval
  currentUser = 'alice';

  const userProfile = await api.getByUsername(currentUser); 
  // get userProfile display name, profile pic, etc.

  
  const [chats, setChats] = useState({});

  useEffect(() => {
    // Fetch current user's chats
    const fetchUserChats = async () => {
      const userChats = await api.listUserChats(currentUser);
      setChats(userChats);
    };
    fetchUserChats();
  }, [currentUser]);

  //const [selectedChat, setSelectedChat] = useState(chats[1]);
  // TODO: figure out how this is used and how to properly set it

  const [chatMessages, setChatMessages] = useState({});

  useEffect(() => {
    // Fetch initial chat messages for each chat
    const fetchChatMessages = async () => {
      const messagesData = await api.listUserChats(currentUser);
      setChatMessages(messagesData);
    };
    fetchChatMessages();
  }, [currentUser]);

  

  function handleSendMessage(chatId, messageText) {
    setChatMessages(prev => ({
      ...prev,
      [chatId]: [
        ...(prev[chatId] || []),
        {
          id: Date.now(),
          sender: 'You',
          text: messageText,
          isOwnMessage: true,
        }
      ]
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
