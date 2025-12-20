"""
Hugging Face Spaces entry point
Wraps FastAPI app for Spaces compatibility
"""

from main import app

# Spaces sẽ tự động detect app từ biến này
# Hoặc có thể dùng uvicorn trực tiếp trong Dockerfile

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

