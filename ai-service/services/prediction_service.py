"""
Prediction Service - Xử lý dự đoán và voting mechanism
"""

from typing import Dict, List, Any
from concurrent.futures import ThreadPoolExecutor
import asyncio
from collections import Counter
import numpy as np
import tensorflow as tf
from PIL import Image


class PredictionService:
    """Service để xử lý predictions và voting"""
    
    def __init__(self, max_workers: int = 3):
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.class_names = []  # Sẽ được set từ model_service
    
    async def predict_all_models(
        self, 
        original_image: Image.Image,
        models: Dict[str, tf.keras.Model],
        image_processor: Any
    ) -> Dict[str, Dict[str, Any]]:
        """
        Chạy tất cả models song song (parallel inference).
        Thời gian xử lý chỉ bằng thời gian của model chậm nhất.
        """
        # Tạo tasks cho tất cả models
        tasks = []
        for model_name, model in models.items():
            # InceptionV3 cần kích thước 299x299
            if model_name == "inception_v3":
                img = image_processor.preprocess_for_inception(original_image)
            else:
                img = image_processor.preprocess(original_image)
            
            tasks.append(
                self._predict_single_model(model_name, model, img)
            )
        
        # Chạy song song và đợi tất cả hoàn thành
        results = await asyncio.gather(*tasks)
        
        # Chuyển đổi kết quả thành dictionary
        predictions = {}
        for model_name, result in zip(models.keys(), results):
            predictions[model_name] = result
        
        return predictions
    
    async def _predict_single_model(
        self, 
        model_name: str, 
        model: tf.keras.Model, 
        image: np.ndarray
    ) -> Dict[str, Any]:
        """
        Chạy prediction cho một model.
        Chạy trong thread pool để không block event loop.
        """
        loop = asyncio.get_event_loop()
        
        # Chạy trong thread pool
        result = await loop.run_in_executor(
            self.executor,
            self._run_prediction,
            model_name,
            model,
            image
        )
        
        return result
    
    def _run_prediction(
        self, 
        model_name: str, 
        model: tf.keras.Model, 
        image: np.ndarray
    ) -> Dict[str, Any]:
        """
        Thực hiện prediction với Keras model.
        """
        try:
            # Chạy prediction
            predictions = model.predict(image, verbose=0)
            
            # Lấy prediction có confidence cao nhất
            if len(predictions.shape) > 1:
                # Nếu có nhiều outputs, lấy output đầu tiên
                pred_array = predictions[0]
            else:
                pred_array = predictions
            
            # Tìm class có confidence cao nhất
            class_idx = np.argmax(pred_array)
            confidence = float(pred_array[class_idx])
            
            # Lấy tên class
            if self.class_names and class_idx < len(self.class_names):
                prediction_name = self.class_names[class_idx]
            else:
                # Fallback: dùng index nếu chưa có class names
                prediction_name = f"class_{class_idx}"
            
            return {
                "prediction": prediction_name,
                "confidence": round(confidence, 4),
                "all_predictions": pred_array.tolist() if len(pred_array) < 100 else None,  # Chỉ trả về nếu không quá nhiều
            }
        except Exception as e:
            print(f"❌ Error in {model_name} prediction: {e}")
            import traceback
            traceback.print_exc()
            return {
                "prediction": "Unknown",
                "confidence": 0.0,
                "error": str(e)
            }
    
    def vote(self, predictions: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Voting mechanism: Chọn kết quả cuối cùng dựa trên majority vote.
        
        Args:
            predictions: Dict chứa predictions từ tất cả models
        
        Returns:
            {
                "prediction": "Tên món ăn thắng cuộc",
                "confidence": 0.98,
                "votes": {"Pho": 2, "Bun": 1},
                "total_models": 3
            }
        """
        # Đếm số vote cho mỗi prediction
        vote_counts = Counter()
        confidence_sum = {}
        
        for model_name, result in predictions.items():
            prediction = result.get("prediction", "Unknown")
            confidence = result.get("confidence", 0.0)
            
            # Bỏ qua nếu có lỗi
            if "error" in result:
                continue
            
            vote_counts[prediction] += 1
            if prediction not in confidence_sum:
                confidence_sum[prediction] = 0.0
            confidence_sum[prediction] += confidence
        
        # Chọn prediction có nhiều vote nhất
        if not vote_counts:
            return {
                "prediction": "Unknown",
                "confidence": 0.0,
                "votes": {},
                "total_models": len(predictions),
            }
        
        best_prediction = vote_counts.most_common(1)[0][0]
        num_votes = vote_counts[best_prediction]
        avg_confidence = confidence_sum[best_prediction] / num_votes
        
        return {
            "prediction": best_prediction,
            "confidence": round(avg_confidence, 4),
            "votes": dict(vote_counts),
            "total_models": len(predictions),
        }
    
    def set_class_names(self, class_names: list):
        """Set danh sách tên classes"""
        self.class_names = class_names
