"""
Dịch vụ nhận diện khuôn mặt nội bộ cho Student-Attendance.

Chỉ có một việc: nhận bytes ảnh -> trả embedding của đúng một khuôn mặt.
Việc so khớp và nghiệp vụ điểm danh nằm ở backend Node.
"""

import hmac
import logging
import os

import cv2
import numpy as np
from flask import Flask, jsonify, request

from deepface import DeepFace
from deepface.modules.exceptions import FaceNotDetected, SpoofDetected

MODEL_NAME = "Facenet512"
DETECTOR_BACKEND = "retinaface"
MAX_IMAGE_BYTES = 5 * 1024 * 1024

API_KEY = os.environ.get("FACE_SERVICE_KEY", "")
if not API_KEY:
    raise RuntimeError("FACE_SERVICE_KEY is required")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("face-service")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_IMAGE_BYTES

# nạp mô hình ngay khi khởi động (trọng số đã có sẵn trong image), tránh request đầu tiên bị chậm
logger.info("Loading models...")
DeepFace.build_model(model_name=MODEL_NAME, task="facial_recognition")
DeepFace.build_model(model_name=DETECTOR_BACKEND, task="face_detector")
DeepFace.build_model(model_name="Fasnet", task="spoofing")
logger.info("Models loaded")


def error(code, message, status=422):
    return jsonify({"code": code, "message": message}), status


def is_authorized():
    header = request.headers.get("Authorization", "")
    scheme, _, token = header.partition(" ")
    return scheme.lower() == "bearer" and hmac.compare_digest(token.encode(), API_KEY.encode())


@app.get("/health")
def health():
    return jsonify({"status": "ok", "model": MODEL_NAME, "detector": DETECTOR_BACKEND})


@app.post("/embed")
def embed():
    if not is_authorized():
        return error("UNAUTHORIZED", "Invalid API key", 401)

    # chỉ nhận bytes ảnh thô, không nhận đường dẫn file hay URL
    data = request.get_data(cache=False)
    if not data:
        return error("BAD_IMAGE", "Empty body")
    img = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        return error("BAD_IMAGE", "Cannot decode image")

    anti_spoofing = request.args.get("anti_spoofing") == "1"
    try:
        results = DeepFace.represent(
            img_path=img,
            model_name=MODEL_NAME,
            detector_backend=DETECTOR_BACKEND,
            enforce_detection=True,
            align=True,
            anti_spoofing=anti_spoofing,
        )
    except SpoofDetected:
        return error("SPOOF", "Spoof detected")
    except FaceNotDetected:
        return error("NO_FACE", "No face detected")
    except ValueError as err:
        # một số phiên bản báo không thấy khuôn mặt bằng ValueError thường
        logger.info("represent failed: %s", err)
        return error("NO_FACE", "No face detected")

    if len(results) == 0:
        return error("NO_FACE", "No face detected")
    if len(results) > 1:
        return error("MULTIPLE_FACES", "More than one face detected")

    face = results[0]
    return jsonify({
        "embedding": face["embedding"],
        "faceConfidence": face.get("face_confidence"),
        "model": MODEL_NAME,
        "detector": DETECTOR_BACKEND,
    })


@app.errorhandler(413)
def too_large(_):
    return error("BAD_IMAGE", "Image too large", 413)
