import pandas as pd
import matplotlib.pyplot as plt
import os

# ==========================================
# LOAD DATA
# ==========================================

df = pd.read_csv("../data/flood_risk_analysis_cleaned.csv")

df["Date"] = pd.to_datetime(df["Date"])

# Create charts folder
os.makedirs("../charts", exist_ok=True)

# Month order
month_order = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
]


# ==========================================
# CHART 1 — YEARLY RAINFALL
# ==========================================

yearly = df.groupby("Year")["Rainfall_mm"].sum()

plt.figure(figsize=(10, 6))

plt.bar(yearly.index, yearly.values)

plt.title("Yearly Rainfall (2018–2025)")
plt.xlabel("Year")
plt.ylabel("Total Rainfall (mm)")

plt.xticks(yearly.index)

plt.tight_layout()

plt.savefig("../charts/yearly_rainfall.png", dpi=300)

plt.close()


# ==========================================
# CHART 2 — MONTHLY RAINFALL
# ==========================================

monthly = (
    df.groupby("Month_Name")["Rainfall_mm"]
    .mean()
    .reindex(month_order)
)

plt.figure(figsize=(10, 6))

plt.plot(
    monthly.index,
    monthly.values,
    marker="o",
    linewidth=2
)

plt.title("Average Monthly Rainfall")
plt.xlabel("Month")
plt.ylabel("Average Rainfall (mm)")

plt.xticks(rotation=45)

plt.grid(True, alpha=0.3)

plt.tight_layout()

plt.savefig("../charts/monthly_rainfall.png", dpi=300)

plt.close()


# ==========================================
# CHART 3 — SEASONAL RAINFALL
# ==========================================

seasonal = df.groupby("Season")["Rainfall_mm"].mean()

plt.figure(figsize=(8, 6))

plt.bar(seasonal.index, seasonal.values)

plt.title("Average Rainfall by Season")
plt.xlabel("Season")
plt.ylabel("Average Rainfall (mm)")

plt.tight_layout()

plt.savefig("../charts/seasonal_rainfall.png", dpi=300)

plt.close()


# ==========================================
# CHART 4 — FLOOD EVENTS BY MONTH
# ==========================================

flood_month = (
    df[df["Flood_Event"] == 1]
    .groupby("Month_Name")
    .size()
    .reindex(month_order)
    .fillna(0)
)

plt.figure(figsize=(10, 6))

plt.bar(
    flood_month.index,
    flood_month.values
)

plt.title("Flood Events by Month")
plt.xlabel("Month")
plt.ylabel("Number of Flood Events")

plt.xticks(rotation=45)

plt.tight_layout()

plt.savefig("../charts/flood_events_by_month.png", dpi=300)

plt.close()


# ==========================================
# CHART 5 — FLOOD EVENTS BY YEAR
# ==========================================

flood_year = (
    df[df["Flood_Event"] == 1]
    .groupby("Year")
    .size()
)

plt.figure(figsize=(10, 6))

plt.plot(
    flood_year.index,
    flood_year.values,
    marker="o",
    linewidth=2
)

plt.title("Flood Events by Year")
plt.xlabel("Year")
plt.ylabel("Number of Flood Events")

plt.xticks(flood_year.index)

plt.grid(True, alpha=0.3)

plt.tight_layout()

plt.savefig("../charts/flood_events_by_year.png", dpi=300)

plt.close()


# ==========================================
# CHART 6 — FLOOD EVENTS BY LOCATION
# ==========================================

location_floods = (
    df[df["Flood_Event"] == 1]
    .groupby("Location")
    .size()
    .sort_values(ascending=True)
)

plt.figure(figsize=(10, 7))

plt.barh(
    location_floods.index,
    location_floods.values
)

plt.title("Flood Events by Location")
plt.xlabel("Number of Flood Events")
plt.ylabel("Location")

plt.tight_layout()

