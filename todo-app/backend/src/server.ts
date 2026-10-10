import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set (copy .env.example to .env)');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo_app');
  console.log('MongoDB connected');
  // 0.0.0.0 so the Android emulator / a real phone on the same Wi-Fi can reach it
  app.listen(PORT, '0.0.0.0', () => console.log(`API listening on port ${PORT}`));
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
