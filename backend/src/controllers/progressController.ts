import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { generateFlag } from '../utils/flagUtils';

// We assign an arbitrary XP value for MVP completion
const XP_PER_LESSON = 100;
const XP_PER_LEVEL = 500;

export const completeLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const { flag } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Securely validate flag on backend
    const expectedFlag = generateFlag(userId!, lessonId!);
    if (!flag || flag.trim().toLowerCase() !== expectedFlag.toLowerCase()) {
      res.status(400).json({ error: 'Incorrect target flag. Review telemetry and command outputs.' });
      return;
    }

    // Check if progress already exists
    const existingProgress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      }
    });

    if (existingProgress) {
      res.status(400).json({ error: 'Lesson already completed' });
      return;
    }

    // Ensure the lesson exists in the DB
    const dbLesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!dbLesson) {
      res.status(404).json({ error: 'Lesson not found in curriculum database' });
      return;
    }

    // Create progress
    await prisma.progress.create({
      data: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date()
      }
    });

    // Update user XP and Level
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const xpGained = dbLesson.xpReward;
    const newXp = user.xp + xpGained;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel }
    });

    res.json({
      message: 'Lesson completed',
      xpGained,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        xp: updatedUser.xp,
        level: updatedUser.level
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error tracking progress' });
  }
};

export const getProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const progress = await prisma.progress.findMany({
      where: { userId }
    });

    res.json(progress.map(p => p.lessonId));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching progress' });
  }
};

export const resetProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Delete progress entries for this user
    await prisma.progress.deleteMany({
      where: { userId }
    });

    // Reset XP and level back to defaults
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { xp: 0, level: 1 }
    });

    res.json({
      message: 'Operator lattice reset completed.',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        xp: updatedUser.xp,
        level: updatedUser.level
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error resetting operator session' });
  }
};
