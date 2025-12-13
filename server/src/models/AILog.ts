import { Schema, model, type Document, Types } from 'mongoose';

export interface IAIModelDetails {
  resnet?: string;
  vgg16?: string;
  custom_cnn?: string;
  efficientnet_v2?: string;
  color_histogram?: string;
}

export interface IAILog extends Document {
  user_id?: Types.ObjectId;
  upload_timestamp: Date;
  final_prediction: string;
  confidence?: number;
  model_details?: IAIModelDetails;
  genai_response?: string;
}

const ModelDetailsSchema = new Schema<IAIModelDetails>(
  {
    resnet: String,
    vgg16: String,
    custom_cnn: String,
    efficientnet_v2: String,
    color_histogram: String,
  },
  { _id: false },
);

const AILogSchema = new Schema<IAILog>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    upload_timestamp: { type: Date, required: true },
    final_prediction: { type: String, required: true },
    confidence: Number,
    model_details: ModelDetailsSchema,
    genai_response: String,
  },
  { timestamps: true },
);

AILogSchema.index({ user_id: 1, upload_timestamp: -1 });
AILogSchema.index({ final_prediction: 1 });

export const AILog = model<IAILog>('AILog', AILogSchema);

