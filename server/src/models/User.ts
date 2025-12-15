import { Schema, Types, model, type Document } from 'mongoose';

export interface IUserPassport {
  food_id: Types.ObjectId;
  checkin_date: Date;
  image_url?: string;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string; // Hashed password
  current_rank: string;
  avatar?: string;
  food_passport: IUserPassport[];
  unlocked_provinces: string[]; // Danh sách tên tỉnh đã unlock (ví dụ: ["Hà Nội", "Thành phố Hồ Chí Minh"])
}

const PassportSchema = new Schema<IUserPassport>(
  {
    food_id: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
    checkin_date: { type: Date, required: true },
    image_url: String,
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 }, // Sẽ được hash trước khi lưu
    current_rank: { type: String, required: true, default: 'Khách vãng lai' },
    avatar: { type: String, default: '' },
    food_passport: { type: [PassportSchema], default: [] },
    unlocked_provinces: { type: [String], default: [] }, // Danh sách tên tỉnh đã unlock
  },
  { timestamps: true },
);

// Index để tìm kiếm nhanh theo username và email
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ 'food_passport.checkin_date': -1 });

UserSchema.index({ 'food_passport.checkin_date': -1 });

export const User = model<IUser>('User', UserSchema);
