import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from '@/routes/auth.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;

// Routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Auth Service running on http://localhost:${PORT}`);
});
