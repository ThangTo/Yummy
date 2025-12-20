---
title: Yummy AI Service
emoji: 🍜
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
app_port: 8000
---

# Yummy AI Service - Vietnamese Food Recognition

AI microservice for recognizing Vietnamese dishes using ensemble of 5 deep learning models.

## Models

- InceptionV3
- ResNet152V2
- VGG19
- InceptionResNetV2
- Xception

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health check
- `GET /docs` - Swagger UI documentation
- `POST /predict` - Predict food from image

## Usage

```python
import requests

# Upload image
with open("food.jpg", "rb") as f:
    response = requests.post(
        "https://your-space.hf.space/predict",
        files={"file": f}
    )
    result = response.json()
    print(result)
```

## Environment Variables

- `PYTHONUNBUFFERED=1`
- `TF_FORCE_GPU_ALLOW_GROWTH=true`
- `TF_ENABLE_ONEDNN_OPTS=0`
