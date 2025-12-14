# Luồng hoạt động: Backend Node.js → AI Model

## Tổng quan

Hệ thống sử dụng kiến trúc microservice với 2 services:
1. **Node.js Backend** (Port 4000/5000) - Xử lý HTTP requests, database, business logic
2. **FastAPI AI Service** (Port 8000) - Xử lý AI predictions với multiple models

---

## Luồng hoạt động chi tiết

### 1. Client gửi request (React Native)

```
Client (React Native)
  ↓
POST /api/scan
Body: multipart/form-data
  - file: [Image Buffer]
  - user_id: (optional)
```

**File:** `client/services/api.ts`
- Tạo FormData với image URI
- Gửi POST request đến `http://192.168.1.29:5000/api/scan`

---

### 2. Node.js Backend nhận request

**File:** `server/src/routes/scan.routes.ts`

```
POST /api/scan
  ↓
Multer Middleware (upload.single('file'))
  ↓
Parse multipart/form-data
  ↓
req.file.buffer = Image Buffer
req.body.user_id = User ID (optional)
```

**Multer config:**
- Storage: `memoryStorage()` - Lưu file trong RAM
- Limit: 10MB
- Filter: Chỉ chấp nhận image files

---

### 3. Scan Controller xử lý

**File:** `server/src/controllers/scan.controller.ts`

#### 3.1. Validate request
```typescript
if (!req.file) {
  return 400 error
}
```

#### 3.2. Gọi AI Service
```typescript
const aiResult = await aiService.predictFood(
  imageBuffer,  // Buffer từ multer
  filename      // Tên file
)
```

---

### 4. AI Service gửi request đến FastAPI

**File:** `server/src/services/ai.service.ts`

#### 4.1. Tạo FormData
```typescript
const formData = new FormData()
formData.append('file', imageBuffer, {
  filename,
  contentType: 'image/jpeg'
})
```

#### 4.2. Gửi HTTP request
```typescript
POST http://localhost:8000/predict
Headers: multipart/form-data (tự động)
Body: FormData với image buffer
```

**Axios config:**
- Base URL: `http://localhost:8000` (hoặc từ env `AI_SERVICE_URL`)
- Timeout: 30 seconds
- Max content length: Infinity

---

### 5. FastAPI Service nhận request

**File:** `ai-service/main.py`

#### 5.1. Endpoint `/predict`
```python
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
```

#### 5.2. Đọc ảnh
```python
image_bytes = await file.read()  # Đọc từ RAM
image = Image.open(io.BytesIO(image_bytes))  # PIL Image
```

**Lưu ý:** Không ghi ra đĩa để tối ưu I/O

---

### 6. Model Service - Load models

**File:** `ai-service/services/model_service.py`

#### 6.1. Startup event (khi server khởi động)
```python
@app.on_event("startup")
async def load_models():
    await model_service.load_all_models()
```

#### 6.2. Load models vào RAM
```python
models = {
    "inception_v3": tf.keras.models.load_model("models/InceptionV3_models.keras"),
    "resnet152_v2": tf.keras.models.load_model("models/ResNet152V2_models.keras"),
    "vgg19": tf.keras.models.load_model("models/VGG19_models.keras"),
}
```

**Lợi ích:**
- Loại bỏ cold start
- Models sẵn sàng trong RAM
- Tăng tốc inference

---

### 7. Prediction Service - Parallel Inference

**File:** `ai-service/services/prediction_service.py`

#### 7.1. Chạy tất cả models song song
```python
predictions = await prediction_service.predict_all_models(
    image,              # PIL Image gốc
    model_service.models,  # Dict chứa 3 models
    image_processor      # Preprocessing
)
```

#### 7.2. Preprocessing cho từng model
```python
# InceptionV3 cần 299x299
if model_name == "inception_v3":
    img = image_processor.preprocess_for_inception(image)
else:
    img = image_processor.preprocess(image)  # 224x224
```

#### 7.3. Parallel execution
```python
tasks = [
    _predict_single_model("inception_v3", model, img),
    _predict_single_model("resnet152_v2", model, img),
    _predict_single_model("vgg19", model, img),
]
results = await asyncio.gather(*tasks)  # Chạy song song
```

