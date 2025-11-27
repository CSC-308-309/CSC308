const { pool } = require('../index');

const sampleInteractions = [
  { username: 'taylor_swift', target_username: 'ed_sheeran', interaction_type: 'like' },
  { username: 'ed_sheeran', target_username: 'billie_eilish', interaction_type: 'like' },
  { username: 'billie_eilish', target_username: 'john_mayer', interaction_type: 'dislike' },
  { username: 'john_mayer', target_username: 'ariana_grande', interaction_type: 'block' },
  { username: 'ariana_grande', target_username: 'bruno_mars', interaction_type: 'like' },
  { username: 'bruno_mars', target_username: 'adele_official', interaction_type: 'dislike' },
  { username: 'adele_official', target_username: 'the_weeknd', interaction_type: 'like' },
  { username: 'the_weeknd', target_username: 'taylor_swift', interaction_type: 'block' }
];

async function seedInteractions() {
  try {
    console.log('Starting to seed interactions...');

    await pool.query('TRUNCATE TABLE interactions RESTART IDENTITY CASCADE');
    console.log(' Cleared existing interactions');

    for (const interaction of sampleInteractions) {
      const query = `
        INSERT INTO interactions (username, target_username, interaction_type)
        VALUES ($1, $2, $3)
        RETURNING username, target_username, interaction_type
      `;
      const values = [interaction.username, interaction.target_username, interaction.interaction_type];
      const result = await pool.query(query, values);
      console.log(
        `  ${result.rows[0].username} ${result.rows[0].interaction_type}d ${result.rows[0].target_username}`
      );
    }

    console.log(`\n Successfully seeded ${sampleInteractions.length} interactions!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding interactions:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedInteractions();
}

module.exports = seedInteractions;