const { pool } = require('../db/index');

const sampleProfiles = [
  {
    name: 'Taylor Swift',
    role: 'Vocalist',
    age: '34',
    gender: 'Female',
    genre: 'Pop',
    experience: '18 years',
    main_image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
    last_song: 'Anti-Hero',
    last_song_desc: 'The last song that gave me chills is...'
  },
  {
    name: 'Ed Sheeran',
    role: 'Guitarist',
    age: '32',
    gender: 'Male',
    genre: 'Pop/Folk',
    experience: '15 years',
    main_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    last_song: 'Shape of You',
    last_song_desc: 'My favorite song to perform live'
  },
  {
    name: 'Billie Eilish',
    role: 'Vocalist',
    age: '22',
    gender: 'Female',
    genre: 'Alternative/Pop',
    experience: '8 years',
    main_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
    last_song: 'Bad Guy',
    last_song_desc: 'This song changed my career'
  },
  {
    name: 'John Mayer',
    role: 'Guitarist',
    age: '46',
    gender: 'Male',
    genre: 'Blues/Rock',
    experience: '25 years',
    main_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
    last_song: 'Gravity',
    last_song_desc: 'A song that means everything to me'
  },
  {
    name: 'Ariana Grande',
    role: 'Vocalist',
    age: '30',
    gender: 'Female',
    genre: 'Pop/R&B',
    experience: '12 years',
    main_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
    last_song: 'Positions',
    last_song_desc: 'Love the vocals on this one'
  },
  {
    name: 'Bruno Mars',
    role: 'Vocalist',
    age: '38',
    gender: 'Male',
    genre: 'Pop/Funk',
    experience: '20 years',
    main_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop',
    last_song: 'Uptown Funk',
    last_song_desc: 'Never gets old performing this'
  },
  {
    name: 'Adele',
    role: 'Vocalist',
    age: '35',
    gender: 'Female',
    genre: 'Soul/Pop',
    experience: '16 years',
    main_image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=600&fit=crop',
    last_song: 'Rolling in the Deep',
    last_song_desc: 'My signature song'
  },
  {
    name: 'The Weeknd',
    role: 'Vocalist',
    age: '33',
    gender: 'Male',
    genre: 'R&B/Pop',
    experience: '13 years',
    main_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop',
    last_song: 'Blinding Lights',
    last_song_desc: 'Most streamed song ever!'
  }
];

async function seedProfiles() {
  try {
    console.log('Starting to seed profiles...');

    // Clear existing profiles
    await pool.query('TRUNCATE TABLE profiles RESTART IDENTITY CASCADE');
    console.log(' Cleared existing profiles');

    // Insert sample profiles
    for (const profile of sampleProfiles) {
      const query = `
        INSERT INTO profiles (
          name, role, age, gender, genre, experience,
          main_image, concert_image, last_song, last_song_desc
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, name
      `;

      const values = [
        profile.name,
        profile.role,
        profile.age,
        profile.gender,
        profile.genre,
        profile.experience,
        profile.main_image,
        profile.concert_image,
        profile.last_song,
        profile.last_song_desc
      ];

      const result = await pool.query(query, values);
      console.log(`  ✓ Added: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    }

    console.log(`\n Successfully seeded ${sampleProfiles.length} profiles!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding profiles:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedProfiles();
}

module.exports = seedProfiles;
