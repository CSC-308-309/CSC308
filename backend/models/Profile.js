const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  age: { type: String, required: true },
  gender: { type: String, required: true },
  genre: { type: String, required: true },
  experience: { type: String, required: true },
  mainImage: { type: String, required: true },
  concertImage: { type: String, required: true },
  lastSong: { type: String, required: true },
  lastSongDesc: { type: String, required: true }
}, { collection: 'users',
    timestamps: true });

const Profile = mongoose.model('Profile', profileSchema, 'users');

module.exports = Profile;