import { pool } from "../db/index.js";

export const ConcertMemoriesModel = {
  async create(userId, memoryData) {
    const {
      title,
      description,
      thumbnail_url,
      video_url,
      is_starred = false
    } = memoryData;

    const query = `
      INSERT INTO concert_memories (
        title, description, thumbnail_url, video_url, is_starred
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const values = [
      title, description, thumbnail_url, video_url, is_starred
    ];

    try {
      const { rows } = await pool.query(query, values);
      id = rows[0].id;
    } catch (error) {
      console.error("Error in ConcertMemoriesModel.create:", error);
      throw error;
    }

    const intermediateQuery = `
      INSERT INTO concert_memories_intermediate (
        concert_memory_id, user_id
      ) VALUES ($1, $2)
    `;

    const intermediateValues = [
      id, userId
    ];

    try {
      await pool.query(intermediateQuery, intermediateValues);
      return id;
    } catch (error) {
      console.error("Error in ConcertMemoriesModel.create:", error);
      throw error;
    }
  },

  async getAllConcertMemoriesById(userId) {
    const query = `
      SELECT cm.*, u.username, u.name as user_name
      FROM concert_memories cm
      JOIN concert_memories_intermediate cmi ON cm.id = cmi.concert_memory_id
      JOIN users u ON cmi.user_id = u.id
      WHERE cmi.user_id = $1
      ORDER BY cm.created_at DESC
    `;

    try {
      const { rows } = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error("Error in ConcertMemoriesModel.getAllConcertMemories:", error);
      throw error;
    }
  },

  async updateMemory(id, updateData) {
    const allowedFields = [
      'title', 'description', 'thumbnail_url', 'video_url', 'is_starred'
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

    if (updateFields.length === 0) {
      return null;
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE concert_memories 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (error) {
      console.error("Error in ConcertMemoriesModel.update:", error);
      throw error;
    }
  },

  async deleteMemory(concert_memory_id) {
    const query = `DELETE FROM concert_memories WHERE id = $1 RETURNING id`;

    try {
      const { rows } = await pool.query(query, [concert_memory_id]);
      return rows.length > 0;
    } catch (error) {
      console.error("Error in ConcertMemoriesModel.delete:", error);
      throw error;
    }
  }
};
