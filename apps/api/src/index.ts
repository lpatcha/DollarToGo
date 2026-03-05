import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

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

apiRouter.use('/auth', (req, res) => res.json({ message: 'Auth routes placeholder' }));
apiRouter.use('/rides', (req, res) => res.json({ message: 'Rides routes placeholder' }));
apiRouter.use('/driver', (req, res) => res.json({ message: 'Driver routes placeholder' }));
apiRouter.use('/admin', (req, res) => res.json({ message: 'Admin routes placeholder' }));
apiRouter.use('/users', (req, res) => res.json({ message: 'Users routes placeholder' }));

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`🚀 API server is running on http://localhost:${port}`);
});
