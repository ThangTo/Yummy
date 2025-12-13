import { Schema, model, type Document, Types } from 'mongoose';

export interface IUserPassport {
  food_id: Types.ObjectId;
  checkin_date: Date;
  image_url?: string;
}

export interface IUser extends Document {
  email: string;
  current_rank: string;
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
    email: { type: String, required: true, unique: true },
    current_rank: { type: String, required: true, default: 'Khách vãng lai' },
    food_passport: { type: [PassportSchema], default: [] },
    unlocked_provinces: { type: [String], default: [] }, // Danh sách tên tỉnh đã unlock
  },
  { timestamps: true },
);

UserSchema.index({ 'food_passport.checkin_date': -1 });

export const User = model<IUser>('User', UserSchema);

