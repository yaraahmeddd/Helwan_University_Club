/**
 * Seeds sport_image paths for sports missing images.
 * Assets live in Backend/uploads/sports/ and are served at /uploads/sports/*
 *
 * Run: npx ts-node -r ts-node/register src/scripts/seed-sport-images.ts
 */
import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { Sport } from '../entities/Sport';

const SPORT_IMAGE_BY_NAME_EN: Record<string, string> = {
  Football: 'uploads/sports/default.svg',
  Basketball: 'uploads/sports/default.svg',
  Volleyball: 'uploads/sports/default.svg',
  Tennis: 'uploads/sports/table-tennis.svg',
  Swimming: 'uploads/sports/swimming.svg',
  Judo: 'uploads/sports/aikido.svg',
  Karate: 'uploads/sports/aikido.svg',
  Squash: 'uploads/sports/table-tennis.svg',
  Snooker: 'uploads/sports/bowling.svg',
  Chess: 'uploads/sports/bowling.svg',
  Athletics: 'uploads/sports/archery.svg',
  Yoga: 'uploads/sports/aikido.svg',
};

async function main() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Sport);
  const sports = await repo.find();

  let updated = 0;
  for (const sport of sports) {
    if (sport.sport_image?.trim()) continue;

    const mapped = SPORT_IMAGE_BY_NAME_EN[sport.name_en];
    sport.sport_image = mapped ?? 'uploads/sports/default.svg';
    await repo.save(sport);
    updated += 1;
    console.log(`✓ ${sport.name_en} → ${sport.sport_image}`);
  }

  console.log(`Done. Updated ${updated} sport(s).`);
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
