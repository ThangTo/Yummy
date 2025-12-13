import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './config/db';
import aiLogsRoute from './routes/aiLogs';
import foodsRoute from './routes/foods';
import usersRoute from './routes/users';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'yummy-backend' });
});

app.use('/foods', foodsRoute);
app.use('/users', usersRoute);
app.use('/ai-logs', aiLogsRoute);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
