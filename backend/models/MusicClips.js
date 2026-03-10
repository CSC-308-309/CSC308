import { pool } from "../db/index.js";

export const MusicClipsModel = {
  async create(userId, clipData) {
    const { title, description, thumbnail_url, media_url } = clipData;

    const query = `
      INSERT INTO music_clips (
        title, description, thumbnail_url, media_url
      ) VALUES ($1,$2,$3,$4)
      RETURNING *
    `;

    const values = [title, description, thumbnail_url, media_url];

    const { rows } = await pool.query(query, values);
    const clip = rows[0];

    const intermediateQuery = `
      INSERT INTO music_clips_intermediate (
        music_clip_id, user_id
      ) VALUES ($1,$2)
    `;

    await pool.query(intermediateQuery, [clip.id, userId]);

    return clip;
  },

  async getMusicClipsById(userId) {
    const query = `
      SELECT mc.*
      FROM music_clips mc
      JOIN music_clips_intermediate mci ON mc.id = mci.music_clip_id
      WHERE mci.user_id = $1
      ORDER BY mc.created_at DESC, mc.id DESC
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  async updateClip(id, updateData) {
    const allowedFields = ["title", "description", "media_url", "thumbnail_url"];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return null;
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE music_clips 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  },

  async delete(id) {
    await pool.query(`DELETE FROM music_clips_intermediate WHERE music_clip_id = $1`, [id]);

    const query = `DELETE FROM music_clips WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  },
};