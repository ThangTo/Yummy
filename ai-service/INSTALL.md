# Hướng dẫn cài đặt AI Service

## Yêu cầu
- Python 3.10, 3.11, hoặc 3.12
- pip (package manager)

## Cài đặt

### 1. Tạo virtual environment

```bash
python -m venv venv
```

### 2. Kích hoạt virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Cài đặt dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Lưu ý:** Nếu gặp lỗi với TensorFlow, thử:
- Python 3.12: TensorFlow 2.16.1 hoặc cao hơn
- Python 3.11: TensorFlow 2.15.0 hoặc cao hơn
- Python 3.10: TensorFlow 2.13.0 hoặc cao hơn

### 4. Kiểm tra cài đặt

```bash
python -c "import tensorflow as tf; print('TensorFlow version:', tf.__version__)"
python -c "import fastapi; print('FastAPI installed')"
```

## Chạy service

```bash
# Development mode (auto-reload)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Troubleshooting

### Lỗi: "Could not find a version that satisfies the requirement tensorflow==2.15.0"
**Giải pháp:** Cập nhật `requirements.txt` để dùng TensorFlow version tương thích với Python version của bạn.

### Lỗi: "uvicorn is not recognized"
**Giải pháp:** Đảm bảo virtual environment đã được kích hoạt và đã chạy `pip install -r requirements.txt`.

### Lỗi khi load models
**Giải pháp:** 
- Kiểm tra file models có trong thư mục `models/` không
- Kiểm tra TensorFlow version tương thích
- Xem logs để biết lỗi cụ thể

