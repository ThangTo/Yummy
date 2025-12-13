# Tích hợp FastAPI với Node.js Backend

## Luồng xử lý

```
Mobile App (React Native)
    ↓ POST /api/scan (multipart/form-data)
Node.js Backend (Express)
    ↓ POST /predict (stream image)
FastAPI Service (Python)
    ↓ Parallel Inference (5 models)
    ↓ Voting Mechanism
    ↓ Return result
Node.js Backend
    ↓ Enrich với Gemini API (optional)
    ↓ Save to database
    ↓ Return to Mobile App
```

## Cấu hình

### 1. Environment Variables

**Node.js Backend** (`.env`):
```env
AI_SERVICE_URL=http://localhost:8000
PORT=4000
MONGO_URI=...
```

**FastAPI Service** (`.env`):
```env
PORT=8000
MODELS_PATH=./models
```

### 2. Khởi động services

**Terminal 1 - FastAPI:**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Node.js:**
```bash
cd server
npm install
npm run dev
```

## API Usage

### Mobile App → Node.js Backend

```typescript
const formData = new FormData();
formData.append('file', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'food.jpg',
});
formData.append('user_id', userId);

const response = await fetch('http://localhost:4000/api/scan', {
  method: 'POST',
  body: formData,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const result = await response.json();
// {
//   food: { _id, name_key, name_vi, province_name, ... },
//   ai_council: { best_match, confidence, model_details, ... }
// }
```

### Node.js → FastAPI

```typescript
// Đã được implement trong aiService.ts
const aiService = new AIService();
const result = await aiService.predictFood(imageBuffer, 'image.jpg');
```

## Testing

### Test FastAPI trực tiếp:

```bash
curl -X POST "http://localhost:8000/predict" \
  -F "file=@path/to/image.jpg"
```

### Test qua Node.js:

```bash
curl -X POST "http://localhost:4000/api/scan" \
  -F "file=@path/to/image.jpg" \
  -F "user_id=user123"
```

