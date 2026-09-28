import pandas as pd
import numpy as np

# ==========================================
# LOAD CLEANED DATASET
# ==========================================

df = pd.read_csv("../data/flood_risk_analysis_cleaned.csv")

df["Date"] = pd.to_datetime(df["Date"])

print("=" * 60)
print("RAINFALL PATTERNS AND FLOOD RISK ANALYSIS")
print("=" * 60)


# ==========================================
# 1. OVERALL KPIs
# ==========================================

total_records = len(df)

total_rainfall = df["Rainfall_mm"].sum()

average_rainfall = df["Rainfall_mm"].mean()

maximum_rainfall = df["Rainfall_mm"].max()

minimum_rainfall = df["Rainfall_mm"].min()

total_floods = (df["Flood_Event"] == 1).sum()

flood_percentage = (total_floods / total_records) * 100


print("\n" + "=" * 60)
print("OVERALL PROJECT KPIs")
print("=" * 60)

print("Total Records:", total_records)
print("Total Rainfall:", round(total_rainfall, 2), "mm")
print("Average Rainfall:", round(average_rainfall, 2), "mm")
print("Maximum Rainfall:", round(maximum_rainfall, 2), "mm")
print("Minimum Rainfall:", round(minimum_rainfall, 2), "mm")
print("Total Flood Events:", total_floods)
print("Flood Event Percentage:", round(flood_percentage, 2), "%")


# ==========================================
# 2. YEARLY RAINFALL
# ==========================================

yearly_rainfall = (
    df.groupby("Year")["Rainfall_mm"]
    .sum()
    .sort_values(ascending=False)
)

print("\n" + "=" * 60)
print("YEARLY RAINFALL")
print("=" * 60)

print(yearly_rainfall)


highest_rainfall_year = yearly_rainfall.idxmax()

print(
    "\nHighest Rainfall Year:",
    highest_rainfall_year
)


# ==========================================
# 3. MONTHLY RAINFALL
# ==========================================

monthly_rainfall = (
    df.groupby("Month_Name")["Rainfall_mm"]
    .mean()
)

month_order = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
]

monthly_rainfall = monthly_rainfall.reindex(month_order)

print("\n" + "=" * 60)
print("AVERAGE MONTHLY RAINFALL")
print("=" * 60)

print(monthly_rainfall.round(2))

highest_rainfall_month = monthly_rainfall.idxmax()

print(
    "\nHighest Average Rainfall Month:",
    highest_rainfall_month
)


# ==========================================
# 4. SEASONAL RAINFALL
# ==========================================

seasonal_rainfall = (
    df.groupby("Season")["Rainfall_mm"]
    .mean()
    .sort_values(ascending=False)
)

print("\n" + "=" * 60)
print("SEASONAL RAINFALL")
print("=" * 60)

print(seasonal_rainfall.round(2))


# ==========================================
# 5. FLOOD EVENTS BY YEAR
# ==========================================

floods_by_year = (
    df[df["Flood_Event"] == 1]
    .groupby("Year")
    .size()
)

print("\n" + "=" * 60)
print("FLOOD EVENTS BY YEAR")
print("=" * 60)

print(floods_by_year)


# ==========================================
# 6. FLOOD EVENTS BY MONTH
# ==========================================

floods_by_month = (
    df[df["Flood_Event"] == 1]
    .groupby("Month_Name")
    .size()
    .reindex(month_order)
    .fillna(0)
)

print("\n" + "=" * 60)
print("FLOOD EVENTS BY MONTH")
print("=" * 60)

print(floods_by_month.astype(int))

highest_flood_month = floods_by_month.idxmax()

print(
    "\nMonth with Most Flood Events:",
    highest_flood_month
)


# ==========================================
# 7. FLOOD EVENTS BY LOCATION
# ==========================================

floods_by_location = (
    df[df["Flood_Event"] == 1]
    .groupby("Location")
    .size()
    .sort_values(ascending=False)
)

print("\n" + "=" * 60)
print("FLOOD EVENTS BY LOCATION")
print("=" * 60)

print(floods_by_location)


