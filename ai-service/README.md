# AI Service - FastAPI Microservice

AI Microservice xử lý nhận diện món ăn Việt Nam bằng 3 models song song (InceptionV3, ResNet152V2, VGG19).

## Cấu trúc

```
ai-service/
├── main.py                    # FastAPI app entry point
├── services/
│   ├── model_service.py       # Quản lý load/store models
│   └── prediction_service.py  # Xử lý predictions và voting
├── utils/
│   └── image_processor.py     # Preprocess ảnh
├── models/                     # Thư mục chứa model files (.keras)
│   ├── InceptionV3_models.keras
│   ├── ResNet152V2_models.keras
│   └── VGG19_models.keras
├── requirements.txt
└── README.md
```

## Cài đặt

```bash
# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Cài đặt dependencies
pip install -r requirements.txt
```

## Chạy service

```bash
# Development
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### POST `/predict`
Nhận ảnh món ăn và trả về kết quả dự đoán từ 3 models.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (image file)

**Response:**
```json
{
  "best_match": "Pho",
  "confidence": 0.95,
  "model_details": {
    "inception_v3": {"prediction": "Pho", "confidence": 0.95},
    "resnet152_v2": {"prediction": "Pho", "confidence": 0.92},
    "vgg19": {"prediction": "Pho", "confidence": 0.88}
  },
  "voting_result": {
    "prediction": "Pho",
    "confidence": 0.90,
    "votes": {"Pho": 3},
    "total_models": 3
  }
}
```

### GET `/health`
Health check endpoint.

### GET `/`
Root endpoint với thông tin service.

## Models

Service sử dụng 3 Keras models:
- **InceptionV3**: Input size 299x299
- **ResNet152V2**: Input size 224x224
- **VGG19**: Input size 224x224

Tất cả models được load vào RAM khi server khởi động để tối ưu performance.

## Tối ưu hóa

1. **Warm Start**: Models được load vào RAM khi server khởi động, loại bỏ cold start
2. **Parallel Inference**: 3 models chạy song song bằng ThreadPoolExecutor
3. **In-Memory Processing**: Ảnh được xử lý trong RAM, không ghi ra đĩa
4. **Voting Mechanism**: Kết quả cuối cùng được chọn bằng majority vote từ 3 models

## Tích hợp với Node.js Backend

Node.js backend sẽ gọi API này:

```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:8000/predict', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
```

## Class Names

Models trả về class index. Để map index sang tên món ăn, cần:
1. Tạo file `class_names.json` trong thư mục `models/` với format:
```json
["Pho", "Bun Bo Hue", "Banh Mi", ...]
```
2. Load class names trong `model_service.py` khi khởi động

## Troubleshooting

### Model không load được
- Kiểm tra file model có trong thư mục `models/` không
- Kiểm tra TensorFlow version tương thích
- Xem logs để biết lỗi cụ thể

### Prediction lỗi
- Kiểm tra ảnh input có đúng format không (RGB, valid image)
- Kiểm tra model output shape có đúng không
- Xem logs để biết lỗi cụ thể