plt.savefig("../charts/flood_events_by_location.png", dpi=300)

plt.close()


# ==========================================
# CHART 7 — RAINFALL INTENSITY DISTRIBUTION
# ==========================================

intensity_order = [
    "No Rain",
    "Light",
    "Moderate",
    "Heavy",
    "Very Heavy",
    "Extreme"
]

intensity = (
    df["Rainfall_Intensity"]
    .value_counts()
    .reindex(intensity_order)
    .fillna(0)
)

plt.figure(figsize=(10, 6))

plt.bar(
    intensity.index,
    intensity.values
)

plt.title("Rainfall Intensity Distribution")
plt.xlabel("Rainfall Intensity")
plt.ylabel("Number of Records")

plt.xticks(rotation=30)

plt.tight_layout()

plt.savefig("../charts/rainfall_intensity.png", dpi=300)

plt.close()


# ==========================================
# CHART 8 — FLOOD EVENTS VS RAINFALL INTENSITY
# ==========================================

flood_intensity = (
    df.groupby("Rainfall_Intensity")["Flood_Event"]
    .sum()
    .reindex(intensity_order)
    .fillna(0)
)

plt.figure(figsize=(10, 6))

plt.bar(
    flood_intensity.index,
    flood_intensity.values
)

plt.title("Flood Events by Rainfall Intensity")
plt.xlabel("Rainfall Intensity")
plt.ylabel("Number of Flood Events")

plt.xticks(rotation=30)

plt.tight_layout()

plt.savefig("../charts/flood_vs_rainfall_intensity.png", dpi=300)

plt.close()


# ==========================================
# CHART 9 — RAINFALL VS FLOOD EVENTS
# ==========================================

plt.figure(figsize=(10, 6))

plt.scatter(
    df["Rainfall_mm"],
    df["Flood_Event"],
    alpha=0.35
)

plt.title("Rainfall vs Flood Occurrence")
plt.xlabel("Rainfall (mm)")
plt.ylabel("Flood Event (0 = No, 1 = Yes)")

plt.yticks([0, 1], ["No Flood", "Flood"])

plt.grid(True, alpha=0.3)

plt.tight_layout()

plt.savefig("../charts/rainfall_vs_flood.png", dpi=300)

plt.close()


# ==========================================
# CHART 10 — RISK LEVEL DISTRIBUTION
# ==========================================

risk_order = [
    "Low",
    "Moderate",
    "High",
    "Very High"
]

risk = (
    df["Risk_Level"]
    .value_counts()
    .reindex(risk_order)
    .fillna(0)
)

plt.figure(figsize=(9, 6))

plt.bar(
    risk.index,
    risk.values
)

plt.title("Flood Risk Level Distribution")
plt.xlabel("Risk Level")
plt.ylabel("Number of Records")

plt.tight_layout()

plt.savefig("../charts/risk_distribution.png", dpi=300)

plt.close()


# ==========================================
# CHART 11 — FLOODS BY SEASON
# ==========================================

season_order = [
    "Winter",
    "Summer",
    "Monsoon",
    "Post-Monsoon"
]

season_floods = (
    df[df["Flood_Event"] == 1]
    .groupby("Season")
    .size()
    .reindex(season_order)
    .fillna(0)
)

plt.figure(figsize=(9, 6))

plt.bar(
    season_floods.index,
    season_floods.values
)

plt.title("Flood Events by Season")
plt.xlabel("Season")
plt.ylabel("Number of Flood Events")

plt.tight_layout()

plt.savefig("../charts/floods_by_season.png", dpi=300)

plt.close()


# ==========================================
# COMPLETED
# ==========================================

print("=" * 60)
print("ALL VISUALIZATIONS CREATED SUCCESSFULLY")
print("=" * 60)

print("\nCharts created:")

for file in os.listdir("../charts"):
    print("✓", file)

print("\nLocation:")
print("../charts/")