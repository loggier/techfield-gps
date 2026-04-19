import { AppDataSource } from '../data-source';
import { seedPlatformAdmin } from './platform-admin.seed';

async function runSeeds() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();
  console.log('Running seeds...');

  await seedPlatformAdmin(AppDataSource);

  console.log('Seeds complete.');
  await AppDataSource.destroy();
}

runSeeds().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