highest_flood_location = floods_by_location.idxmax()

print(
    "\nLocation with Most Flood Events:",
    highest_flood_location
)


# ==========================================
# 8. FLOOD SEVERITY
# ==========================================

severity_distribution = (
    df[df["Flood_Event"] == 1]
    ["Flood_Severity"]
    .value_counts()
)

print("\n" + "=" * 60)
print("FLOOD SEVERITY")
print("=" * 60)

print(severity_distribution)


# ==========================================
# 9. RAINFALL INTENSITY
# ==========================================

rainfall_intensity = df["Rainfall_Intensity"].value_counts()

print("\n" + "=" * 60)
print("RAINFALL INTENSITY DISTRIBUTION")
print("=" * 60)

print(rainfall_intensity)


# ==========================================
# 10. FLOODS BY RAINFALL INTENSITY
# ==========================================

flood_by_intensity = (
    df.groupby("Rainfall_Intensity")["Flood_Event"]
    .sum()
)

intensity_order = [
    "No Rain",
    "Light",
    "Moderate",
    "Heavy",
    "Very Heavy",
    "Extreme"
]

flood_by_intensity = flood_by_intensity.reindex(
    intensity_order
).fillna(0)

print("\n" + "=" * 60)
print("FLOOD EVENTS BY RAINFALL INTENSITY")
print("=" * 60)

print(flood_by_intensity.astype(int))


# ==========================================
# 11. FLOOD RATE BY RAINFALL INTENSITY
# ==========================================

flood_rate = (
    df.groupby("Rainfall_Intensity")["Flood_Event"]
    .mean() * 100
)

flood_rate = flood_rate.reindex(intensity_order)

print("\n" + "=" * 60)
print("FLOOD RATE BY RAINFALL INTENSITY")
print("=" * 60)

print(flood_rate.round(2))


# ==========================================
# 12. RAINFALL VS FLOOD CORRELATION
# ==========================================

correlation = df[
    ["Rainfall_mm", "Flood_Event"]
].corr().loc[
    "Rainfall_mm",
    "Flood_Event"
]

print("\n" + "=" * 60)
print("RAINFALL - FLOOD RELATIONSHIP")
print("=" * 60)

print(
    "Rainfall vs Flood Correlation:",
    round(correlation, 3)
)


# ==========================================
# 13. RISK LEVEL DISTRIBUTION
# ==========================================

risk_distribution = df["Risk_Level"].value_counts()

print("\n" + "=" * 60)
print("RISK LEVEL DISTRIBUTION")
print("=" * 60)

print(risk_distribution)


# ==========================================
# 14. FLOODS BY SEASON
# ==========================================

floods_by_season = (
    df[df["Flood_Event"] == 1]
    .groupby("Season")
    .size()
)

print("\n" + "=" * 60)
print("FLOOD EVENTS BY SEASON")
print("=" * 60)

print(floods_by_season)


# ==========================================
# 15. TOP 10 LOCATIONS BY RAINFALL
# ==========================================

rainfall_by_location = (
    df.groupby("Location")["Rainfall_mm"]
    .mean()
    .sort_values(ascending=False)
)

print("\n" + "=" * 60)
print("AVERAGE RAINFALL BY LOCATION")
print("=" * 60)

print(rainfall_by_location)


# ==========================================
# FINAL SUMMARY
# ==========================================

print("\n" + "=" * 60)
print("FINAL PROJECT SUMMARY")
print("=" * 60)

print("Total Records:", total_records)
print("Average Rainfall:", round(average_rainfall, 2), "mm")
print("Maximum Rainfall:", round(maximum_rainfall, 2), "mm")
print("Total Flood Events:", total_floods)
print("Highest Rainfall Year:", highest_rainfall_year)
print("Highest Rainfall Month:", highest_rainfall_month)
print("Most Flood-Prone Month:", highest_flood_month)
print("Most Flood-Recorded Location:", highest_flood_location)
print("Rainfall-Flood Correlation:", round(correlation, 3))

print("\n" + "=" * 60)
print("ANALYSIS COMPLETED")
print("=" * 60)