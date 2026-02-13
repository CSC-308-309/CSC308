import { pool } from '../index.js';
import bcrypt from 'bcrypt';

const sampleUsers = [
  {
    username: 'taylor_swift',
    email: 'taylor.swift@musicdate.com',
    password: 'password123',
    name: 'Taylor Swift',
    role: 'Vocalist',
    age: 34,
    gender: 'Female',
    genre: 'Pop',
    experience: 18,
    profile_picture: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=500&fit=crop',
    cover_photo: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
    main_image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
    concert_images: [
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop'
    ],
    music_clips: [
      'https://example.com/clip1.mp3',
      'https://example.com/clip2.mp3'
    ],
    last_song: 'Anti-Hero',
    last_song_desc: 'The last song that gave me chills is...'
  },
  {
    username: 'ed_sheeran',
    email: 'ed.sheeran@musicdate.com',
    password: 'password123',
    name: 'Ed Sheeran',
    role: 'Guitarist',
    age: 32,
    gender: 'Male',
    genre: 'Pop/Folk',
    experience: 15,
    profile_picture: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=500&fit=crop',
    cover_photo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    main_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    concert_images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop'
    ],
    music_clips: [
      'https://example.com/ed-guitar.mp3',
      'https://example.com/ed-vocals.mp3'
    ],
    last_song: 'Shape of You',
    last_song_desc: 'My favorite song to perform live'
  },
  {
    username: 'billie_eilish',
    email: 'billie.eilish@musicdate.com',
    password: 'password123',
    name: 'Billie Eilish',
    role: 'Vocalist',
    age: 22,
    gender: 'Female',
    genre: 'Alternative/Pop',
    experience: 8,
    profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
    cover_photo: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
    main_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
    concert_images: [
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=600&fit=crop'
    ],
    music_clips: [
      'https://example.com/bad-guy.mp3',
      'https://example.com/happier.mp3'
    ],
    last_song: 'Bad Guy',
    last_song_desc: 'This song changed my career'
  },
  {
    username: 'john_mayer',
    email: 'john.mayer@musicdate.com',
    password: 'password123',
    name: 'John Mayer',
    role: 'Guitarist',
    age: 46,
    gender: 'Male',
    genre: 'Blues/Rock',
    experience: 25,
    profile_picture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
    cover_photo: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
    main_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
    concert_images: [
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop'
    ],
    music_clips: [
      'https://example.com/gravity.mp3',
      'https://example.com/neon.mp3'
    ],
    last_song: 'Gravity',
    last_song_desc: 'A song that means everything to me'
  },
  {
    username: 'ariana_grande',
    email: 'ariana.grande@musicdate.com',
    password: 'password123',
    name: 'Ariana Grande',
    role: 'Vocalist',
    age: 30,
    gender: 'Female',
    genre: 'Pop/R&B',
    experience: 12,
    profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d?w=400&h=500&fit=crop',
    cover_photo: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd8?w=800&h=600&fit=crop',
    main_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd8?w=800&h=600&fit=crop',
    concert_images: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop'
    ],
    music_clips: [
      'https://example.com/positions.mp3',
      'https://example.com/7rings.mp3'
    ],
    last_song: 'Positions',
    last_song_desc: 'Love performing this one live'
  },
  {
    username: 'bruno_mars',
    email: 'bruno.mars@musicdate.com',
    password: 'password123',
    name: 'Bruno Mars',
    role: 'Vocalist',
    age: 38,
    gender: 'Male',
    genre: 'Pop/Funk',
    experience: 20,
    profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    cover_photo: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop',
    main_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop',
    concert_images: [
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop'
    ],
    music_clips: [
      'https://example.com/uptown-funk.mp3',
      'https://example.com/24k-magic.mp3'
    ],
    last_song: 'Uptown Funk',
    last_song_desc: 'Never gets old performing this'
  },
  {
    username: 'adele_official',
    email: 'adele@musicdate.com',
    password: 'password123',
    name: 'Adele',
    role: 'Vocalist',
    age: 35,
    gender: 'Female',
    genre: 'Soul/Pop',
    experience: 16,
    profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop',
    cover_photo: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=600&fit=crop',
    main_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=600&fit=crop',
    concert_images: [
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=600&fit=crop'
    ],
    music_clips: [
      'https://example.com/rolling-in-the-deep.mp3',
      'https://example.com/hello.mp3'
    ],
    last_song: 'Rolling in the Deep',
    last_song_desc: 'My signature song'
  },
  {
    username: 'the_weeknd',
    email: 'the.weeknd@musicdate.com',
    password: 'password123',
    name: 'The Weeknd',
    role: 'Vocalist',
    age: 33,
    gender: 'Male',
    genre: 'R&B/Pop',
    experience: 13,
    profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
    cover_photo: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop',
    main_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
    concert_image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop',
    concert_images: [
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1525904322371-3ba558ae434b?w=800&h=600&fit=crop'
    ],
    music_clips: [
      'https://example.com/blinding-lights.mp3',
      'https://example.com/call-out.mp3'
    ],
    last_song: 'Blinding Lights',
    last_song_desc: 'Most streamed song ever!'
  }
];

async function seedUsers() {
  try {
    console.log('Seeding users table...');

    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    console.log('  Cleared existing users');

    for (const user of sampleUsers) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      
      const query = `
        INSERT INTO users (
          username, email, password_hash, name, role, age, gender, 
          genre, experience, profile_picture, cover_photo, main_image, 
          concert_image, concert_images, music_clips, last_song, last_song_desc
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          RETURNING id, username
      `;

      const values = [
        user.username, user.email, passwordHash, user.name, user.role, user.age,
        user.gender, user.genre, user.experience, user.profile_picture, user.cover_photo,
        user.main_image, user.concert_image, `{${user.concert_images.join(',')}}`, 
        `{${user.music_clips.join(',')}}`, user.last_song, user.last_song_desc
      ];

      const result = await pool.query(query, values);
      console.log(` Added: ${user.name} (ID: ${result.rows[0].id}, Username: ${result.rows[0].username})`);
    }

    console.log(`Successfully seeded ${sampleUsers.length} users!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

export default seedUsers;
