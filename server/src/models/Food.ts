import { Schema, model, type Document } from 'mongoose';

export interface IFood extends Document {
  name_key: string;
  name_vi: string;
  province_name: string; // Tên tỉnh/thành phố (ví dụ: "Hà Nội", "Thành phố Hồ Chí Minh")
  location_coords?: { lat: number; lng: number };
  how_to_eat?: string;
  story?: string;
  image?: string; // URL ảnh chuẩn của món ăn
}

const FoodSchema = new Schema<IFood>(
  {
    name_key: { type: String, required: true, unique: true },
    name_vi: { type: String, required: true },
    province_name: { type: String, required: true, index: true }, // Index để query theo tỉnh
    location_coords: {
      lat: Number,
      lng: Number,
    },
    how_to_eat: String,
    story: String,
    image: String, // URL ảnh chuẩn của món ăn
  },
  { timestamps: true },
);

export const Food = model<IFood>('Food', FoodSchema);
