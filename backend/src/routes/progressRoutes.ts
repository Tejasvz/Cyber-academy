import { Router } from 'express';
import { completeLesson, getProgress, resetProgress } from '../controllers/progressController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);
router.post('/reset', resetProgress);
router.post('/:lessonId/complete', completeLesson);
router.get('/', getProgress);

export default router;
