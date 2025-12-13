"""
Image Processor - Xử lý và preprocess ảnh trước khi đưa vào models
"""

from PIL import Image
import numpy as np
import tensorflow as tf


class ImageProcessor:
    """Service để xử lý ảnh cho Keras models"""
    
    def __init__(self, image_size: int = 224):
        self.image_size = image_size
    
    def preprocess(self, image: Image.Image) -> np.ndarray:
        """
        Preprocess ảnh để đưa vào Keras model.
        
        Args:
            image: PIL Image
        
        Returns:
            Preprocessed numpy array với shape (1, height, width, 3)
        """
        # Convert to RGB nếu cần
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize về kích thước chuẩn
        image = image.resize((self.image_size, self.image_size), Image.Resampling.LANCZOS)
        
        # Convert PIL Image to numpy array
        img_array = np.array(image, dtype=np.float32)
        
        # Normalize về [0, 1] range
        img_array = img_array / 255.0
        
        # Add batch dimension: (1, height, width, 3)
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    def preprocess_for_inception(self, image: Image.Image) -> np.ndarray:
        """
        Preprocess ảnh cho InceptionV3 (cần kích thước 299x299).
        """
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # InceptionV3 cần 299x299
        image = image.resize((299, 299), Image.Resampling.LANCZOS)
        img_array = np.array(image, dtype=np.float32)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    def resize(self, image: Image.Image, max_size: int = 1024) -> Image.Image:
        """
        Resize ảnh để tối ưu băng thông.
        Giữ aspect ratio.
        """
        width, height = image.size
        
        if width > max_size or height > max_size:
            if width > height:
                new_width = max_size
                new_height = int(height * (max_size / width))
            else:
                new_height = max_size
                new_width = int(width * (max_size / height))
            
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        return image
    
