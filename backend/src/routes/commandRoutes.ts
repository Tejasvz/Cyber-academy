import { Router } from 'express';
import { executeCommand } from '../controllers/commandController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Process command execution sandbox actions
router.post('/:lessonId/command', authenticate as any, executeCommand as any);

export default router;
