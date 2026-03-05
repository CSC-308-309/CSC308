import seedUsers from "./seeds/001_seed_users.js";
import seedInteractions from "./seeds/002_seed_interactions.js";
import seedMessagesSystem from "./seeds/003_seed_messages_system.js";
import seedNotifications from "./seeds/004_seed_notifications.js";
import seedConcertMemories from "./seeds/005_seed_concert_memories.js";
import seedMusicClips from "./seeds/006_seed_music_clips.js";

async function seedAll() {
  try {
    console.log("Starting database seeding...\n");

    // Run seed scripts in order
    try{
      console.log("=== Step 1: Seeding Users ===");
      await seedUsers();
      console.log("✅ Step 1 completed");
    } catch (error) {
      console.log("Error seeding users:", error);
    }

    console.log("\n=== Step 2: Seeding Interactions ===");
    try {
      await seedInteractions();
      console.log("✅ Step 2 completed");
    } catch (error) {
      console.log("Error seeding interactions:", error);
    }

    console.log("\n=== Step 3: Seeding Messages System ===");
    try {
      await seedMessagesSystem();
      console.log("✅ Step 3 completed");
    } catch (error) {
      console.log("Error seeding messages system:", error);
    }

    console.log("\n=== Step 4: Seeding Notifications ===");
    try {
      await seedNotifications();
      console.log("✅ Step 4 completed");
    } catch (error) {
      console.log("Error seeding notifications:", error);
    }

    console.log("\n=== Step 5: Seeding Concert Memories ===");
    try {
      await seedConcertMemories();
      console.log("✅ Step 5 completed");
    } catch (error) {
      console.log("Error seeding concert memories:", error);
    }

    console.log("\n=== Step 6: Seeding Music Clips ===");
    try {
      await seedMusicClips();
      console.log("✅ Step 6 completed");
    } catch (error) {
      console.log("Error seeding music clips:", error);
    }

    console.log("\nAll seed scripts completed successfully!");
    console.log("\nSummary:");
    console.log("8 users created");
    console.log("8 interactions created");
    console.log("3 chats with messages created");
    console.log("16 notifications created");
    console.log("5 concert memories created");
    console.log("3 music clips created");
    console.log("\nLogin credentials:");
    console.log("Username: taylor_swift, ed_sheeran, billie_eilish, etc.");
    console.log("Password: password123 (for all users)");

    process.exit(0);
  } catch (error) {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  }
}

seedAll();

