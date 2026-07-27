import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const filePath = path.join(__dirname, '../data/curriculum.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const curriculum = JSON.parse(rawData);
    res.json(curriculum);
  } catch (error) {
    console.error('Error reading curriculum:', error);
    res.status(500).json({ error: 'Failed to load curriculum' });
  }
});

export default router;
