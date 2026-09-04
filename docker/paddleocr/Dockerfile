FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DISABLE_MODEL_SOURCE_CHECK=True

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 libglib2.0-0 libgl1 curl \
    && rm -rf /var/lib/apt/lists/*

# PaddlePaddle CPU + PaddleOCR (3.3.0 requires paddlex<3.8 — pin BOTH or the
# predictor API mismatches: PaddlePredictorOption.__init__() TypeError)
RUN pip install "paddlepaddle==3.0.0" "paddleocr==3.3.0" "paddlex==3.3.13"

# API layer
RUN pip install fastapi uvicorn python-multipart pillow

WORKDIR /app
COPY server.py /app/server.py

EXPOSE 8000

# Warm the model cache at boot so first real request is fast
CMD ["sh", "-c", "python warmup.py; uvicorn server:app --host 0.0.0.0 --port 8000"]
