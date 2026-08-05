import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with curriculum data...');

  const curriculumPath = path.join(__dirname, '../src/data/curriculum.json');
  const rawData = fs.readFileSync(curriculumPath, 'utf-8');
  const curriculum = JSON.parse(rawData);

  // Clear existing progress/lessons/modules to avoid conflicts
  await prisma.progress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();

  let moduleIndex = 0;
  for (const tier of curriculum.tiers) {
    const moduleRecord = await prisma.module.create({
      data: {
        id: tier.name,
        title: `${tier.name} Tier`,
        description: `${tier.name} curriculum modules`,
        orderIndex: moduleIndex++,
      },
    });

    console.log(`Created Module: ${moduleRecord.id}`);

    let lessonIndex = 0;
    for (const moduleObj of tier.modules) {
      await prisma.lesson.create({
        data: {
          id: moduleObj.id,
          moduleId: moduleRecord.id,
          title: moduleObj.title,
          technique: moduleObj.technique,
          theory: moduleObj.theory,
          guide: moduleObj.guide || null,
          lab: moduleObj.lab,
          opSec: moduleObj.opSec,
          flag: moduleObj.flag,
          cheatSheet: moduleObj.cheatSheet || null,
          blueTeamLogs: moduleObj.blueTeamLogs || null,
          remediation: moduleObj.remediation || null,
          difficulty: tier.name,
          xpReward: moduleObj.id.endsWith('05') || moduleObj.id.endsWith('09') ? 200 : 100,
          orderIndex: lessonIndex++,
        },
      });
      console.log(`  Created Lesson: ${moduleObj.id} - ${moduleObj.title}`);
    }
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
