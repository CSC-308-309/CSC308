import fs from 'fs';
import path from 'path';

async function runAllSeeds() {
  try {
    console.log('Running all seed files...');

    const seedsPath = path.resolve('./db/seeds');
    const files = fs.readdirSync(seedsPath)
      .filter(file => file.endsWith('.js'))
      .sort();

    for (const file of files) {
      console.log(`Seeding ${file}...`);
      const seedModule = await import(path.join(seedsPath, file));
      if (typeof seedModule.default === 'function') {
        await seedModule.default();
        console.log(`${file} seeded successfully`);
      } else if (typeof seedModule.seedUsers === 'function') {
        await seedModule.seedUsers();
        console.log(`${file} seeded successfully`);
      } else {
        console.warn(`${file} does not export a proper function`);
      }
    }

    console.log('All seeds completed successfully!');
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
}

runAllSeeds();
