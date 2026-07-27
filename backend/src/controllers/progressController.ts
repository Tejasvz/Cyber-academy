import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// We assign an arbitrary XP value for MVP completion
const XP_PER_LESSON = 100;
const XP_PER_LEVEL = 500;

export const completeLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
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

    // Ensure the lesson exists in DB for foreign key constraint, 
    // OR we can just store the string lessonId.
    // Wait, our Prisma schema has a relation to Lesson model. 
    // If the database is empty, it will fail the foreign key constraint.
    // Let's create a dummy module and lesson if it doesn't exist to satisfy the FK, 
    // or just bypass it. For MVP, we can upsert the lesson ID into the DB.
    
    // Upsert Module (dummy)
    const module = await prisma.module.upsert({
      where: { id: 'MOCK_MODULE' },
      update: {},
      create: { id: 'MOCK_MODULE', title: 'System', description: 'System', orderIndex: 0 }
    });

    // Upsert Lesson
    await prisma.lesson.upsert({
      where: { id: lessonId },
      update: {},
      create: {
        id: lessonId,
        moduleId: module.id,
        title: lessonId,
        content: 'Content',
        difficulty: 'Beginner',
        xpReward: XP_PER_LESSON,
        orderIndex: 0
      }
    });

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

    const newXp = user.xp + XP_PER_LESSON;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel }
    });

    res.json({
      message: 'Lesson completed',
      xpGained: XP_PER_LESSON,
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
