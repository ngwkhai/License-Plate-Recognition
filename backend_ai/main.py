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
from typing import List 
import function.utils_rotate as utils_rotate
import function.helper as helper


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

# === KHỐI 3: Endpoint REST ===
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
                for cc in range(0, 2):
                    for ct in range(0, 2):
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

