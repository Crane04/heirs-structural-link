import json
import os

_lookup: dict = {}


def load_lookup():
    global _lookup
    if _lookup:
        return
    path = os.getenv("LOOKUP_PATH", "lookup.json")
    with open(path) as f:
        _lookup = json.load(f)


def classify_severity(dent_depth_cm: float) -> str:
    if dent_depth_cm < 2.0:   return "minor"
    if dent_depth_cm < 5.0:   return "moderate"
    if dent_depth_cm < 10.0:  return "significant"
    if dent_depth_cm < 20.0:  return "severe"
    return "critical"


def get_stress_prediction(car_model: str, impact_zone: str, dent_depth_cm: float) -> dict:
    """
    Query the Von Mises lookup table.
    Returns prediction dict or a safe fallback if entry is missing.
    """
    load_lookup()

    car_key = car_model.lower().replace(" ", "_")  # "toyota_camry"
    severity = classify_severity(dent_depth_cm)

    try:
        entry = _lookup[car_key][impact_zone][severity]
        return {
            "severity":           severity,
            "von_mises_stress":   entry.get("von_mises_stress_mpa", 0),
            "yield_strength":     entry.get("yield_strength_mpa", 0),
            "stress_ratio":       entry.get("stress_ratio", 0),
            "plastic_deform":     entry.get("plastic_deformation", False),
            "visible_damage":     entry.get("visible_damage", ""),
            "hidden_damage":      entry.get("predicted_hidden_damage", ""),
            "components_at_risk": entry.get("components_at_risk", ""),
            "severity_score":     entry.get("severity_score", 0),
            "recommended_action": entry.get("recommended_action", ""),
            "fraud_flag_note":    entry.get("fraud_flag", ""),
            "found":              True,
        }
    except KeyError:
        # Fallback — car/zone/severity combo not yet in lookup
        return {
            "severity":           severity,
            "von_mises_stress":   0,
            "yield_strength":     0,
            "stress_ratio":       0,
            "plastic_deform":     False,
            "visible_damage":     "Damage detected",
            "hidden_damage":      "Manual inspection required",
            "components_at_risk": "Unknown — manual review needed",
            "severity_score":     5,
            "recommended_action": "Please visit a Heirs-approved workshop for assessment.",
            "fraud_flag_note":    "",
            "found":              False,
        }