**Thread Pool:**
- Sử dụng `ThreadPoolExecutor` để không block event loop
- Max workers: 3 (một cho mỗi model)

#### 7.4. Chạy prediction
```python
def _run_prediction(model, image):
    predictions = model.predict(image, verbose=0)
    class_idx = np.argmax(predictions[0])
    confidence = float(predictions[0][class_idx])
    prediction_name = class_names[class_idx]
    
    return {
        "prediction": prediction_name,
        "confidence": confidence
    }
```

---

### 8. Voting Mechanism

**File:** `ai-service/services/prediction_service.py`

#### 8.1. Đếm votes
```python
vote_counts = Counter()
confidence_sum = {}

for model_name, result in predictions.items():
    prediction = result["prediction"]
    confidence = result["confidence"]
    vote_counts[prediction] += 1
    confidence_sum[prediction] += confidence
```

#### 8.2. Chọn kết quả
```python
best_prediction = vote_counts.most_common(1)[0][0]  # Nhiều vote nhất
num_votes = vote_counts[best_prediction]
avg_confidence = confidence_sum[best_prediction] / num_votes
```

**Ví dụ:**
- InceptionV3: "Pho" (confidence: 0.95)
- ResNet152V2: "Pho" (confidence: 0.92)
- VGG19: "Bun" (confidence: 0.88)

→ Kết quả: "Pho" (2 votes, avg confidence: 0.935)

---

### 9. FastAPI trả về response

**File:** `ai-service/main.py`

```python
return {
    "best_match": voting_result["prediction"],  # "Pho"
    "confidence": voting_result["confidence"],   # 0.935
    "model_details": {
        "inception_v3": {"prediction": "Pho", "confidence": 0.95},
        "resnet152_v2": {"prediction": "Pho", "confidence": 0.92},
        "vgg19": {"prediction": "Bun", "confidence": 0.88},
    },
    "voting_result": {
        "prediction": "Pho",
        "confidence": 0.935,
        "votes": {"Pho": 2, "Bun": 1},
        "total_models": 3
    }
}
```

---

### 10. Node.js Backend nhận kết quả

**File:** `server/src/controllers/scan.controller.ts`

#### 10.1. Tìm món ăn trong database
```typescript
// Thử exact match
let food = await foodService.getFoodByNameKey(aiResult.best_match);

// Nếu không tìm thấy, thử case-insensitive
if (!food) {
  const allFoods = await foodService.getFoods();
  food = allFoods.find(
    f => f.name_key.toLowerCase() === aiResult.best_match.toLowerCase()
  );
}
```

#### 10.2. Lưu AI log (nếu có user_id)
```typescript
if (user_id) {
  await aiLogService.createLog({
    user_id,
    upload_timestamp: new Date(),
    final_prediction: aiResult.best_match,
    confidence: aiResult.confidence,
    model_details: {...}
  });
}
```

#### 10.3. Trả về response
```typescript
res.json({
  food: {
    _id: food._id,
    name_key: food.name_key,
    name_vi: food.name_vi,
    province_name: food.province_name,
    how_to_eat: food.how_to_eat,
    genai_prompt_seed: food.genai_prompt_seed,
  },
  ai_council: {
    best_match: aiResult.best_match,
    confidence: aiResult.confidence,
    model_details: aiResult.model_details,
    voting_result: aiResult.voting_result,
  }
});
```

---

### 11. Client nhận response

**File:** `client/services/api.ts`

```typescript
const scanResult = await apiService.scanFood(photo.uri);
// scanResult = {
//   food: {...},
//   ai_council: {...}
// }
```

**File:** `client/app/ai-food-mode.tsx`

```typescript
// Navigate đến màn hình kết quả
router.push({
  pathname: '/ai-council',
  params: {
    scanResult: JSON.stringify(scanResult),
    imageUri: photo.uri,
  },
});
```

---

## Sơ đồ luồng

