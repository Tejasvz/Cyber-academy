import { Router } from 'express';
import { completeLesson, getProgress } from '../controllers/progressController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);
router.post('/:lessonId/complete', completeLesson);
router.get('/', getProgress);

export default router;
