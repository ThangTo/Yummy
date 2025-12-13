# Cấu trúc Project Yummy

## Tổng quan

Project được tổ chức theo kiến trúc **Microservices** với 3 thành phần chính:

```
Yummy/
├── client/          # React Native App (Expo)
├── server/          # Node.js Backend (Express)
└── ai-service/      # Python FastAPI Service (AI Models)
```

## Chi tiết từng thành phần

### 1. Client (React Native - Expo)

**Vị trí:** `client/`

**Công nghệ:**
- React Native (Expo)
- Expo Router (file-based routing)
- TypeScript

**Cấu trúc:**
```
client/
├── app/                    # Routes (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   ├── ai-food-mode.tsx   # Camera screen
│   ├── ai-council.tsx     # AI Council results
│   ├── culture-card.tsx   # Culture card
│   └── login.tsx          # Login screen
├── components/
│   └── VietnamMap.tsx     # Map component với provinces
├── utils/
│   └── geojsonLoader.ts   # Load provinces GeoJSON
└── assets/
    └── data/
        └── vietnam_provinces.json  # Tọa độ các tỉnh
```

**Chức năng:**
- UI/UX cho mobile app
- Camera để chụp ảnh món ăn
- Hiển thị map với unlock theo tỉnh
- Giao tiếp với Node.js backend

---

### 2. Server (Node.js - Express)

**Vị trí:** `server/`

**Công nghệ:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose

**Cấu trúc:**
```
server/src/
├── routes/          # Route definitions
│   ├── foods.ts
│   ├── users.ts
│   ├── aiLogs.ts
│   └── scan.ts      # Scan ảnh endpoint
├── controllers/      # Request/Response handling
│   ├── foodController.ts
│   ├── userController.ts
│   ├── aiLogController.ts
│   └── scanController.ts
├── services/         # Business logic
│   ├── foodService.ts
│   ├── userService.ts
│   ├── aiLogService.ts
│   └── aiService.ts  # Gọi FastAPI service
└── models/           # Mongoose schemas
    ├── Food.ts
    ├── User.ts
    └── AILog.ts
```

**Chức năng:**
- API Gateway cho mobile app
- Quản lý users, foods, logs
- Gọi FastAPI service để xử lý ảnh
- Tích hợp Gemini API (GenAI)

**API Endpoints:**
- `GET /api/foods?province_name=...` - Lấy món ăn theo tỉnh
- `GET /api/users/:id/passport` - Lấy passport của user
- `POST /api/users/:id/checkin` - Check-in món ăn
- `POST /api/scan` - Scan ảnh món ăn (gọi FastAPI)

---

### 3. AI Service (Python - FastAPI)

**Vị trí:** `ai-service/`

**Công nghệ:**
- Python + FastAPI
- PyTorch (cho models)
- ThreadPoolExecutor (parallel inference)

**Cấu trúc:**
```
ai-service/
├── main.py                    # FastAPI app
├── services/
│   ├── model_service.py       # Load/store models
│   └── prediction_service.py  # Predictions + Voting
├── utils/
│   └── image_processor.py     # Preprocess ảnh
└── models/                     # Model files (.pth)
```

**Chức năng:**
- Load 5 models vào RAM khi startup (warm start)
- Chạy 5 models song song (parallel inference)
- Voting mechanism để chọn kết quả cuối cùng
- Trả về predictions từ tất cả models

**API Endpoints:**
- `POST /predict` - Nhận ảnh, trả về predictions
- `GET /health` - Health check
- `GET /` - Service info

---

## Luồng xử lý Scan Ảnh

```
1. Mobile App
   ↓ POST /api/scan (multipart/form-data)
   
2. Node.js Backend
   ↓ Multer xử lý file upload
   ↓ POST /predict (stream image)
   
3. FastAPI Service
   ↓ Load models từ RAM (warm)
   ↓ Parallel inference (5 models)
   ↓ Voting mechanism
   ↓ Return predictions
   
4. Node.js Backend
   ↓ Lấy thông tin food từ DB
   ↓ Lưu AI log
   ↓ Return kết quả tổng hợp
   
5. Mobile App
   ↓ Hiển thị AI Council results
   ↓ Hiển thị Culture Card
```

---

## Cách chạy

### 1. Client (Mobile App)
```bash
cd client
npm install
npm start
```

### 2. Server (Node.js)
```bash
cd server
npm install
npm run dev
# Chạy trên http://localhost:4000
```

### 3. AI Service (FastAPI)
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## Environment Variables

### Server (.env)
```env
PORT=4000
MONGO_URI=mongodb://...
AI_SERVICE_URL=http://localhost:8000
```

### AI Service (.env)
```env
PORT=8000
MODELS_PATH=./models
```

---

## Database Schema

### Foods Collection
- `name_key`: Key nội bộ (ví dụ: "Pho_Bo")
- `name_vi`: Tên tiếng Việt
- `province_name`: Tên tỉnh (ví dụ: "Hà Nội")

### Users Collection
- `email`: Email đăng nhập
- `current_rank`: Cấp bậc hiện tại
- `food_passport`: Danh sách món đã check-in
- `unlocked_provinces`: Danh sách tỉnh đã unlock

### AILogs Collection
- `user_id`: ID user
- `final_prediction`: Kết quả cuối cùng
- `model_details`: Chi tiết từ 5 models
- `genai_response`: Nội dung từ Gemini

