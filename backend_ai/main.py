# === KHỐI 1: Thư viện & cấu hình ===
import cv2
import torch
import base64
import json
import asyncio
from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from datetime import datetime
from typing import List
import function.utils_rotate as utils_rotate
import function.helper as helper
import time

# === KHỐI 2: Load model & cấu hình YOLO ===
MODEL_PATH_DETECTOR = "model/LP_detector.pt"
MODEL_PATH_OCR = "model/LP_ocr.pt"
CONF_THRESHOLD = 0.6

# Load models (dùng từ torch.hub)
detector = torch.hub.load('ultralytics/yolov5', 'custom', path=MODEL_PATH_DETECTOR, force_reload=True)
ocr_model = torch.hub.load('ultralytics/yolov5', 'custom', path=MODEL_PATH_OCR, force_reload=True)

yolo_LP_detect = torch.hub.load('yolov5', 'custom', path='model/LP_detector_nano_61.pt', force_reload=True, source='local')
yolo_license_plate = torch.hub.load('yolov5', 'custom', path='model/LP_ocr_nano_62.pt', force_reload=True, source='local')

# Thiết lập threshold
detector.conf = CONF_THRESHOLD

# Khởi tạo ứng dụng FastAPI
app = FastAPI()
clients = set()

# Cho phép CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# === KHỐI 3: REST API xử lý ảnh tĩnh ===
@app.post("/upload")
async def upload_image(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        list_read_plates = set()
        plates = detector(img, size=640)
        list_plates = plates.pandas().xyxy[0].values.tolist()

        if len(list_plates) == 0:
            lp = helper.read_plate(ocr_model, img)
            if lp != "unknown":
                cv2.putText(img, lp, (7, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)
                list_read_plates.add(lp)
        else:
            for plate in list_plates:
                flag = 0
                x = int(plate[0])
                y = int(plate[1])
                w = int(plate[2] - plate[0])
                h = int(plate[3] - plate[1])
                crop_img = img[y:y+h, x:x+w]
                cv2.rectangle(img, (x, y), (x+w, y+h), color=(0, 0, 225), thickness=2)
                for cc in range(2):
                    for ct in range(2):
                        lp = helper.read_plate(ocr_model, utils_rotate.deskew(crop_img, cc, ct))
                        if lp != "unknown":
                            list_read_plates.add(lp)
                            cv2.putText(img, lp, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)
                            flag = 1
                            break
                    if flag == 1:
                        break

        _, buffer = cv2.imencode('.jpg', img)
        img_base64 = base64.b64encode(buffer).decode('utf-8')

        results.append({
            "filename": file.filename,
            "licensePlates": list(list_read_plates),
            "timestamp": datetime.utcnow().isoformat(),
            "imageBase64": img_base64,
            "fileType": file.content_type
        })

    return JSONResponse(content=results)

# === KHỐI 4: WebSocket stream video ===
cap = cv2.VideoCapture(0)

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                continue

            # Phát hiện biển số xe
            plates = yolo_LP_detect(frame, size=640)
            list_plates = plates.pandas().xyxy[0].values.tolist()
            list_read_plates = set()

            for plate in list_plates:
                x = int(plate[0])
                y = int(plate[1])
                w = int(plate[2] - plate[0])
                h = int(plate[3] - plate[1])
                crop_img = frame[y:y+h, x:x+w]
                cv2.rectangle(frame, (x, y), (x+w, y+h), color=(0, 0, 225), thickness=2)
                for cc in range(2):
                    for ct in range(2):
                        lp = helper.read_plate(yolo_license_plate, utils_rotate.deskew(crop_img, cc, ct))
                        if lp != "unknown":
                            list_read_plates.add(lp)
                            cv2.putText(frame, lp, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)
                            break

            # Encode frame và gửi lên WebSocket
            _, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = base64.b64encode(buffer).decode('utf-8')
            await websocket.send_text(frame_bytes)

            # Điều chỉnh tốc độ gửi frame
            await asyncio.sleep(0.03)  # ~30 FPS

    except WebSocketDisconnect:
        print("Client disconnected")

    finally:
        cap.release()
