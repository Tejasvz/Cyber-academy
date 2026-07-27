import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import curriculumRoutes from './routes/curriculumRoutes';
import progressRoutes from './routes/progressRoutes';
import { authenticate } from './middleware/authMiddleware';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/curriculum', authenticate, curriculumRoutes);
app.use('/api/progress', progressRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
