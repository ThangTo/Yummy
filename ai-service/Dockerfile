# Python AI Service Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for TensorFlow
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies (bao gồm gdown để download từ Google Drive)
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gdown

# Download models từ Google Drive
# Folder ID: 1it1LSGC9LbCpRy9JVz5jVBR3M5Dmf65j
RUN mkdir -p models && \
    echo "📥 Downloading AI models from Google Drive..." && \
    gdown --folder https://drive.google.com/drive/folders/1it1LSGC9LbCpRy9JVz5jVBR3M5Dmf65j -O models --remaining-ok && \
    echo "✅ Models downloaded successfully" || \
    (echo "⚠️ Warning: Failed to download models. Models should be available in the image or mounted volume." && exit 0)

# Copy application code
COPY . .

# Create uploads directory if needed
RUN mkdir -p uploads

# Verify models are present
RUN ls -lh models/ || echo "⚠️ Models directory is empty"

# Expose port
EXPOSE 8000

# Start FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

