"""
YOLOv8 Training Script — Heirs Structural-Link AI
Run this after downloading the CarDD dataset from Roboflow.

Usage:
    python train.py --data /path/to/data.yaml --epochs 50
"""

import argparse
from ultralytics import YOLO


def train(data_yaml: str, epochs: int, batch: int, device: str):
    print(f"\n{'='*50}")
    print("Heirs Structural-Link AI — YOLOv8 Training")
    print(f"Dataset:  {data_yaml}")
    print(f"Epochs:   {epochs}")
    print(f"Batch:    {batch}")
    print(f"Device:   {device}")
    print(f"{'='*50}\n")

    # Load base model — yolov8n is smallest/fastest for MVP
    model = YOLO("yolov8n.pt")

    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=640,
        batch=batch,
        device=device,
        name="heirs_damage_v1",
        patience=10,          # early stopping
        save=True,
        plots=True,
        verbose=True,
    )

    print("\n✅ Training complete.")
    print(f"   Best weights: runs/detect/heirs_damage_v1/weights/best.pt")
    print(f"   Copy best.pt to apps/ai/ before deploying.\n")

    # Validate
    print("Running validation...")
    metrics = model.val()
    map50 = metrics.box.map50
    print(f"\n📊 Validation mAP50: {map50:.3f}")
    if map50 >= 0.7:
        print("   ✅ Excellent — model is production-ready")
    elif map50 >= 0.5:
        print("   ⚠️  Acceptable for MVP — consider more epochs or larger dataset for production")
    else:
        print("   ❌ Low accuracy — increase epochs to 100 or find a larger dataset")

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data",   type=str, default="data.yaml",  help="Path to data.yaml")
    parser.add_argument("--epochs", type=int, default=50,            help="Number of training epochs")
    parser.add_argument("--batch",  type=int, default=16,            help="Batch size (reduce to 8 if OOM)")
    parser.add_argument("--device", type=str, default="cpu",         help="'cpu' or '0' for GPU")
    args = parser.parse_args()

    train(args.data, args.epochs, args.batch, args.device)
