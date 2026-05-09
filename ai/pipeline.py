import os
import cv2
import requests
import tempfile
from detect import detect_damage
from depth  import estimate_depth, get_dent_depth_cm
from lookup import get_stress_prediction
from pricing import calculate_payout


def download_image(url: str, dest_path: str) -> bool:
    """Download an image from a Cloudinary URL to a local temp path."""
    try:
        res = requests.get(url, timeout=15)
        res.raise_for_status()
        with open(dest_path, "wb") as f:
            f.write(res.content)
        return True
    except Exception as e:
        print(f"[Pipeline] Failed to download {url}: {e}")
        return False


def analyse_claim(frame_urls: list[str], car_model: str) -> dict:
    """
    Full AI pipeline:
      1. Download frames from Cloudinary
      2. YOLOv8 damage detection on each frame
      3. MiDaS depth estimation per detected zone
      4. Von Mises lookup table query
      5. Pricing engine
      6. Fraud check
    """
    all_predictions: list[dict] = []
    seen_zones: set[str] = set()

    with tempfile.TemporaryDirectory() as tmpdir:
        for i, url in enumerate(frame_urls):
            local_path = os.path.join(tmpdir, f"frame_{i}.jpg")
            if not download_image(url, local_path):
                continue

            # Step 1: Detect damage zones
            detections = detect_damage(local_path)
            if not detections:
                continue

            # Step 2: Get depth map
            depth_map = estimate_depth(local_path)

            for det in detections:
                zone = det["zone"]

                # Only process each zone once (take first/clearest detection)
                if zone in seen_zones:
                    continue
                seen_zones.add(zone)

                # Step 3: Measure dent depth
                dent_depth_cm = get_dent_depth_cm(depth_map, det["bbox"])

                # Step 4: Von Mises lookup
                prediction = get_stress_prediction(car_model, zone, dent_depth_cm)

                # Step 5: Fraud check — low stress ratio but deep dent is suspicious
                fraud_flagged = (
                    prediction["stress_ratio"] > 0
                    and prediction["stress_ratio"] < 0.2
                    and dent_depth_cm > 4.0
                )

                all_predictions.append({
                    "zone":             zone,
                    "damageType":       det["class"],
                    "confidence":       det["confidence"],
                    "dentDepthCm":      dent_depth_cm,
                    "severity":         prediction["severity"],
                    "hiddenDamage":     prediction["hidden_damage"],
                    "componentsAtRisk": prediction["components_at_risk"],
                    "severityScore":    prediction["severity_score"],
                    "payoutParts":      prediction["visible_damage"],
                    "fraudFlagged":     fraud_flagged,
                })

    # Step 6: Aggregate
    total_payout = calculate_payout(all_predictions, car_model)
    fraud_flagged_overall = any(p["fraudFlagged"] for p in all_predictions)

    return {
        "predictions":      all_predictions,
        "total_payout_ngn": total_payout,
        "fraud_flagged":    fraud_flagged_overall,
        "zones_detected":   list(seen_zones),
        "car_model":        car_model,
    }