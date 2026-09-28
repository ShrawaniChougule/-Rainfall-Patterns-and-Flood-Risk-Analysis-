import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
import os

# Set seed for reproducibility
np.random.seed(42)
random.seed(42)

ATM_NODES = [
    {"atm_id": "ATM_NUH_01", "hub": "Mewat", "bank": "SBI", "lat": 28.1052, "lon": 77.0124, "type": "Kiosk", "is_guarded": 0, "near_highway": 1},
    {"atm_id": "ATM_NUH_02", "hub": "Mewat", "bank": "PNB", "lat": 28.1140, "lon": 77.0250, "type": "Branch", "is_guarded": 1, "near_highway": 0},
    {"atm_id": "ATM_JAM_01", "hub": "Jamtara", "bank": "SBI", "lat": 23.9620, "lon": 86.8010, "type": "Branch", "is_guarded": 1, "near_highway": 0},
    {"atm_id": "ATM_KARM_02", "hub": "Jamtara", "bank": "BOI", "lat": 24.0810, "lon": 86.8920, "type": "Kiosk", "is_guarded": 0, "near_highway": 1},
    {"atm_id": "ATM_AHM_01", "hub": "Ahmedabad", "bank": "ICICI", "lat": 23.0225, "lon": 72.5714, "type": "Branch", "is_guarded": 1, "near_highway": 0},
    {"atm_id": "ATM_HYD_01", "hub": "Hyderabad", "bank": "SBI", "lat": 17.3850, "lon": 78.4867, "type": "Branch", "is_guarded": 1, "near_highway": 0},
    {"atm_id": "ATM_CHD_01", "hub": "Chandigarh", "bank": "PNB", "lat": 30.7333, "lon": 76.7794, "type": "Branch", "is_guarded": 1, "near_highway": 0},
    {"atm_id": "ATM_VIZ_01", "hub": "Visakhapatnam", "bank": "SBI", "lat": 17.6868, "lon": 83.2185, "type": "Branch", "is_guarded": 1, "near_highway": 0},
    {"atm_id": "ATM_GAU_01", "hub": "Guwahati", "bank": "SBI", "lat": 26.1445, "lon": 91.7362, "type": "Branch", "is_guarded": 1, "near_highway": 0}
]

df_atms = pd.DataFrame(ATM_NODES)

SCAM_PROFILES = {
    "Digital Arrest": (150000, 2000000, [2, 3, 4], 0.25),
    "Telegram Part-Time Task": (15000, 300000, [1, 2, 3], 0.30),
    "Fake Stock Investment": (200000, 3500000, [3, 4, 5], 0.20),
    "Instant Loan App": (6000, 75000, [1, 2], 0.15),
    "Video Sextortion": (10000, 100000, [1, 2], 0.10)
}

print("Generating 5,000 synthetic records...")

records = []
start_date = datetime(2026, 7, 1, 0, 0, 0)
scams = list(SCAM_PROFILES.keys())
weights = [SCAM_PROFILES[s][3] for s in scams]

for i in range(1, 5001):
    complaint_id = f"NCRP2026_{i:06d}"
    scam = random.choices(scams, weights=weights)[0]
    min_a, max_a, hops, _ = SCAM_PROFILES[scam]
    
    amount = int(np.random.triangular(min_a, min_a * 1.5, max_a))
    hop_count = random.choice(hops)
    chosen_atm = df_atms.sample(n=1).iloc[0]
    
    tower_lat = round(chosen_atm["lat"] + np.random.normal(0, 0.004), 6)
    tower_lon = round(chosen_atm["lon"] + np.random.normal(0, 0.004), 6)
    
    incident_time = start_date + timedelta(minutes=random.randint(0, 120000))
    lead_time = random.randint(25, 120)
    cashout_time = incident_time + timedelta(minutes=lead_time)
    
    records.append({
        "complaint_id": complaint_id,
        "incident_timestamp": incident_time.strftime("%Y-%m-%d %H:%M:%S"),
        "scam_type": scam,
        "amount_stolen_inr": amount,
        "mule_hop_count": hop_count,
        "jcct_hub": chosen_atm["hub"],
        "simulated_cell_lat": tower_lat,
        "simulated_cell_lon": tower_lon,
        "target_atm_id": chosen_atm["atm_id"],
        "target_bank": chosen_atm["bank"],
        "atm_is_guarded": chosen_atm["is_guarded"],
        "cashout_timestamp": cashout_time.strftime("%Y-%m-%d %H:%M:%S"),
        "lead_time_minutes": lead_time
    })

df = pd.DataFrame(records)

# Use current working directory to save the file
output_path = os.path.join(os.getcwd(), "synthetic_cybercrime_5000.csv")
df.to_csv(output_path, index=False)

print(f"\nSUCCESS: Generated {len(df)} rows.")
print(f"File saved at: {output_path}")
print(f"File size: {os.path.getsize(output_path) / 1024:.2f} KB")