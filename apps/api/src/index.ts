import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';
import { initSocket } from './utils/socket';
import authRoutes from './routes/auth/authRoutes';
import rideRoutes from './routes/user/rideRoutes';
import driverRoutes from './routes/driver/driverRoutes';
import userProfileRoutes from './routes/user/profileRoutes';
import driverProfileRoutes from './routes/driver/profileRoutes';
import ratingRoutes from './routes/rating/ratingRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();
const port = process.env.PORT || 4000;

// Initialize Socket.io
initSocket(httpServer);

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
apiRouter.use('/rating', ratingRoutes);
apiRouter.use('/users/profile', userProfileRoutes);

app.use('/api', apiRouter);

httpServer.listen(port, () => {
  console.log(`🚀 API server is running on http://localhost:${port}`);
});
