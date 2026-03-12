import { pool } from "../db/index.js";

export const ConcertMemoriesModel = {
  async create(userId, memoryData) {
    const {
      title,
      description,
      thumbnail_url,
      video_url,
      is_starred = false,
    } = memoryData;

    const query = `
      INSERT INTO concert_memories (
        title, description, thumbnail_url, video_url, is_starred
      ) VALUES ($1,$2,$3,$4,$5)
      RETURNING *
    `;

    const values = [title, description, thumbnail_url, video_url, is_starred];

    const { rows } = await pool.query(query, values);
    const memory = rows[0];

    const intermediateQuery = `
      INSERT INTO concert_memories_intermediate (
        concert_memory_id, user_id
      ) VALUES ($1,$2)
    `;

    await pool.query(intermediateQuery, [memory.id, userId]);

    return memory;
  },

  async getConcertMemoriesByUserId(userId) {
    const query = `
      SELECT cm.*
      FROM concert_memories cm
      JOIN concert_memories_intermediate cmi ON cm.id = cmi.concert_memory_id
      WHERE cmi.user_id = $1
      ORDER BY cm.created_at DESC, cm.id DESC
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  async updateMemory(id, updateData) {
    const allowedFields = [
      "title",
      "description",
      "video_url",
      "thumbnail_url",
      "is_starred",
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) return null;

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE concert_memories
      SET ${updateFields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  },

  async delete(id) {
    await pool.query(
      `DELETE FROM concert_memories_intermediate WHERE concert_memory_id = $1`,
      [id],
    );

    const query = `DELETE FROM concert_memories WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  },
};