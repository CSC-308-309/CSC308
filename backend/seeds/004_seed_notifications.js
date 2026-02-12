import { pool } from "../db/index.js";

const sampleNotifications = [
  // Taylor Swift notifications
  {
    user: "taylor_swift",
    actor: "ed_sheeran",
    type: "like",
    reference_id: null,
    is_read: false,
    hours_ago: 2,
  },
  {
    user: "taylor_swift",
    actor: "ed_sheeran",
    type: "message",
    reference_id: 1,
    is_read: true,
    hours_ago: 3,
  },

  // Ed Sheeran notifications
  {
    user: "ed_sheeran",
    actor: "taylor_swift",
    type: "message",
    reference_id: 2,
    is_read: false,
    hours_ago: 0.5,
  },
  {
    user: "ed_sheeran",
    actor: "billie_eilish",
    type: "like",
    reference_id: null,
    is_read: true,
    hours_ago: 6,
  },

  // Billie Eilish notifications
  {
    user: "billie_eilish",
    actor: "ariana_grande",
    type: "message",
    reference_id: 3,
    is_read: false,
    hours_ago: 0.25,
  },
  {
    user: "billie_eilish",
    actor: "john_mayer",
    type: "dislike",
    reference_id: null,
    is_read: true,
    hours_ago: 3,
  },

  // Ariana Grande notifications
  {
    user: "ariana_grande",
    actor: "bruno_mars",
    type: "message",
    reference_id: 4,
    is_read: false,
    hours_ago: 0.75,
  },
  {
    user: "ariana_grande",
    actor: "the_weeknd",
    type: "message",
    reference_id: 5,
    is_read: true,
    hours_ago: 2,
  },

  // John Mayer notifications
  {
    user: "john_mayer",
    actor: "adele_official",
    type: "message",
    reference_id: 6,
    is_read: false,
    hours_ago: 0.33,
  },
  {
    user: "john_mayer",
    actor: "ariana_grande",
    type: "block",
    reference_id: null,
    is_read: true,
    hours_ago: 5,
  },

  // Bruno Mars notifications
  {
    user: "bruno_mars",
    actor: "adele_official",
    type: "dislike",
    reference_id: null,
    is_read: false,
    hours_ago: 1,
  },
  {
    user: "bruno_mars",
    actor: "ariana_grande",
    type: "like",
    reference_id: null,
    is_read: true,
    hours_ago: 4,
  },

  // Adele notifications
  {
    user: "adele_official",
    actor: "the_weeknd",
    type: "like",
    reference_id: null,
    is_read: false,
    hours_ago: 0.17,
  },
  {
    user: "adele_official",
    actor: "john_mayer",
    type: "message",
    reference_id: 7,
    is_read: true,
    hours_ago: 1,
  },

  // The Weeknd notifications
  {
    user: "the_weeknd",
    actor: "adele_official",
    type: "message",
    reference_id: 8,
    is_read: false,
    hours_ago: 0.08,
  },
  {
    user: "the_weeknd",
    actor: "taylor_swift",
    type: "block",
    reference_id: null,
    is_read: true,
    hours_ago: 7,
  },
];

async function seedNotifications() {
  try {
    console.log("Seeding notifications table...");

    await pool.query("TRUNCATE TABLE notifications RESTART IDENTITY CASCADE");
    console.log("  Cleared existing notifications");

    for (const notif of sampleNotifications) {
      // Get user IDs
      const userQuery = "SELECT id FROM users WHERE username = $1";
      const userResult = await pool.query(userQuery, [notif.user]);

      let actorId = null;
      if (notif.actor) {
        const actorResult = await pool.query(userQuery, [notif.actor]);
        if (actorResult.rows.length > 0) {
          actorId = actorResult.rows[0].id;
        }
      }

      if (userResult.rows.length === 0) {
        console.log(`Skipped notification for ${notif.user} (user not found)`);
        continue;
      }

      const userId = userResult.rows[0].id;
      const createdAt = new Date(Date.now() - notif.hours_ago * 60 * 60 * 1000);
      const readAt = notif.is_read
        ? new Date(createdAt.getTime() + 30 * 60 * 1000)
        : null; // 30 minutes later if read

      const query = `
        INSERT INTO notifications (
          user_id, actor_user_id, type, reference_id, 
          is_read, created_at, read_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;

      const values = [
        userId,
        actorId,
        notif.type,
        notif.reference_id,
        notif.is_read,
        createdAt,
        readAt,
      ];

      const result = await pool.query(query, values);
      const notifId = result.rows[0].id;

      const status = notif.is_read ? "read" : "unread";
      const actorText = notif.actor ? ` from ${notif.actor}` : "";
      console.log(
        `Added ${notif.type} notification${actorText} for ${notif.user} (${status})`,
      );
    }

    console.log(
      `Successfully seeded ${sampleNotifications.length} notifications!`,
    );
    process.exit(0);
  } catch (error) {
    console.error("Error seeding notifications:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedNotifications();
}

export default seedNotifications;
