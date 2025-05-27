# === KHỐI 1: Thư viện & cấu hình ===
import cv2
import torch
import base64
import json
from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import numpy as np
from datetime import datetime
from typing import List 
import function.utils_rotate as utils_rotate
import function.helper as helper
import requests
import tempfile
import os
import time
import uuid

MODEL_PATH_DETECTOR = "model/LP_detector.pt"
MODEL_PATH_OCR = "model/LP_ocr.pt"
CONF_THRESHOLD = 0.6

detector = torch.hub.load('ultralytics/yolov5', 'custom', path=MODEL_PATH_DETECTOR, force_reload=True)
ocr_model = torch.hub.load('ultralytics/yolov5', 'custom', path=MODEL_PATH_OCR, force_reload=True)

yolo_LP_detect = torch.hub.load('yolov5', 'custom', path='model/LP_detector_nano_61.pt', force_reload=True, source='local')
yolo_license_plate = torch.hub.load('yolov5', 'custom', path='model/LP_ocr_nano_62.pt', force_reload=True, source='local')

detector.conf = CONF_THRESHOLD
yolo_LP_detect.conf = CONF_THRESHOLD

VIDEO_EXTENSIONS = (".mp4", ".avi", ".mov", ".mkv")
VIDEO_SAVE_DIR = "videos"
os.makedirs(VIDEO_SAVE_DIR, exist_ok=True)

app = FastAPI()
app.mount("/videos", StaticFiles(directory=VIDEO_SAVE_DIR), name="videos")
clients = set()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def process_video(file_path: str) -> dict:
    cap = cv2.VideoCapture(file_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    filename = f"{uuid.uuid4().hex}.mp4"
    output_path = os.path.join(VIDEO_SAVE_DIR, filename)
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))

    frame_skip = int(fps // 2) if fps > 2 else 1
    frame_index = 0
    all_plates = set()

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_index % frame_skip == 0:
            plates = yolo_LP_detect(frame, size=640)
            list_plates = plates.pandas().xyxy[0].values.tolist()

            for plate in list_plates:
                x = int(plate[0])
                y = int(plate[1])
                w = int(plate[2] - plate[0])
                h = int(plate[3] - plate[1])
                crop_img = frame[y:y+h, x:x+w]
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 225), 2)
                for cc in range(2):
                    for ct in range(2):
                        lp = helper.read_plate(yolo_license_plate, utils_rotate.deskew(crop_img, cc, ct))
                        if lp != "unknown":
                            all_plates.add(lp)
                            cv2.putText(frame, lp, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)
                            break
        out.write(frame)
        frame_index += 1

    cap.release()
    out.release()

    return {
        "video_path": filename,
        "license_plates": list(set(all_plates))
    }

# === KHỐI 3: Endpoint REST ===
@app.post("/upload")
async def upload_image(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        ext = os.path.splitext(file.filename)[-1].lower()

        if ext in VIDEO_EXTENSIONS:
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
            contents = await file.read()
            tmp.write(contents)
            tmp.close()

            video_result = process_video(tmp.name)
            video_filename = video_result["video_path"]
            plates_found = video_result["license_plates"]

            for i in plates_found:
                data = {
                    "plate_number": i,
                    "lookup_time": datetime.utcnow().isoformat()
                }
                response = requests.post("http://backend_db:8001/log_lookup", json=data)
                print(response.status_code, response.json())

            results.append({
                "filename": file.filename,
                "licensePlates": plates_found,
                "timestamp": datetime.utcnow().isoformat(),
                "videoPath": video_filename,
                "fileType": file.content_type
            })
            continue

        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        list_read_plates = set()

        plates = detector(img, size=640)
        list_plates = plates.pandas().xyxy[0].values.tolist()

        if len(list_plates) == 0:
            lp = helper.read_plate(ocr_model, img)
            if lp != "unknown":
                cv2.putText(img, lp, (7, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36,255,12), 2)
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

        for i in list_read_plates:
            data = {
                "plate_number": i,
                "lookup_time": datetime.utcnow().isoformat()
            }
            response = requests.post("http://backend_db:8001/log_lookup", json=data)
            print(response.status_code, response.json())

    return JSONResponse(content=results)

# === Serve video đã xử lý ===
@app.get("/videos/{filename}")
def get_video(filename: str):
    path = os.path.join(VIDEO_SAVE_DIR, filename)
    if os.path.exists(path):
        return FileResponse(path, media_type="video/mp4")
    return JSONResponse(status_code=404, content={"error": "Video not found"})

@app.post("/stream_frame")
async def stream_frame(image: UploadFile = File(...)):
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    license_plates = []
    bounding_boxes = []

    plates = detector(img, size=640)
    list_plates = plates.pandas().xyxy[0].values.tolist()

    for plate in list_plates:
        x = int(plate[0])
        y = int(plate[1])
        w = int(plate[2] - plate[0])
        h = int(plate[3] - plate[1])
        crop_img = img[y:y+h, x:x+w]

        detected_plate = "unknown"
        for cc in range(2):
            for ct in range(2):
                lp = helper.read_plate(ocr_model, utils_rotate.deskew(crop_img, cc, ct))
                if lp != "unknown":
                    detected_plate = lp
                    break
            if detected_plate != "unknown":
                break

        if detected_plate != "unknown":
            license_plates.append(detected_plate)
            bounding_boxes.append({
                "x": x,
                "y": y,
                "width": w,
                "height": h
            })

    return {
        "licensePlates": license_plates,
        "boundingBoxes": bounding_boxes,
        "timestamp": datetime.utcnow().isoformat()
    }
