"""
Model Service - Quản lý việc load và lưu trữ models
"""

from typing import Dict, Optional
from pathlib import Path
import tensorflow as tf
import numpy as np


class ModelService:
    """Service để quản lý các AI models"""
    
    def __init__(self):
        self.models: Dict[str, tf.keras.Model] = {}
        self.models_path = Path("models")  # Thư mục chứa các model files
        self.class_names = []  # Sẽ được load từ model hoặc config
        
    async def load_all_models(self):
        """
        Load tất cả 3 models vào RAM.
        Models sẽ được giữ trong RAM để tránh cold start.
        """
        model_files = {
            "inception_v3": "InceptionV3_models.keras",
            "resnet152_v2": "ResNet152V2_models.keras",
            "vgg19": "VGG19_models.keras",
        }
        
        for model_name, model_file in model_files.items():
            try:
                model_path = self.models_path / model_file
                if model_path.exists():
                    print(f"🔄 Loading {model_name} from {model_path}...")
                    # Load Keras model
                    model = tf.keras.models.load_model(str(model_path))
                    self.models[model_name] = model
                    print(f"✅ Loaded {model_name} successfully")
                    
                    # Lấy số classes từ model output shape
                    if not self.class_names:
                        output_shape = model.output_shape
                        if isinstance(output_shape, list):
                            output_shape = output_shape[0]
                        if output_shape and len(output_shape) > 1:
                            num_classes = output_shape[-1]
                            # Tạo tên classes mặc định nếu chưa có
                            self.class_names = [f"class_{i}" for i in range(num_classes)]
                else:
                    print(f"⚠️  Model file not found: {model_file}")
            except Exception as e:
                print(f"❌ Error loading {model_name}: {e}")
                import traceback
                traceback.print_exc()
                raise
    
    def models_loaded(self) -> bool:
        """Kiểm tra xem models đã được load chưa"""
        return len(self.models) > 0
    
    def get_models_status(self) -> Dict[str, bool]:
        """Lấy trạng thái của từng model"""
        return {
            model_name: model is not None 
            for model_name, model in self.models.items()
        }
    
    def get_model(self, model_name: str) -> Optional[tf.keras.Model]:
        """Lấy model theo tên"""
        return self.models.get(model_name)
    
    def set_class_names(self, class_names: list):
        """Set danh sách tên classes"""
        self.class_names = class_names
    
    def get_class_names(self) -> list:
        """Lấy danh sách tên classes"""
        return self.class_names
