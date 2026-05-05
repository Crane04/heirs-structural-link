"""
Run this once when Eniola sends the completed Excel file.
Converts eniola_lookup.xlsx → lookup.json

Usage:
    python convert_lookup.py eniola_lookup.xlsx
"""

import sys
import json
import pandas as pd


def convert(xlsx_path: str, output_path: str = "lookup.json"):
    df = pd.read_excel(xlsx_path, sheet_name="Lookup Table")
    df.columns = df.columns.str.strip()

    lookup: dict = {}
    errors = []

    # Use to_dict records + enumerate so `row_number` is always an int
    # (DataFrame index values from iterrows() can be non-integers).
    for row_number, row in enumerate(df.to_dict(orient="records"), start=2):
        try:
            car = str(row["Car Model"]).strip().lower().replace(" ", "_")
            zone = str(row["Impact Zone"]).strip()
            sev = str(row["Severity Level"]).strip()

            if car not in lookup:
                lookup[car] = {}
            if zone not in lookup[car]:
                lookup[car][zone] = {}

            lookup[car][zone][sev] = {
                "dent_depth_cm": str(row.get("Dent Depth (cm)", "")),
                "impact_force_kn": str(row.get("Impact Force (kN)", "")),
                "von_mises_stress_mpa": float(row.get("Von Mises Stress (MPa)", 0) or 0),
                "yield_strength_mpa": float(row.get("Yield Strength (MPa)", 0) or 0),
                "stress_ratio": float(row.get("Stress Ratio", 0) or 0),
                "plastic_deformation": str(row.get("Plastic Deformation", "FALSE")).upper() == "TRUE",
                "visible_damage": str(row.get("Visible Damage", "")),
                "predicted_hidden_damage": str(row.get("Predicted Hidden Damage", "")),
                "components_at_risk": str(row.get("Components at Risk", "")),
                "severity_score": int(row.get("Severity Score (1-10)", 5) or 5),
                "recommended_action": str(row.get("Recommended Action", "")),
                "fraud_flag": str(row.get("Fraud Flag", "")),
            }
        except Exception as e:
            errors.append(f"Row {row_number}: {e}")

    with open(output_path, "w") as f:
        json.dump(lookup, f, indent=2)

    # Summary
    total = sum(
        len(severities)
        for car_data in lookup.values()
        for severities in car_data.values()
    )
    print(f"✅ Converted {total} entries → {output_path}")

    if errors:
        print(f"\n⚠️  {len(errors)} rows had errors:")
        for e in errors:
            print(f"   {e}")
    else:
        print("   No errors found.")


if __name__ == "__main__":
    xlsx = sys.argv[1] if len(sys.argv) > 1 else "eniola_lookup.xlsx"
    convert(xlsx)
