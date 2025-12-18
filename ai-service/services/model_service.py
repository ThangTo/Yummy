"""
Model Service - Quản lý việc load và lưu trữ models
"""

from typing import Dict, Optional
from pathlib import Path
import tensorflow as tf
import numpy as np
import json


class ModelService:
    """Service để quản lý các AI models"""
    
    def __init__(self):
        self.models: Dict[str, tf.keras.Model] = {}
        self.models_path = Path("models")  # Thư mục chứa các model files
        self.class_names = []  # Sẽ được load từ model hoặc config
        
    async def load_all_models(self):
        """
        Load tất cả models vào RAM.
        Models sẽ được giữ trong RAM để tránh cold start.
        """
        # Load class names từ file nếu có
        self._load_class_names()
        
        # Map tên model (dùng trong code) -> file .keras tương ứng trong thư mục models
        model_files = {
            "inception_v3": "InceptionV3_models.keras",
            "resnet152_v2": "ResNet152V2_models.keras",
            "vgg19": "VGG19_models.keras",
            # 2 models mới
            "inception_resnet_v2": "InceptionResNetV2_models.keras",
            "xception": "Xception_models.keras",
        }
        
        loaded_count = 0
        failed_count = 0
        
        for model_name, model_file in model_files.items():
            try:
                model_path = self.models_path / model_file
                if model_path.exists():
                    print(f"🔄 Loading {model_name} from {model_path}...")
                    try:
                    # Load Keras model
                    model = tf.keras.models.load_model(str(model_path))
                    self.models[model_name] = model
                        loaded_count += 1
                    print(f"✅ Loaded {model_name} successfully")
                    
                    # Lấy số classes từ model output shape
                    if not self.class_names:
                        output_shape = model.output_shape
                        if isinstance(output_shape, list):
                            output_shape = output_shape[0]
                        if output_shape and len(output_shape) > 1:
                            num_classes = output_shape[-1]
                            # Tạo tên classes mặc định nếu chưa có file class_names.json
                            self.class_names = [f"class_{i}" for i in range(num_classes)]
                            print(f"⚠️  Using default class names (class_0, class_1, ...)")
                    except Exception as load_error:
                        failed_count += 1
                        print(f"❌ Error loading {model_name} from {model_path}: {load_error}")
                        print(f"   Error type: {type(load_error).__name__}")
                        import traceback
                        traceback.print_exc()
                        # Tiếp tục load các model khác thay vì raise
                else:
                    failed_count += 1
                    print(f"⚠️  Model file not found: {model_file} (skipping)")
            except Exception as e:
                failed_count += 1
                print(f"❌ Unexpected error processing {model_name}: {e}")
                import traceback
                traceback.print_exc()
                # Tiếp tục load các model khác thay vì raise
        
        # Tổng kết
        print(f"\n📊 Model Loading Summary:")
        print(f"   ✅ Successfully loaded: {loaded_count}/{len(model_files)} models")
        print(f"   ❌ Failed/Missing: {failed_count}/{len(model_files)} models")
        
        if loaded_count == 0:
            raise RuntimeError("No models were successfully loaded! Please check model files.")
        
        if failed_count > 0:
            print(f"⚠️  Warning: {failed_count} model(s) failed to load. Server will continue with available models.")
        
        # Log class names đã load
        if self.class_names:
            print(f"📋 Class names loaded: {len(self.class_names)} classes")
            print(f"   First 5: {self.class_names[:5]}")
    
    def _load_class_names(self):
        """Load class names từ file class_names.json"""
        class_names_path = self.models_path / "class_names.json"
        if class_names_path.exists():
            try:
                with open(class_names_path, 'r', encoding='utf-8') as f:
                    self.class_names = json.load(f)
                print(f"✅ Loaded {len(self.class_names)} class names from {class_names_path}")
            except Exception as e:
                print(f"⚠️  Error loading class_names.json: {e}")
                self.class_names = []
        else:
            print(f"⚠️  class_names.json not found at {class_names_path}")
            print(f"   Will use default class names (class_0, class_1, ...)")
            self.class_names = []
    
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
