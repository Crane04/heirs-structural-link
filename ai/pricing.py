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
    base_price = SEED_PRICES.get(key, 30_000)  # default ₦30k if part unknown
    multiplier = MODEL_MULTIPLIER.get(car_model.lower().replace(" ", "_"), 1.0)
    return int(base_price * multiplier)


def calculate_payout(predictions: list[dict], car_model: str) -> int:
    """
    Sum up prices for all damaged parts across all predictions.
    Each prediction's visible_damage field contains a comma-separated part list.
    """
    total = 0
    seen  = set()  # avoid double-counting the same part

    for pred in predictions:
        parts_str = pred.get("visible_damage", "")
        parts     = [p.strip() for p in parts_str.split(",") if p.strip()]

        for part in parts:
            if part not in seen:
                total += get_part_price(part, car_model)
                seen.add(part)

        # Add hidden damage parts too
        hidden_str = pred.get("hidden_damage", "")
        hidden     = [p.strip() for p in hidden_str.split(",") if p.strip()]
        for part in hidden:
            if part not in seen:
                total += get_part_price(part, car_model)
                seen.add(part)

    # Add labour (flat 15% of parts cost)
    labour = int(total * 0.15)
    return total + labour
