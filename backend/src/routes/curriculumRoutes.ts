import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    const formattedTiers = modules.map(m => ({
      name: m.id,
      modules: m.lessons.map(l => ({
        id: l.id,
        title: l.title,
        technique: l.technique,
        theory: l.theory,
        guide: l.guide || undefined,
        lab: l.lab,
        opSec: l.opSec,
        flag: l.flag,
        cheatSheet: l.cheatSheet || undefined,
        blueTeamLogs: l.blueTeamLogs || undefined,
        remediation: l.remediation || undefined
      }))
    }));

    let storyData = undefined;
    try {
      const curriculumPath = path.join(__dirname, '../data/curriculum.json');
      if (fs.existsSync(curriculumPath)) {
        const raw = fs.readFileSync(curriculumPath, 'utf-8');
        storyData = JSON.parse(raw).story;
      }
    } catch (_e) {
      // story optional
    }

    res.json({ story: storyData, tiers: formattedTiers });
  } catch (error) {
    console.error('Error reading curriculum from DB:', error);
    res.status(500).json({ error: 'Failed to load curriculum' });
  }
});

export default router;
