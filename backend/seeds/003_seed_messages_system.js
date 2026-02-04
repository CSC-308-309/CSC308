import { pool } from '../db/index.js';

const sampleChats = [
  {
    name: 'Taylor & Ed - Collab Talk',
    is_group: false,
    created_by: 'taylor_swift',
    participants: ['taylor_swift', 'ed_sheeran'],
    messages: [
      { sender: 'taylor_swift', content: 'Hey Ed! Want to collab on a new song?' },
      { sender: 'ed_sheeran', content: 'Absolutely! What genre are you thinking?' },
      { sender: 'taylor_swift', content: 'Maybe something acoustic-pop, like our style' },
      { sender: 'ed_sheeran', content: 'Perfect! I have some guitar ideas already' }
    ]
  },
  {
    name: 'Music Industry Chat',
    is_group: true,
    created_by: 'ariana_grande',
    participants: ['ariana_grande', 'bruno_mars', 'the_weeknd', 'billie_eilish'],
    messages: [
      { sender: 'ariana_grande', content: 'Hey everyone! Anyone up for a virtual jam session?' },
      { sender: 'bruno_mars', content: 'Count me in! I have some new funk ideas' },
      { sender: 'the_weeknd', content: 'Sounds cool, I can bring some R&B vibes' },
      { sender: 'billie_eilish', content: "I'm down! Need to practice my vocals anyway" },
      { sender: 'ariana_grande', content: 'Awesome! Let\'s schedule for next week' }
    ]
  },
  {
    name: 'John & Adele - Blues Talk',
    is_group: false,
    created_by: 'john_mayer',
    participants: ['john_mayer', 'adele_official'],
    messages: [
      { sender: 'john_mayer', content: 'Adele, your voice is incredible for blues' },
      { sender: 'adele_official', content: 'Thanks John! Your guitar skills are legendary' },
      { sender: 'john_mayer', content: 'We should do a blues cover together sometime' },
      { sender: 'adele_official', content: 'I would love that! Let me know when you\'re free' }
    ]
  }
];

async function seedMessagesSystem() {
  try {
    console.log('Seeding messages system...');

    // Clear existing tables
    await pool.query('TRUNCATE TABLE messages_read RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE TABLE messages RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE TABLE chat_members RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE TABLE chats RESTART IDENTITY CASCADE');
    console.log('  Cleared existing message tables');

    for (const chatData of sampleChats) {
      // Get creator ID
      const creatorQuery = 'SELECT id FROM users WHERE username = $1';
      const creatorResult = await pool.query(creatorQuery, [chatData.created_by]);
      
      if (creatorResult.rows.length === 0) {
        console.log(`Skipped chat: ${chatData.name} (creator not found)`);
        continue;
      }

      const creatorId = creatorResult.rows[0].id;

      // Create chat
      const chatQuery = `
        INSERT INTO chats (name, is_group, created_by)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const chatResult = await pool.query(chatQuery, [chatData.name, chatData.is_group, creatorId]);
      const chatId = chatResult.rows[0].id;

      console.log(`Created chat: ${chatData.name} (ID: ${chatId})`);

      // Add participants
      const participantIds = [];
      for (const username of chatData.participants) {
        const userQuery = 'SELECT id FROM users WHERE username = $1';
        const userResult = await pool.query(userQuery, [username]);
        
        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          participantIds.push(userId);

          const memberQuery = `
            INSERT INTO chat_members (chat_id, user_id, role)
            VALUES ($1, $2, 'member')
            RETURNING id
          `;
          await pool.query(memberQuery, [chatId, userId]);
          console.log(`Added ${username} to chat`);
        }
      }

      // Add messages
      for (let i = 0; i < chatData.messages.length; i++) {
        const message = chatData.messages[i];
        
        const senderQuery = 'SELECT id FROM users WHERE username = $1';
        const senderResult = await pool.query(senderQuery, [message.sender]);
        
        if (senderResult.rows.length === 0) continue;

        const senderId = senderResult.rows[0].id;
        const createdTime = new Date(Date.now() - (chatData.messages.length - i) * 60000); // 1 minute apart

        const messageQuery = `
          INSERT INTO messages (chat_id, sent_by, content, created_at)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `;
        const messageResult = await pool.query(messageQuery, [chatId, senderId, message.content, createdTime]);
        const messageId = messageResult.rows[0].id;

        console.log(`Added message from ${message.sender}`);

        // Mark some messages as read (simulate conversation flow)
        if (i < chatData.messages.length - 1) { // Don't mark last message as read
          for (const username of chatData.participants) {
            if (username !== message.sender) { // Don't mark sender's own message
              const userQuery = 'SELECT id FROM users WHERE username = $1';
              const userResult = await pool.query(userQuery, [username]);
              
              if (userResult.rows.length > 0) {
                const userId = userResult.rows[0].id;
                const readTime = new Date(createdTime.getTime() + 60000); // 1 minute later

                const readQuery = `
                  INSERT INTO messages_read (message_id, user_id, read_at)
                  VALUES ($1, $2, $3)
                `;
                await pool.query(readQuery, [messageId, userId, readTime]);
              }
            }
          }
        }
      }
    }

    console.log(`Successfully seeded messages system!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding messages system:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedMessagesSystem();
}

export default seedMessagesSystem;
