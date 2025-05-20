# === KHỐI 1: Thư viện & cấu hình ===
import cv2
import torch
import base64
import json
from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from datetime import datetime

MODEL_PATH_DETECTOR = "model/LP_detector.pt"
MODEL_PATH_OCR = "model/LP_ocr.pt"
CONF_THRESHOLD = 0.6

detector = torch.hub.load('ultralytics/yolov5', 'custom', path=MODEL_PATH_DETECTOR, force_reload=True)
ocr_model = torch.hub.load('ultralytics/yolov5', 'custom', path=MODEL_PATH_OCR, force_reload=True)

app = FastAPI()
clients = set()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# === KHỐI 2: Tiện ích xử lý ảnh và đẩy kết quả ===
def recognize_plate_chars(cropped_img):
    results = ocr_model(cropped_img)
    chars = []
    for *xyxy, conf, cls in results.xyxy[0]:
        if conf < CONF_THRESHOLD:
            continue
        x1, _, x2, _ = map(int, xyxy)
        char = ocr_model.names[int(cls)]
        chars.append((x1, char))
    chars.sort(key=lambda x: x[0])
    return ''.join([c for _, c in chars])

async def process_and_emit(image_np):
    results = detector(image_np)
    for *xyxy, conf, cls in results.xyxy[0]:
        if conf < CONF_THRESHOLD:
            continue
        x1, y1, x2, y2 = map(int, xyxy)
        cropped = image_np[y1:y2, x1:x2]
        plate_text = recognize_plate_chars(cropped)
        if plate_text:
            _, buffer = cv2.imencode('.jpg', cropped)
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            payload = {
                "plate": plate_text,
                "time": datetime.utcnow().isoformat(),
                "image_base64": img_base64
            }
            await broadcast(payload)

async def broadcast(data: dict):
    message = json.dumps(data)
    to_remove = set()
    for client in clients:
        try:
            await client.send_text(message)
        except:
            to_remove.add(client)
    clients.difference_update(to_remove)

# === KHỐI 3: Endpoint REST ===
@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    await process_and_emit(image)
    return JSONResponse({"status": "processing"})

@app.post("/stream_frame")
async def stream_frame(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    await process_and_emit(image)
    return JSONResponse({"status": "frame processed"})

# === KHỐI 4: WebSocket Server ===
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    try:
        while True:
            await websocket.receive_text()  
    except WebSocketDisconnect:
        clients.remove(websocket)
