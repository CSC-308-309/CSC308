import pool from '../db/index.js';

const MessagesModel = {

    async listChats(queryParams) {
        // Returns array of chat summaries with latest message info
        console.log("~~~~~~~~~~~~listChats called~~~~~~~~~~~~~");
        return this.mockChats;
    },

    async createChat(chatData) {
        // Expected input: { participants: [username1, username2], ... }
        // Expected output: { id, name, participants, createdAt, ... }
        console.log("~~~~~~~~~~~~createChat called~~~~~~~~~~~~~");
        const newChat = {
            id: `chat-${Date.now()}`,
            name: chatData.name || chatData.participants?.[1] || 'New Chat',
            lastMessage: '',
            time: 'now',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatData.participants?.[1]}`,
            participants: chatData.participants || [],
            createdAt: new Date().toISOString(),
        };
        this.mockChats.push(newChat);
        this.mockMessages[newChat.id] = [];
        return newChat;
    },

    async getChat(chatId) {
        console.log("~~~~~~~~~~~~getChat called~~~~~~~~~~~~~");
        // Expected output: single chat object with full details
        return this.mockChats.find(c => c.id === chatId) || null;
    },

    async updateChat(chatId, updateData) {
        console.log("~~~~~~~~~~~~updateChat called~~~~~~~~~~~~~");
        // Expected input: { name?, participants? }
        // Expected output: updated chat object
        const chat = this.mockChats.find(c => c.id === chatId);
        if (!chat) return null;
        Object.assign(chat, updateData);
        return chat;
    },

    async deleteChat(chatId) {
        console.log("~~~~~~~~~~~~deleteChat called~~~~~~~~~~~~~");
        // Expected output: true if successful, false otherwise
        const index = this.mockChats.findIndex(c => c.id === chatId);
        if (index === -1) return false;
        this.mockChats.splice(index, 1);
        delete this.mockMessages[chatId];
        return true;
    },

    async listChatParticipants(chatId) {
        console.log("~~~~~~~~~~~~listChatParticipants called~~~~~~~~~~~~~");
        // Expected output: array of participant objects/usernames
        const chat = this.mockChats.find(c => c.id === chatId);
        return chat?.participants || [];
    },

    async addChatParticipants(chatId, participantsData) {
        console.log("~~~~~~~~~~~~addChatParticipants called~~~~~~~~~~~~~");
        // Expected input: { participants: [username1, username2] } or { usernames: [...] }
        const chat = this.mockChats.find(c => c.id === chatId);
        if (!chat) return null;
        const newParticipants = participantsData.participants || participantsData.usernames || [];
        chat.participants = [...new Set([...chat.participants, ...newParticipants])];
        return { success: true, participants: chat.participants };
    },

    async removeChatParticipant(chatId, username) {
        console.log("~~~~~~~~~~~~removeChatParticipant called~~~~~~~~~~~~~");
        // Expected output: true if successful, false otherwise
        const chat = this.mockChats.find(c => c.id === chatId);
        if (!chat) return false;
        const index = chat.participants.indexOf(username);
        if (index === -1) return false;
        chat.participants.splice(index, 1);
        return true;
    },

    async listMessages(chatId, queryParams) {
        console.log("~~~~~~~~~~~~listMessages called~~~~~~~~~~~~~");
        // Expected output: array of messages or { messages: array }
        // Supports pagination: limit, offset
        const messages = this.mockMessages[chatId] || [];
        const limit = queryParams?.limit ? parseInt(queryParams.limit) : 50;
        const offset = queryParams?.offset ? parseInt(queryParams.offset) : 0;
        return messages.slice(offset, offset + limit);
    },

    async getMessage(chatId, messageId) {
        console.log("~~~~~~~~~~~~getMessage called~~~~~~~~~~~~~");
        // Expected output: single message object or null
        const messages = this.mockMessages[chatId] || [];
        return messages.find(m => m.id === messageId) || null;
    },

    async sendMessage(chatId, messageData) {
        console.log("~~~~~~~~~~~~sendMessage called~~~~~~~~~~~~~");
        // Expected input: { text: string, sender?: string }
        // Expected output: { message: {...} } or { id, text, sender, ... }
        const messages = this.mockMessages[chatId] || [];
        const newMessage = {
            id: `msg-${Date.now()}`,
            chatId,
            sender: messageData.sender || 'You',
            text: messageData.text,
            isOwnMessage: true,
            createdAt: new Date().toISOString(),
        };
        messages.push(newMessage);
        // Update chat's lastMessage
        const chat = this.mockChats.find(c => c.id === chatId);
        if (chat) {
            chat.lastMessage = messageData.text;
            chat.time = 'now';
        }
    },

    async updateMessage(chatId, messageId, updateData) {
        console.log("~~~~~~~~~~~~updateMessage called~~~~~~~~~~~~~");
        // Expected input: { text: string } or other editable fields
        // Expected output: updated message or null
        const messages = this.mockMessages[chatId] || [];
        const message = messages.find(m => m.id === messageId);
        if (!message) return null;
        Object.assign(message, updateData);
        return message;
    },
    
    async deleteMessage(chatId, messageId) {
        console.log("~~~~~~~~~~~~deleteMessage called~~~~~~~~~~~~~");
        // Expected output: true if successful, false otherwise
        const messages = this.mockMessages[chatId] || [];
        const index = messages.findIndex(m => m.id === messageId);
        if (index === -1) return false;
        messages.splice(index, 1);
        return true;
    },

    async markChatRead(chatId, readData) {
        console.log("~~~~~~~~~~~~markChatRead called~~~~~~~~~~~~~");
        // Expected input: { username?: string, readUntilId?: string }
        // Expected output: { success: true, readUntilId: ... } or similar
        return { success: true, chatId, readUntilId: readData?.readUntilId };
    },

    async setTyping(chatId, typingData) {
        console.log("~~~~~~~~~~~~setTyping called~~~~~~~~~~~~~");
        // Expected input: { username: string, isTyping: boolean }
        // Expected output: { success: true } or typing indicator data
        return { success: true, chatId, ...typingData };
    },
};

export { MessagesModel };