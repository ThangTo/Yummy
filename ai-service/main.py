"""
AI Service - FastAPI Microservice
Xử lý ảnh món ăn bằng 3 models song song (InceptionV3, ResNet152V2, VGG19)
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
from typing import Dict, List
import uvicorn
import numpy as np

from services.model_service import ModelService
from services.prediction_service import PredictionService
from utils.image_processor import ImageProcessor

app = FastAPI(
    title="Yummy AI Service",
    description="AI Microservice for Vietnamese Food Recognition",
    version="1.0.0",
)

# CORS middleware để cho phép Node.js backend gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong production nên giới hạn origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo services
model_service = ModelService()
prediction_service = PredictionService()
image_processor = ImageProcessor()


@app.on_event("startup")
async def load_models():
    """
    Load tất cả 3 models vào RAM khi server khởi động.
    Đây là kỹ thuật tối ưu Performance quan trọng nhất - loại bỏ Cold Start.
    """
    print("🚀 System: Đang nạp 3 Models vào bộ nhớ...")
    try:
        await model_service.load_all_models()
        print(f"✅ System: Đã load {len(model_service.models)} models. Sẵn sàng phục vụ!")
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        import traceback
        traceback.print_exc()
        raise


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "service": "Yummy AI Service",
        "models_loaded": model_service.models_loaded(),
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "models": model_service.get_models_status(),
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Nhận ảnh món ăn và chạy 3 models song song để dự đoán.
    
    Args:
        file: Ảnh món ăn (multipart/form-data)
    
    Returns:
        {
            "best_match": "Tên món ăn",
            "confidence": 0.98,
            "model_details": {
                "inception_v3": {"prediction": "Pho", "confidence": 0.95},
                "resnet152_v2": {"prediction": "Pho", "confidence": 0.92},
                "vgg19": {"prediction": "Pho", "confidence": 0.88},
            },
            "voting_result": {...}
        }
    """
    try:
        # 1. Đọc ảnh từ RAM (không ghi ra đĩa để tối ưu I/O)
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # 2. Chạy 3 models song song (parallel inference)
        # Image sẽ được preprocess riêng cho từng model trong prediction_service
        predictions = await prediction_service.predict_all_models(
            image,  # Truyền PIL Image gốc
            model_service.models,
            image_processor
        )
        
        # 4. Voting mechanism để chọn kết quả cuối cùng
        voting_result = prediction_service.vote(predictions)
        
        # 5. Format response để match với backend expectation
        model_details_formatted = {}
        for model_name, result in predictions.items():
            model_details_formatted[model_name] = {
                "prediction": result.get("prediction", "Unknown"),
                "confidence": result.get("confidence", 0.0)
            }
        
        return {
            "best_match": voting_result["prediction"],
            "confidence": voting_result["confidence"],
            "model_details": model_details_formatted,
            "voting_result": voting_result,
        }
        
    except Exception as e:
        print(f"❌ Error in predict: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

