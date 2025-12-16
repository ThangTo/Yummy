"""
AI Service - FastAPI Microservice
Xử lý ảnh món ăn bằng nhiều models song song
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
    Load tất cả models vào RAM khi server khởi động.
    Đây là kỹ thuật tối ưu Performance quan trọng nhất - loại bỏ Cold Start.
    """
    print("🚀 System: Đang nạp Models vào bộ nhớ...")
    try:
        await model_service.load_all_models()
        loaded_models = len(model_service.models)
        print(f"✅ System: Đã load {loaded_models} models. Sẵn sàng phục vụ!")
        
        # Log danh sách models đã load thành công
        if loaded_models > 0:
            print(f"📋 Available models: {', '.join(model_service.models.keys())}")
        else:
            print("⚠️  Warning: No models loaded! Server may not function correctly.")
    except RuntimeError as e:
        # RuntimeError được raise khi không có model nào load được
        print(f"❌ Critical: {e}")
        print("⚠️  Server will start but prediction endpoints may not work.")
        import traceback
        traceback.print_exc()
        # Không raise để server vẫn có thể start (để check health endpoint)
    except Exception as e:
        print(f"❌ Unexpected error loading models: {e}")
        import traceback
        traceback.print_exc()
        # Không raise để server vẫn có thể start
        print("⚠️  Server will start but some models may not be available.")


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
    Nhận ảnh món ăn và chạy tất cả models song song để dự đoán.
    
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
                "inception_resnet_v2": {"prediction": "Pho", "confidence": 0.96},
                "xception": {"prediction": "Pho", "confidence": 0.94},
            },
            "voting_result": {...}
        }
    """
    try:
        # 1. Đọc ảnh từ RAM (không ghi ra đĩa để tối ưu I/O)
        image_bytes = await file.read()
        
        # Verify image bytes không rỗng
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        print(f"📸 Received image - Size: {len(image_bytes)} bytes, Content-Type: {file.content_type}, Filename: {file.filename}")
        
        # Kiểm tra magic bytes để verify image format
        # JPEG: FF D8 FF
        # PNG: 89 50 4E 47
        # GIF: 47 49 46 38
        magic_bytes = image_bytes[:4]
        is_jpeg = magic_bytes[:3] == b'\xff\xd8\xff'
        is_png = magic_bytes[:4] == b'\x89PNG'
        is_gif = magic_bytes[:4] == b'GIF8'
        
        if not (is_jpeg or is_png or is_gif):
            print(f"⚠️ Unknown image format - Magic bytes: {magic_bytes.hex()}")
            print(f"   First 20 bytes (hex): {image_bytes[:20].hex()}")
        
        # Thử mở image với error handling tốt hơn
        try:
            image = Image.open(io.BytesIO(image_bytes))
            # Verify image format
            image.verify()
            # Reset image sau khi verify (verify() đóng image)
            image = Image.open(io.BytesIO(image_bytes))
            print(f"✅ Image opened successfully - Format: {image.format}, Size: {image.size}")
        except Exception as e:
            print(f"❌ Error opening image: {type(e).__name__}: {e}")
            print(f"   Magic bytes (hex): {magic_bytes.hex()}")
            print(f"   First 100 bytes (hex): {image_bytes[:100].hex()}")
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid image format: {str(e)}"
            )
        
        # 2. Kiểm tra có models không
        if not model_service.models or len(model_service.models) == 0:
            raise HTTPException(
                status_code=503,
                detail="No models available. Please check server logs for model loading errors."
            )
        
        # 3. Đảm bảo prediction_service có class names
        if not prediction_service.class_names and model_service.class_names:
            prediction_service.set_class_names(model_service.class_names)
        
        # 4. Chạy tất cả models song song (parallel inference)
        # Image sẽ được preprocess riêng cho từng model trong prediction_service
        predictions = await prediction_service.predict_all_models(
            image,  # Truyền PIL Image gốc
            model_service.models,
            image_processor
        )
        
        # 5. Voting mechanism để chọn kết quả cuối cùng
        voting_result = prediction_service.vote(predictions)
        
        # 6. Format response để match với backend expectation
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

