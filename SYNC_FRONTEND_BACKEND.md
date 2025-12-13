# Đồng bộ Frontend và Backend

## Tổng quan

Tài liệu này mô tả cách frontend và backend đồng bộ với nhau về data structure và API endpoints.

---

## 1. API Endpoints

### Scan Ảnh Món Ăn

**Frontend:** `client/services/api.ts` → `scanFood(imageUri, userId?)`

**Backend:** `POST /api/scan`

**Request:**
- `multipart/form-data`
- `file`: Image file
- `user_id`: Optional

**Response:**
```typescript
{
  food: {
    _id: string;
    name_key: string;
    name_vi: string;
    province_name: string;
    how_to_eat?: string;
    genai_prompt_seed?: string;
  };
  ai_council: {
    best_match: string;
    confidence: number;
    model_details: {
      [modelName: string]: {
        prediction: string;
        confidence: number;
      };
    };
    voting_result: {
      prediction: string;
      confidence: number;
      votes: { [prediction: string]: number };
      total_models: number;
    };
  };
  image_url?: string;
}
```

**Frontend sử dụng:**
- `ai-council.tsx`: Hiển thị kết quả từ 5 models
- `culture-card.tsx`: Hiển thị thông tin món ăn

---

### User Passport

**Frontend:** `client/services/api.ts` → `getUserPassport(userId)`

**Backend:** `GET /api/users/:id/passport`

**Response:**
```typescript
{
  food_passport: Array<{
    food_id: string;
    checkin_date: string; // ISO string
    image_url?: string;
  }>;
  unlocked_provinces: string[]; // ["Hà Nội", "Thành phố Hồ Chí Minh"]
  current_rank: string; // "Thổ địa Hà Thành"
  progress: {
    current: number; // Số món đã ăn
    next_rank: {
      name: string; // "Vua Ẩm Thực Việt"
      target: number; // 50
    };
  };
  recent_foods: Array<{
    id: string;
    name: string;
    location: string; // Tên tỉnh
    province_name: string;
    image: string;
    tag?: string; // "Mới mở khóa"
  }>;
}
```

**Frontend sử dụng:**
- `explore.tsx`: Hiển thị map với unlocked provinces, progress, recent foods
- `profile.tsx`: Hiển thị stats, achievements

---

### Check-in Món Ăn

**Frontend:** `client/services/api.ts` → `checkIn(userId, foodId, imageUrl?, provinceName?)`

**Backend:** `POST /api/users/:id/checkin`

**Request:**
```json
{
  "food_id": "string",
  "image_url": "string (optional)",
  "province_name": "string (optional)"
}
```

**Response:**
```json
{
  "ok": true
}
```

**Frontend sử dụng:**
- Sau khi scan xong, tự động check-in và unlock tỉnh

---

### Culture Card

**Frontend:** `client/services/api.ts` → `getCultureCard(foodId)`

**Backend:** `GET /api/culture/:foodId`

**Response:**
```typescript
{
  food_id: string;
  name_key: string;
  name_vi: string;
  province_name: string;
  story: string; // Câu chuyện văn hóa từ GenAI
  how_to_eat?: string;
  pronunciation?: string;
}
```

**Frontend sử dụng:**
- `culture-card.tsx`: Hiển thị story, how_to_eat

---

### Get Foods by Province

**Frontend:** `client/services/api.ts` → `getFoodsByProvince(provinceName?)`

**Backend:** `GET /api/foods?province_name=...`

**Response:**
```typescript
Array<{
  _id: string;
  name_key: string;
  name_vi: string;
  province_name: string;
  how_to_eat?: string;
  genai_prompt_seed?: string;
}>
```

---

## 2. Data Structure Mapping

### AI Council

**Backend trả về:**
```typescript
{
  best_match: "Pho",
  confidence: 0.95,
  model_details: {
    resnet: { prediction: "Pho", confidence: 0.95 },
    vgg16: { prediction: "Pho", confidence: 0.92 },
    ...
  }
}
```

**Frontend hiển thị:**
```typescript
[
  {
    name: "ResNet-50",
    quote: "Kết cấu sợi phở...",
    score: "95%",
    result: "Phở Bò",
    state: "ok"
  },
  ...
]
```

**Conversion:** `apiService.convertAICouncilToUI()` tự động convert

---

### Unlocked Provinces

**Backend:** `unlocked_provinces: string[]` (ví dụ: `["Hà Nội", "Thành phố Hồ Chí Minh"]`)

**Frontend:** 
- `explore.tsx`: Truyền vào `VietnamMap` component
- `VietnamMap`: So sánh với tên tỉnh trong GeoJSON để highlight

**Normalization:** `normalizeProvinceName()` để so sánh (bỏ dấu, bỏ tiền tố)

---

### Progress & Rank

**Backend tính toán:**
```typescript
progress: {
  current: 12, // Số món đã ăn
  next_rank: {
    name: "Vua Ẩm Thực Việt",
    target: 50
  }
}
```

**Frontend hiển thị:**
- Progress bar: `(current / target) * 100`
- Rank title: `current_rank`
- Hint: "Mở khóa thêm X món để đạt danh hiệu Y"

---

## 3. Luồng xử lý Scan

```
1. User chụp ảnh (ai-food-mode.tsx)
   ↓
2. Gọi apiService.scanFood(imageUri, userId)
   ↓
3. Backend: POST /api/scan
   - Multer xử lý file upload
   - Gọi FastAPI service (/predict)
   - Lấy food info từ DB
   - Lưu AI log
   ↓
4. Trả về: { food, ai_council }
   ↓
5. Frontend:
   - Navigate đến ai-council.tsx (hiển thị kết quả)
   - Sau đó navigate đến culture-card.tsx
   - Tự động check-in và unlock tỉnh
```

---

## 4. Checklist Đồng Bộ

### ✅ Đã đồng bộ:

- [x] Scan endpoint trả về đúng format
- [x] User passport trả về progress, recent_foods
- [x] Unlocked provinces format
- [x] AI Council response format
- [x] Culture card endpoint
- [x] API service trong frontend

### ⚠️ Cần lưu ý:

- [ ] Tên tỉnh phải match giữa DB và GeoJSON
- [ ] name_key phải match với AI prediction
- [ ] Image URLs cần được lưu và trả về đúng format
- [ ] GenAI story cần được implement (hiện tại mock)

---

## 5. Environment Variables

**Frontend (.env):**
```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

**Backend (.env):**
```env
PORT=4000
MONGO_URI=...
AI_SERVICE_URL=http://localhost:8000
```

---

## 6. Testing

### Test Scan:
```bash
curl -X POST http://localhost:4000/api/scan \
  -F "file=@image.jpg" \
  -F "user_id=user123"
```

### Test Passport:
```bash
curl http://localhost:4000/api/users/user123/passport
```

### Test Culture Card:
```bash
curl http://localhost:4000/api/culture/food123
```

