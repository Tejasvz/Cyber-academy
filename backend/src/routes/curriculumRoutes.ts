import { Router, Request, Response } from 'express';
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

    res.json({ tiers: formattedTiers });
  } catch (error) {
    console.error('Error reading curriculum from DB:', error);
    res.status(500).json({ error: 'Failed to load curriculum' });
  }
});

export default router;
