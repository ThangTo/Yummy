import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { connectDB } from './config/db';
import aiLogsRoute from './routes/ai-logs.routes';
import authRoute from './routes/auth.routes';
import cultureRoute from './routes/culture.routes';
import foodsRoute from './routes/foods.routes';
import scanRoute from './routes/scan.routes';
import usersRoute from './routes/users.routes';

dotenv.config();

const app = express();

// Cấu hình CORS rõ ràng
app.use(
  cors({
    origin: '*', // Cho phép tất cả origins (có thể giới hạn sau)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  }),
);

// Middleware để log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/', (_req, res) => {
  console.log('✅ Health check request received');
  res.json({ status: 'ok', service: 'yummy-backend' });
});

// Serve static files (avatars, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// QUAN TRỌNG: Mount scan route TRƯỚC express.json()
// Multer cần raw body để xử lý multipart/form-data
// express.json() sẽ parse body thành JSON và làm hỏng multipart data
app.use('/api/scan', scanRoute); // Route để scan ảnh món ăn - PHẢI đặt trước express.json()

// Parse JSON cho các routes khác (sau scan route)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Tất cả API routes khác (sau khi đã parse JSON)
app.use('/api/auth', authRoute); // Authentication routes (register, login)
app.use('/api/foods', foodsRoute);
app.use('/api/users', usersRoute);
app.use('/api/ai-logs', aiLogsRoute);
app.use('/api/culture', cultureRoute); // Route để lấy culture card

const PORT = Number(process.env.PORT) || 5000;

connectDB()
  .then(() => {
    // Listen trên 0.0.0.0 để có thể truy cập từ network (không chỉ localhost)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      console.log(`Server accessible from network at http://192.168.1.29:${PORT}`);
      console.log(`Local access: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
