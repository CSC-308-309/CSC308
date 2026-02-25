import seedUsers from "./seeds/001_seed_users.js";
import seedInteractions from "./seeds/002_seed_interactions.js";
import seedMessagesSystem from "./seeds/003_seed_messages_system.js";
import seedNotifications from "./seeds/004_seed_notifications.js";

async function seedAll() {
  try {
    console.log("Starting database seeding...\n");

    // Run seed scripts in order
    console.log("=== Step 1: Seeding Users ===");
    await seedUsers();

    console.log("\n=== Step 2: Seeding Interactions ===");
    await seedInteractions();

    console.log("\n=== Step 3: Seeding Messages System ===");
    await seedMessagesSystem();

    console.log("\n=== Step 4: Seeding Notifications ===");
    await seedNotifications();

    console.log("\nAll seed scripts completed successfully!");
    console.log("\nSummary:");
    console.log("8 users created");
    console.log("8 interactions created");
    console.log("3 chats with messages created");
    console.log("16 notifications created");
    console.log("\nLogin credentials:");
    console.log("Username: taylor_swift, ed_sheeran, billie_eilish, etc.");
    console.log("Password: password123 (for all users)");

    process.exit(0);
  } catch (error) {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  }
}

// Run individual seed if specified
const scriptName = process.argv[2];
if (scriptName) {
  switch (scriptName) {
    case "users":
      seedUsers();
      break;
    case "interactions":
      seedInteractions();
      break;
    case "messages":
      seedMessagesSystem();
      break;
    case "notifications":
      seedNotifications();
      break;
    default:
      console.log(
        "Usage: node seed_all.js [users|interactions|messages|notifications]",
      );
      process.exit(1);
  }
} else {
  seedAll();
}
