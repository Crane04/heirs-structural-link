import os
import torch
import cv2
import numpy as np
from pathlib import Path
from typing import Any, Callable, cast

SCALE_FACTOR = 0.15
_BASE_DIR = Path(__file__).resolve().parent

TransformFn = Callable[[np.ndarray], torch.Tensor]

_model: torch.nn.Module | None = None
_transforms: TransformFn | None = None


def _trust_torch_hub_repos(repos: list[str]) -> None:
    try:
        hub_dir = Path(torch.hub.get_dir()).resolve()
        trusted = hub_dir / "trusted_list"
        existing: set[str] = set()
        if trusted.exists():
            existing = {line.strip() for line in trusted.read_text().splitlines() if line.strip()}
        wanted = set(existing)
        wanted.update(repos)
        if wanted != existing:
            trusted.parent.mkdir(parents=True, exist_ok=True)
            trusted.write_text("\n".join(sorted(wanted)) + "\n")
    except Exception:
        return


def get_model() -> tuple[torch.nn.Module, TransformFn]:
    global _model, _transforms
    if _model is None:
        try:
            hub_dir = Path(os.getenv("TORCH_HOME", str(_BASE_DIR / ".torch"))).resolve()
            hub_dir.mkdir(parents=True, exist_ok=True)
            torch.hub.set_dir(str(hub_dir))
            _trust_torch_hub_repos([
                "intel-isl/MiDaS",
                "rwightman/gen-efficientnet-pytorch",
            ])

            loaded_model = cast(
                torch.nn.Module,
                torch.hub.load("intel-isl/MiDaS", "MiDaS_small", trust_repo=True),
            )
            loaded_model.eval()
            _model = loaded_model

            transforms_module: Any = torch.hub.load("intel-isl/MiDaS", "transforms", trust_repo=True)
            _transforms = getattr(transforms_module, "small_transform", None)
        except Exception as e:
            raise RuntimeError(
                "Failed to load MiDaS via torch.hub.\n"
                "- Ensure the machine has internet access on first run, OR\n"
                "- Pre-warm the Torch Hub cache and set TORCH_HOME to that directory.\n"
                f"Original error: {e}"
            ) from e

    if _model is None or _transforms is None or not callable(_transforms):
        raise RuntimeError("MiDaS model/transforms failed to initialize.")

    return cast(torch.nn.Module, _model), cast(TransformFn, _transforms)


def estimate_depth(image_path: str) -> np.ndarray:
    """Return a 2D depth map. Higher values = closer to camera."""
    model, transforms = get_model()

    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Could not read image at path: {image_path}")

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
    """Estimate dent depth in centimetres from the depth map at the damage bbox."""
    x1, y1, x2, y2 = [int(v) for v in bbox]

    h, w = depth_map.shape
    x1, x2 = max(0, x1), min(w, x2)
    y1, y2 = max(0, y1), min(h, y2)

    if x1 >= x2 or y1 >= y2:
        return 0.0

    damage_region  = depth_map[y1:y2, x1:x2]
    damage_depth   = float(np.mean(damage_region))

    pad = 30
    sx1, sx2 = max(0, x1 - pad), min(w, x2 + pad)
    sy1, sy2 = max(0, y1 - pad), min(h, y2 + pad)
    surrounding    = depth_map[sy1:sy2, sx1:sx2]
    reference_depth = float(np.mean(surrounding))

    depth_diff    = abs(damage_depth - reference_depth)
    dent_depth_cm = depth_diff * SCALE_FACTOR

    return round(dent_depth_cm, 2)