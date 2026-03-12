import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth/authRoutes';
import rideRoutes from './routes/driver/driverRoutes';
import driverRoutes from './routes/driver/driverRoutes';
import userProfileRoutes from './routes/user/profileRoutes';
import driverProfileRoutes from './routes/user/profileRoutes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DollarToGo API is running' });
});

// Basic routing structure matching the architecture plan
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/rides', rideRoutes);
apiRouter.use('/driver/profile', driverProfileRoutes);
apiRouter.use('/driver', driverRoutes);
apiRouter.use('/admin', (req, res) => res.json({ message: 'Admin routes placeholder' }));
apiRouter.use('/users/profile', userProfileRoutes);

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`🚀 API server is running on http://localhost:${port}`);
});
