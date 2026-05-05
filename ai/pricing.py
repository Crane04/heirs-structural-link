"""
Pricing engine — maps detected damaged parts to current Nigerian market prices.
In production this reads from MongoDB PartsPricing collection (updated by scraper).
For MVP, uses a static seed price list that you update manually or via scraper.
"""

# Seed prices in NGN — update these from Jiji.ng / Ladipo Market scraper
SEED_PRICES: dict[str, int] = {
    "bumper fascia front":              45_000,
    "bumper fascia rear":               42_000,
    "bumper beam front":                35_000,
    "bumper beam rear":                 32_000,
    "foam absorber front":              12_000,
    "foam absorber rear":               11_000,
    "radiator support":                 55_000,
    "radiator mount bracket":           18_000,
    "front crossmember":                65_000,
    "hood latch":                        8_500,
    "door panel front left":            75_000,
    "door panel front right":           75_000,
    "door panel rear left":             70_000,
    "door panel rear right":            70_000,
    "door beam front":                  22_000,
    "b-pillar reinforcement":           90_000,
    "rocker sill":                      48_000,
    "ac condenser":                     95_000,
    "radiator":                        120_000,
    "engine mount front":               35_000,
    "engine mount rear":                32_000,
    "chassis rail front":              180_000,
    "paint respray panel":              25_000,
    "wheel alignment":                   8_000,
}

# Multiplier per car model (Lexus parts cost more than Toyota)
MODEL_MULTIPLIER: dict[str, float] = {
    "toyota_camry":  1.0,
    "honda_accord":  1.05,
    "lexus_rx":      1.45,
}


def get_part_price(part_name: str, car_model: str = "toyota_camry") -> int:
    key        = part_name.lower().strip()
    base_price = SEED_PRICES.get(key, 0)  # unknown parts shouldn't be priced
    multiplier = MODEL_MULTIPLIER.get(car_model.lower().replace(" ", "_"), 1.0)
    return int(base_price * multiplier)

def estimate_zone_base(zone: str) -> int:
    """
    Fallback pricing when we don't have a clean parts list.
    These are rough base amounts in NGN for a single impacted zone.
    """
    base_by_zone: dict[str, int] = {
        "front_bumper": 70_000,
        "rear_bumper": 65_000,
        "front_left_door": 80_000,
        "front_right_door": 80_000,
        "rear_left_door": 75_000,
        "rear_right_door": 75_000,
    }
    return base_by_zone.get(zone, 60_000)


def calculate_payout(predictions: list[dict], car_model: str) -> int:
    """
    Sum up prices for all damaged parts across all predictions.
    Accepts either:
    - lookup-style keys: `visible_damage`, `hidden_damage`
    - API/UI-style keys: `payoutParts`, `hiddenDamage`
    Each field contains a comma-separated part list.
    """
    total_parts = 0
    used_fallback = False
    seen  = set()  # avoid double-counting the same part

    for pred in predictions:
        parts_str = pred.get("visible_damage") or pred.get("payoutParts") or ""
        parts     = [p.strip() for p in parts_str.split(",") if p.strip()]

        for part in parts:
            if part not in seen:
                total_parts += get_part_price(part, car_model)
                seen.add(part)

        # If we didn't match any known parts for this prediction, fall back to a zone+severity_score estimate.
        # This prevents narrative strings (lookup text) from being treated as parts.
        if not parts or all(get_part_price(p, car_model) == 0 for p in parts):
            used_fallback = True
            zone = str(pred.get("zone") or "")
            base = estimate_zone_base(zone)
            score = pred.get("severity_score") or pred.get("severityScore") or 5
            try:
                score_n = max(1, min(10, int(score)))
            except Exception:
                score_n = 5

            # Multiplier uses both severity score (1..10) and measured depth (cm) when present.
            # This helps payouts vary across different images even within the same zone.
            depth = pred.get("dent_depth_cm") or pred.get("dentDepthCm") or 0
            try:
                depth_cm = max(0.0, float(depth))
            except Exception:
                depth_cm = 0.0

            sev_mult = 0.7 + (score_n / 10)          # 0.8 .. 1.7
            depth_mult = 0.8 + min(0.9, depth_cm/10) # 0.8 .. 1.7 (caps)
            multiplier = (sev_mult + depth_mult) / 2
            total_parts += int(base * multiplier)

    # Add labour (flat 15% of parts cost)
    labour = int(total_parts * 0.15)
    return total_parts + labour
