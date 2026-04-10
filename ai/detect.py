import os
import cv2
import numpy as np
from ultralytics import YOLO

_model = None

def get_model() -> YOLO:
    global _model
    if _model is None:
        model_path = os.getenv("MODEL_PATH", "best.pt")
        _model = YOLO(model_path)
    return _model


def map_bbox_to_zone(bbox: list, image_width: int, image_height: int) -> str:
    """
    Map a bounding box to one of 6 impact zones based on its position in the image.
    This assumes Mr. Bayo scans from a fixed angle per capture step.
    Zones are determined by image quadrant.
    """
    x1, y1, x2, y2 = bbox
    cx = (x1 + x2) / 2  # Centre x
    cy = (y1 + y2) / 2  # Centre y

    left  = cx < image_width  * 0.35
    right = cx > image_width  * 0.65
    top   = cy < image_height * 0.4

    if top:
        if left:  return "front_left_door"
        if right: return "front_right_door"
        return "front_bumper"
    else:
        if left:  return "rear_left_door"
        if right: return "rear_right_door"
        return "rear_bumper"


def detect_damage(image_path: str) -> list[dict]:
    """
    Run YOLOv8 inference on a single image.
    Returns list of detection dicts with zone, class, confidence, and bbox.
    """
    model = get_model()
    results = model(image_path, conf=0.3, verbose=False)[0]

    img = cv2.imread(image_path)
    if img is None:
        return []

    h, w = img.shape[:2]
    detections = []

    for box in results.boxes:
        bbox = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
        detections.append({
            "class":      results.names[int(box.cls)],
            "confidence": float(box.conf),
            "bbox":       bbox,
            "zone":       map_bbox_to_zone(bbox, w, h),
        })

    return detections
