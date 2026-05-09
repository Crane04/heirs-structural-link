# ──────────────────────────────────────────────────────────────
#  Heirs Structural-Link AI — Docker image
#  Python 3.11 · FastAPI · YOLOv8 · MiDaS (CPU)
# ──────────────────────────────────────────────────────────────

FROM python:3.11-slim AS base

# System libs needed by OpenCV, libglib (cv2 + ultralytics)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 \
        curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Install Python deps (cached layer) ──────────────────────
COPY requirements.txt .

# Install PyTorch CPU-only builds (smaller image, no CUDA).
# Both torch and torchvision MUST come from the CPU index —
# the regular PyPI torchvision has CUDA extensions that crash
# against CPU-only torch on amd64 (Railway).
RUN pip install --no-cache-dir \
        torch==2.7.0+cpu \
        torchvision==0.22.0 \
        --index-url https://download.pytorch.org/whl/cpu

# Install remaining deps (skip torch/torchvision since they're already installed)
RUN pip install --no-cache-dir --no-deps timm>=1.0.0 && \
    pip install --no-cache-dir -r requirements.txt

# ── Copy application code & model weights ───────────────────
COPY . .

# ── Pre-warm Torch Hub cache (MiDaS model downloads) ───────
# This avoids first-request latency and makes the container
# fully self-contained (no internet needed at runtime).
ENV TORCH_HOME=/app/.torch
RUN python -c "\
import torch, os;\
os.makedirs('/app/.torch', exist_ok=True);\
torch.hub.set_dir('/app/.torch');\
torch.hub.load('intel-isl/MiDaS', 'MiDaS_small', trust_repo=True);\
print('[Docker] MiDaS model cached successfully')\
"

# ── Runtime config ──────────────────────────────────────────
ENV MODEL_PATH=best.pt
ENV LOOKUP_PATH=lookup.json
ENV PORT=8000

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Shell form so $PORT is expanded at runtime (Railway injects it)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
