import { useState } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { api } from '../../client';

export default function MessagesPanel() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    // storing messages per chatId loaded from API
    const [chatMessages, setChatMessages] = useState({});
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [error, setError] = useState(null);

    // loading chats 
    useEffect(() => {
      let isMounted = true;

      async function loadChats() {
        try {
          setIsLoadingChats(true);
          const data = await api.listChats();
          const list = Array.isArray(data) ? data : (data?.chats || []);

          if (!isMounted) return;

          setChats(list);
          setSelectedChat(list[0] || null);
        } 
        
        catch (e) {
          if (!isMounted) return;
          setError(e.message || 'Failed to load chats');
        } 
        
        finally {
          if (!isMounted) return;
          setIsLoadingChats(false);
        }
      }

    loadChats();
    return () => {
      isMounted = false;
    };
  }, []);

  // loads messages whenever selectedChat changes
  useEffect(() => {
    let isMounted = true;
    async function loadMessages(chatId) {
      try {
        setIsLoadingMessages(true);
        const data = await api.listMessages(chatId);
        const msgs = Array.isArray(data) ? data : (data?.messages || []);
        
        if (!isMounted) return;

        setChatMessages(prev => ({ ...prev, [chatId]: msgs }));
      } 
      
      catch (e) {
        if (!isMounted) return;
        setError(e.message || 'Failed to load messages');
      } 
      
      finally {
        if (!isMounted) return;
        setIsLoadingMessages(false);
      }
    }

    if (selectedChat?.id) loadMessages(selectedChat.id);
    return () => {
      isMounted = false;
    };
  }, [selectedChat?.id]);

  async function handleSendMessage(chatId, messageText) {
      try {
        const optimistic = {
          id: `temp-${Date.now()}`,
          sender: 'You',
          text: messageText,
          isOwnMessage: true,
        };

        setChatMessages(prev => ({
          ...prev,
          [chatId]: [ ...(prev[chatId] || []), optimistic ],
        }));

        const created = await api.sendMessage(chatId, { text: messageText });

        if (created) {
          setChatMessages(prev => {
            const existing = prev[chatId] || [];
            const withoutTemp = existing.filter(m => m.id !== optimistic.id);
            const createdMsg = created.message || created;
            return { ...prev, [chatId]: [...withoutTemp, createdMsg] };
          });
        }
    }
    
    catch (e) {
        setError(e.message || 'Failed to send message');
        setChatMessages(prev => ({
          ...prev,
          [chatId]: (prev[chatId] || []).filter(m => !String(m.id).startsWith('temp-')),
        }));
      }
  }

  if (error) {
      return (
        <div className="p-4 text-sm text-red-600">
          {error}
        </div>
      );
    }

  return (
    <div className="flex h-full border rounded-xl overflow-hidden bg-white">
      <ChatList
        chats={chats}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />

      <div className="flex-1">
        {isLoadingChats && (
          <div className="p-6 text-sm text-gray-500">Loading chats...</div>
        )}

        {!isLoadingChats && !selectedChat && (
          <div className="p-6 text-sm text-gray-500">No chats yet.</div>
        )}

        {!isLoadingChats && selectedChat && (
          <ChatWindow
            chat={selectedChat}
            messages={chatMessages[selectedChat.id] || []}
            onSendMessage={handleSendMessage}
          />
        )}

        {isLoadingMessages && selectedChat && (
          <div className="absolute bottom-20 right-6 text-xs text-gray-400">
            Loading messages...
          </div>
        )}
      </div>
    </div>
  );
}
