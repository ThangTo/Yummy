import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Đảm bảo biến môi trường được load trước khi đọc
dotenv.config();

const uri = process.env.MONGO_URI || '';

if (!uri) {
  throw new Error('MONGO_URI is missing');
}

mongoose.set('strictQuery', true);

export const connectDB = async () => {
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};
