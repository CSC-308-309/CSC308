import { pool } from "../db/index.js";

export const MusicClipsModel = {
  async create(userId, clipData) {
    const { title, description, thumbnail_url, media_url } = clipData;

    const query = `
      INSERT INTO music_clips (
        title, description, thumbnail_url, media_url
      ) VALUES ($1,$2,$3,$4)
      RETURNING id
    `;

    const values = [title, description, thumbnail_url, media_url];

    const { rows } = await pool.query(query, values);
    const id = rows[0].id;

    const intermediateQuery = `
      INSERT INTO music_clips_intermediate (
        music_clip_id, user_id
      ) VALUES ($1,$2)
    `;

    await pool.query(intermediateQuery, [id, userId]);

    return id;
  },

  async getMusicClipsById(userId) {
    const query = `
      SELECT mc.*
      FROM music_clips mc
      JOIN music_clips_intermediate mci ON mc.id = mci.music_clip_id
      WHERE mci.user_id = $1
    `;

    try {
      const { rows } = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error("Error in MusicClipsModel.getById:", error);
      throw error;
    }
  },

  async updateClip(id, updateData) {
    const allowedFields = [
      'title', 'description', 'media_url', 'thumbnail_url'
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount++}`);
        if (key === 'tags') {
          values.push(value ? JSON.stringify(value) : null);
        } else {
          values.push(value);
        }
      }
    }

    if (updateFields.length === 0) {
      return null;
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE music_clips 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, values);
      return rows || null;
    } catch (error) {
      console.error("Error in MusicClipsModel.update:", error);
      throw error;
    }
  },

  async delete(id) {
    const query = `DELETE FROM music_clips WHERE id = $1 RETURNING id`;

    try {
      const { rows } = await pool.query(query, [id]);
      return rows.length > 0;
    } catch (error) {
      console.error("Error in MusicClipsModel.delete:", error);
      throw error;
    }
  },
};
