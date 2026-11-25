FROM python:3.10-slim

# git để pip cài deepface theo commit
RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

# chỉ dùng onnxruntime, không cần tensorflow/pytorch
ENV DEEPFACE_BACKEND_ENGINE=onnx \
    DEEPFACE_HOME=/models \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# tải sẵn trọng số mô hình vào image để container khởi động nhanh, không phụ thuộc mạng lúc chạy
RUN python -c "from deepface import DeepFace; \
DeepFace.build_model(model_name='Facenet512', task='facial_recognition'); \
DeepFace.build_model(model_name='retinaface', task='face_detector'); \
DeepFace.build_model(model_name='Fasnet', task='spoofing')"

COPY app.py .

EXPOSE 5000
# 1 worker, 1 thread: bộ phát hiện RetinaFace không an toàn khi chạy song song
CMD ["gunicorn", "--workers=1", "--threads=1", "--timeout=120", "--bind=0.0.0.0:5000", "app:app"]