```
┌─────────────────┐
│  React Native   │
│     Client      │
└────────┬────────┘
         │ POST /api/scan (multipart/form-data)
         ↓
┌─────────────────┐
│  Node.js Server │
│   (Port 5000)   │
│                 │
│ 1. Multer       │ ← Parse multipart/form-data
│ 2. ScanController│
│ 3. AIService    │ ← Gọi FastAPI
└────────┬────────┘
         │ POST /predict (multipart/form-data)
         ↓
┌─────────────────┐
│  FastAPI Server │
│   (Port 8000)   │
│                 │
│ 1. Load Models  │ ← Startup: Load vào RAM
│ 2. Preprocess   │ ← Image preprocessing
│ 3. Parallel     │ ← Chạy 3 models song song
│    Inference    │
│ 4. Voting       │ ← Chọn kết quả
└────────┬────────┘
         │ Response: {best_match, confidence, ...}
         ↓
┌─────────────────┐
│  Node.js Server │
│                 │
│ 1. Find Food    │ ← Tìm trong MongoDB
│ 2. Save Log     │ ← Lưu AI log
│ 3. Return       │ ← Trả về kết quả
└────────┬────────┘
         │ Response: {food, ai_council}
         ↓
┌─────────────────┐
│  React Native   │
│     Client      │
│                 │
│ Navigate to     │ ← Hiển thị kết quả
│ /ai-council     │
└─────────────────┘
```

---

## Các điểm tối ưu

### 1. **Warm Start (Model Loading)**
- Models được load vào RAM khi server khởi động
- Loại bỏ cold start latency
- **File:** `ai-service/main.py` - `@app.on_event("startup")`

### 2. **Parallel Inference**
- 3 models chạy song song thay vì tuần tự
- Thời gian = thời gian của model chậm nhất (không phải tổng)
- **File:** `ai-service/services/prediction_service.py` - `asyncio.gather()`

### 3. **Memory Storage**
- Multer dùng `memoryStorage()` - không ghi ra đĩa
- FastAPI đọc ảnh từ RAM - không ghi ra đĩa
- Giảm I/O overhead

### 4. **Thread Pool**
- Sử dụng `ThreadPoolExecutor` để không block event loop
- Cho phép xử lý nhiều requests đồng thời

### 5. **Voting Mechanism**
- Majority vote từ 3 models
- Tính confidence trung bình
- Tăng độ chính xác

---

## Error Handling

### Node.js Backend
- Multer validation: Chỉ chấp nhận image files
- AI Service error: Catch và trả về error message
- Database error: Trả về 404 nếu không tìm thấy food

### FastAPI Service
- Image processing error: HTTPException 500
- Model prediction error: Trả về "Unknown" với confidence 0.0
- Voting: Bỏ qua models có error

---

## Dependencies

### Node.js Backend
- `multer` - File upload handling
- `axios` - HTTP client để gọi FastAPI
- `form-data` - Tạo FormData cho multipart requests

### FastAPI Service
- `fastapi` - Web framework
- `tensorflow` - AI models
- `PIL` (Pillow) - Image processing
- `numpy` - Array operations
- `asyncio` - Async/await support
- `concurrent.futures` - Thread pool

---

## Environment Variables

### Node.js Backend
- `AI_SERVICE_URL` - URL của FastAPI service (default: `http://localhost:8000`)
- `PORT` - Port của Node.js server (default: 4000 hoặc 5000)

### FastAPI Service
- `PORT` - Port của FastAPI service (default: 8000)

---

## Performance Metrics

### Thời gian xử lý ước tính:
1. **Network (Client → Node.js)**: ~100-500ms
2. **Multer parsing**: ~10-50ms
3. **Network (Node.js → FastAPI)**: ~10-50ms
4. **Image preprocessing**: ~50-100ms
5. **Parallel inference**: ~500-2000ms (model chậm nhất)
6. **Voting**: ~1-5ms
7. **Database lookup**: ~10-50ms
8. **Network (Node.js → Client)**: ~100-500ms

**Tổng:** ~800-3200ms (0.8-3.2 giây)

### Tối ưu đã áp dụng:
- ✅ Warm start: -2000ms (không cần load model mỗi request)
- ✅ Parallel inference: -1000ms (thay vì tuần tự)
- ✅ Memory storage: -50ms (không ghi/đọc đĩa)

**Tổng sau tối ưu:** ~800-1200ms (0.8-1.2 giây)

