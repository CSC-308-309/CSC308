import { pool } from "../db/index.js";

const sampleInteractions = [
  {
    username: "taylor_swift",
    target_username: "ed_sheeran",
    interaction_type: "like",
  },
  {
    username: "ed_sheeran",
    target_username: "billie_eilish",
    interaction_type: "like",
  },
  {
    username: "billie_eilish",
    target_username: "john_mayer",
    interaction_type: "dislike",
  },
  {
    username: "john_mayer",
    target_username: "ariana_grande",
    interaction_type: "block",
  },
  {
    username: "ariana_grande",
    target_username: "bruno_mars",
    interaction_type: "like",
  },
  {
    username: "bruno_mars",
    target_username: "adele_official",
    interaction_type: "dislike",
  },
  {
    username: "adele_official",
    target_username: "the_weeknd",
    interaction_type: "like",
  },
  {
    username: "the_weeknd",
    target_username: "taylor_swift",
    interaction_type: "block",
  },
];

async function seedInteractions() {
  try {
    console.log("Seeding interactions table...");

    await pool.query("TRUNCATE TABLE interactions RESTART IDENTITY CASCADE");
    console.log("  Cleared existing interactions");

    for (const interaction of sampleInteractions) {
      console.log(`Processing interaction: ${interaction.username} -> ${interaction.target_username} (${interaction.interaction_type})`);
      
      // Get user IDs from usernames
      const userQuery = "SELECT id FROM users WHERE username = $1";
      const userResult = await pool.query(userQuery, [interaction.username]);
      const targetUserResult = await pool.query(userQuery, [
        interaction.target_username,
      ]);

      if (userResult.rows.length === 0 || targetUserResult.rows.length === 0) {
        console.log(
          `  ⚠️  Skipped: ${interaction.username} -> ${interaction.target_username} (user not found)`,
        );
        continue;
      }

      const userId = userResult.rows[0].id;
      const targetUserId = targetUserResult.rows[0].id;

      const query = `
        INSERT INTO interactions (user_id, target_user_id, interaction_type)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, target_user_id, interaction_type
      `;

      const values = [userId, targetUserId, interaction.interaction_type];
      const result = await pool.query(query, values);

      console.log(
        `${interaction.username} ${interaction.interaction_type}d ${interaction.target_username} (ID: ${result.rows[0].id})`,
      );
    }

    console.log(`Successfully seeded ${sampleInteractions.length} interactions!`);
  } catch (error) {
    console.error("Error seeding interactions:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedInteractions();
}

export default seedInteractions;
