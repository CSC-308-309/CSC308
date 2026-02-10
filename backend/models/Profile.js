// models/Profile.js
import pool from '../db/index.js';

const PROFILE_COLUMNS = `
  id,
  username,
  email,
  name,
  role,
  age,
  gender,
  genre,
  experience,
  main_image,
  concert_image,
  last_song,
  last_song_desc,
  created_at,
  updated_at
`;

const PROFILE_FIELDS = new Set([
  'name',
  'role',
  'age',
  'gender',
  'genre',
  'experience',
  'main_image',
  'concert_image',
  'last_song',
  'last_song_desc',
]);

function normalizeUpdateData(updateData = {}) {
  const normalized = { ...updateData };

  if (normalized.profilePhotoUrl != null && normalized.main_image == null) {
    normalized.main_image = normalized.profilePhotoUrl;
  }

  if (normalized.coverPhotoUrl != null && normalized.concert_image == null) {
    normalized.concert_image = normalized.coverPhotoUrl;
  }

  delete normalized.profilePhotoUrl;
  delete normalized.coverPhotoUrl;
  return normalized;
}

export const ProfileModel = {
  async listUsers() {
    const query = `
      SELECT ${PROFILE_COLUMNS}
      FROM users
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async getUserByUsername(username) {
    const query = `
      SELECT ${PROFILE_COLUMNS}
      FROM users
      WHERE username = $1
    `;
    const values = [username];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async updateUser(username, updateData) {
    const normalized = normalizeUpdateData(updateData);
    const fields = Object.keys(normalized).filter((field) => PROFILE_FIELDS.has(field));
    if (fields.length === 0) throw new Error('No fields to update');

    const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
    const values = [username, ...fields.map((f) => normalized[f])];
    const query = `
      UPDATE users
      SET ${setClause}, updated_at = NOW()
      WHERE username = $1
      RETURNING ${PROFILE_COLUMNS}
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows[0] ?? null;
    } catch (error) {
      console.error('Error in Profile.updateUser:', error);
      throw error;
    }
  },

  async deleteUser(username) {
    const query = `
      DELETE FROM users WHERE username = $1 RETURNING ${PROFILE_COLUMNS}
    `;
    try {
      const result = await pool.query(query, [username]);
      return result.rows[0] ?? null;
    } catch (error) {
      console.error('Error in Profile.deleteUser:', error);
      throw error;
    }
  },

  // Mock notification preferences methods
  async getNotificationPreferences(username) {
    console.log(`[PROFILE] getNotificationPreferences called for username: ${username}`);
    // Mock preferences - in a real implementation, these would be stored in the database
    const mockPreferences = {
      username,
      emailNotifications: true,
      pushNotifications: true,
      matchNotifications: true,
      messageNotifications: true,
      eventNotifications: true,
      likeNotifications: false,
    };
    console.log(`   → Returning preferences:`, mockPreferences);
    return mockPreferences;
  },

  async updateNotificationPreferences(username, preferences) {
    console.log(`[PROFILE] updateNotificationPreferences called for username: ${username}`);
    console.log(`   → New preferences:`, preferences);
    // Mock update - in a real implementation, this would update the database
    const updatedPreferences = {
      username,
      ...preferences,
    };
    console.log(`   → Updated successfully`);
    return updatedPreferences;
  },
  
  async updateCoverPhoto(username, coverPhotoData) {
    return this.updateUser(username, { concert_image: coverPhotoData?.url ?? '' });
  },
};
