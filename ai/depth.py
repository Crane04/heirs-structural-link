import torch
import cv2
import numpy as np

_model       = None
_transforms  = None

SCALE_FACTOR = 0.15  # Calibration — tune this against a real measured dent


def get_model():
    global _model, _transforms
    if _model is None:
        _model      = torch.hub.load("intel-isl/MiDaS", "MiDaS_small", trust_repo=True)
        _transforms = torch.hub.load("intel-isl/MiDaS", "transforms",  trust_repo=True).small_transform
        _model.eval()
    return _model, _transforms


def estimate_depth(image_path: str) -> np.ndarray:
    """
    Return a 2D depth map for an image.
    Higher values = closer to the camera.
    """
    model, transforms = get_model()

    img     = cv2.imread(image_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    input_batch = transforms(img_rgb)
    with torch.no_grad():
        depth = model(input_batch)
        depth = torch.nn.functional.interpolate(
            depth.unsqueeze(1),
            size=img.shape[:2],
            mode="bicubic",
            align_corners=False,
        ).squeeze()

    return depth.numpy()


def get_dent_depth_cm(depth_map: np.ndarray, bbox: list) -> float:
    """
    Estimate dent depth in centimetres from the depth map at the damage bbox.
    """
    x1, y1, x2, y2 = [int(v) for v in bbox]

    # Clamp to image bounds
    h, w = depth_map.shape
    x1, x2 = max(0, x1), min(w, x2)
    y1, y2 = max(0, y1), min(h, y2)

    if x1 >= x2 or y1 >= y2:
        return 0.0

    damage_region   = depth_map[y1:y2, x1:x2]
    damage_depth    = float(np.mean(damage_region))

    # Surrounding reference region (30px border)
    pad = 30
    sx1, sx2 = max(0, x1-pad), min(w, x2+pad)
    sy1, sy2 = max(0, y1-pad), min(h, y2+pad)
    surrounding     = depth_map[sy1:sy2, sx1:sx2]
    reference_depth = float(np.mean(surrounding))

    depth_diff      = abs(damage_depth - reference_depth)
    dent_depth_cm   = depth_diff * SCALE_FACTOR

    return round(dent_depth_cm, 2)
