import { Schema, model, type Document } from 'mongoose';

export interface IFood extends Document {
  name_key: string;
  name_vi: string;
  region_key: string;
  location_coords?: { lat: number; lng: number };
  how_to_eat?: string;
  genai_prompt_seed?: string;
}

const FoodSchema = new Schema<IFood>(
  {
    name_key: { type: String, required: true, unique: true },
    name_vi: { type: String, required: true },
    region_key: { type: String, required: true, index: true },
    location_coords: {
      lat: Number,
      lng: Number,
    },
    how_to_eat: String,
    genai_prompt_seed: String,
  },
  { timestamps: true },
);

export const Food = model<IFood>('Food', FoodSchema);

