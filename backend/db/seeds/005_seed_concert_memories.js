import { pool } from "../index.js";

export async function seed() {
  // First get the user ID for taylor_swift (using existing user)
  const userResult = await pool.query('SELECT id FROM users WHERE username = $1', ['taylor_swift']);
  if (!userResult.rows[0]) {
    console.log('User taylor_swift not found');
    return;
  }

  const userId = userResult.rows[0].id;

  // Sample concert memories
  const concertMemories = [
    {
      title: "Amazing Eras Tour Night",
      description: "Best night ever! The crowd was electric and the energy was incredible. So many amazing moments with the fans!",
      thumbnail_url: "https://example.com/eras-tour-thumb.jpg",
      video_url: "https://example.com/eras-tour-concert.mp4",
      is_starred: true,
      created_at: new Date('2024-07-15'),
      updated_at: new Date('2024-07-15')
    },
    {
      title: "Rocking at Foo Fighters",
      description: "Dave Grohl jumped into the crowd right in front of us! The energy was insane and they played for 3 hours straight.",
      thumbnail_url: "https://example.com/foo-fighters-thumb.jpg",
      video_url: "https://example.com/foo-fighters-concert.mp4",
      is_starred: false,
      created_at: new Date('2024-06-20'),
      updated_at: new Date('2024-06-20')
    },
    {
      title: "Coachella 2024 Weekend 1",
      description: "Incredible weekend with so many amazing artists. The art installations were mind-blowing and the weather was perfect!",
      thumbnail_url: "https://example.com/coachella-thumb.jpg",
      video_url: "https://example.com/coachella-concert.mp4",
      is_starred: true,
      created_at: new Date('2024-04-14'),
      updated_at: new Date('2024-04-14')
    },
    {
      title: "Intimate Jazz Club Experience",
      description: "Small venue but amazing acoustics. Felt like we were in the 1940s. The saxophone solo was unforgettable.",
      thumbnail_url: "https://example.com/jazz-club-thumb.jpg",
      video_url: "https://example.com/jazz-club-concert.mp4",
      is_starred: false,
      created_at: new Date('2024-02-10'),
      updated_at: new Date('2024-02-10')
    },
    {
      title: "EDM Festival Madness",
      description: "12 hours of non-stop electronic music. The light show was spectacular and made so many new friends!",
      thumbnail_url: "https://example.com/edm-festival-thumb.jpg",
      video_url: "https://example.com/edm-festival-concert.mp4",
      is_starred: true,
      created_at: new Date('2024-08-25'),
      updated_at: new Date('2024-08-25')
    }
  ];

  // Insert concert memories one by one to avoid complex unnest syntax
  for (const memory of concertMemories) {
    const result = await pool.query(
      `INSERT INTO concert_memories (title, description, thumbnail_url, video_url, is_starred, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [memory.title, memory.description, memory.thumbnail_url, memory.video_url, memory.is_starred, memory.created_at, memory.updated_at]
    );
    
    // Insert into intermediate table
    await pool.query(
      'INSERT INTO concert_memories_intermediate (concert_memory_id, user_id) VALUES ($1, $2)',
      [result.rows[0].id, userId]
    );
  }

  console.log(`Seeded ${concertMemories.length} concert memories for user taylor_swift`);
}

export default seed;
