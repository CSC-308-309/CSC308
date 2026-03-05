import { pool } from "../index.js";

export async function seed() {
  // First get the user ID for ed_sheeran (using existing user)
  const userResult = await pool.query('SELECT id FROM users WHERE username = $1', ['ed_sheeran']);
  if (!userResult.rows[0]) {
    console.log('User ed_sheeran not found');
    return;
  }

  const userId = userResult.rows[0].id;

  // Sample music clips
  const musicClips = [
    {
      title: "Summer Vibes Mix",
      description: "Perfect playlist for beach days and road trips. Features indie pop and tropical house tracks.",
      media_url: "https://example.com/summer-vibes.mp3",
      thumbnail_url: "https://example.com/summer-vibes-thumb.jpg",
      created_at: new Date('2024-07-01'),
      updated_at: new Date('2024-07-01')
    },
    {
      title: "Late Night Study Session",
      description: "Lo-fi beats to help you focus during those late night study sessions. No lyrics, just pure concentration.",
      media_url: "https://example.com/late-night-study.mp3",
      thumbnail_url: "https://example.com/study-thumb.jpg",
      created_at: new Date('2024-09-15'),
      updated_at: new Date('2024-09-15')
    },
    {
      title: "Guitar Riffs I Made",
      description: "Some electric guitar riffs I've been working on. Still a work in progress but getting there!",
      media_url: "https://example.com/guitar-riffs.mp3",
      thumbnail_url: "https://example.com/guitar-thumb.jpg",
      created_at: new Date('2024-03-22'),
      updated_at: new Date('2024-03-22')
    }
  ];

  // Insert music clips one by one to avoid complex unnest syntax
  for (const clip of musicClips) {
    const result = await pool.query(
      `INSERT INTO music_clips (title, description, thumbnail_url, media_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [clip.title, clip.description, clip.thumbnail_url, clip.media_url, clip.created_at, clip.updated_at]
    );
    
    // Insert into intermediate table
    await pool.query(
      'INSERT INTO music_clips_intermediate (music_clip_id, user_id) VALUES ($1, $2)',
      [result.rows[0].id, userId]
    );
  }

  console.log(`Seeded ${musicClips.length} music clips for user ed_sheeran`);
}

export default seed;
