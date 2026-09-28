import "./App.css";
import "leaflet/dist/leaflet.css";

import Papa from "papaparse";
import { useEffect, useMemo, useState } from "react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";


function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedLocation, setSelectedLocation] =
    useState("All Locations");


  // =========================================================
  // LOAD CSV
  // =========================================================

  useEffect(() => {
    console.log("Starting CSV load...");

    fetch("/flood_risk_analysis_india.csv")
      .then((response) => {
        console.log(
          "CSV response status:",
          response.status
        );

        if (!response.ok) {
          throw new Error(
            `CSV file could not be loaded. Status: ${response.status}`
          );
        }

        return response.text();
      })
      .then((csvText) => {
        console.log(
          "CSV received:",
          csvText.length,
          "characters"
        );

        const result = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        console.log(
          "Records loaded:",
          result.data.length
        );

        if (result.errors.length > 0) {
          console.warn(
            "CSV parsing warnings:",
            result.errors
          );
        }

        const cleanedData = result.data.filter(
          (row) =>
            row.Date ||
            row.Location ||
            row.Rainfall_mm
        );

        console.log(
          "Cleaned records:",
          cleanedData.length
        );

        setData(cleanedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("CSV Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);


  // =========================================================
  // LOCATIONS
  // =========================================================

  const locations = useMemo(() => {
    return [
      "All Locations",
      ...Array.from(
        new Set(
          data
            .map((row) => row.Location)
            .filter(Boolean)
        )
      ).sort(),
    ];
  }, [data]);


  // =========================================================
  // FILTER DATA
  // =========================================================

  const filteredData = useMemo(() => {
    if (
      selectedLocation ===
      "All Locations"
    ) {
      return data;
    }

    return data.filter(
      (row) =>
        row.Location ===
        selectedLocation
    );
  }, [data, selectedLocation]);


  // =========================================================
  // HELPER FUNCTIONS
  // =========================================================

  const numberValue = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };


  const isFlood = (row) => {
    const value = String(
      row.Flood_Event || ""
    ).toLowerCase();

    return (
      value === "yes" ||
      value === "true" ||
      value === "1"
    );
  };


  // =========================================================
  // BASIC KPIs
  // =========================================================

  const totalRecords =
    filteredData.length;

  const rainfallValues =
    filteredData.map((row) =>
      numberValue(row.Rainfall_mm)
    );

  const totalRainfall =
    rainfallValues.reduce(
      (sum, value) => sum + value,
      0
    );

  const averageRainfall =
    totalRecords > 0
      ? totalRainfall / totalRecords
      : 0;

  const maximumRainfall =
    rainfallValues.length > 0
      ? Math.max(...rainfallValues)
      : 0;

  const floodEvents =
    filteredData.filter(isFlood).length;

  const floodPercentage =
    totalRecords > 0
      ? (floodEvents / totalRecords) *
        100
      : 0;


  // =========================================================
  // MONTH DATA
  // =========================================================

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];


  const monthlyRainfall =
    monthNames.map((month) => {
      const rows =
        filteredData.filter(
          (row) =>
            String(
              row.Month_Name ||
                row.Month
            ) === month
        );

      if (rows.length === 0) {
        return 0;
      }

      return (
        rows.reduce(
          (sum, row) =>
            sum +
            numberValue(
              row.Rainfall_mm
            ),
          0
        ) / rows.length
      );
    });


  const floodsByMonth =
    monthNames.map((month) => {
      return filteredData.filter(
        (row) =>
          String(
            row.Month_Name ||
              row.Month
          ) === month &&
          isFlood(row)
      ).length;
    });


  // =========================================================
  // YEAR DATA
  // =========================================================

  const years = Array.from(
    new Set(
      filteredData
        .map((row) => {
          if (row.Year) {
            return Number(row.Year);
          }

          if (row.Date) {
            return new Date(
              row.Date
            ).getFullYear();
          }

          return null;
        })
        .filter((year) =>
          Number.isFinite(year)
        )
    )
  ).sort((a, b) => a - b);


  const yearlyRainfall =
    years.map((year) => {
      const rows =
        filteredData.filter((row) => {
          const rowYear = row.Year
            ? Number(row.Year)
            : new Date(
                row.Date
              ).getFullYear();

          return rowYear === year;
        });

      if (rows.length === 0) {
        return 0;
      }

      return (
        rows.reduce(
          (sum, row) =>
            sum +
            numberValue(
              row.Rainfall_mm
            ),
          0
        ) / rows.length
      );
    });


  const floodsByYear =
    years.map((year) => {
      return filteredData.filter(
        (row) => {
          const rowYear = row.Year
            ? Number(row.Year)
            : new Date(
                row.Date
              ).getFullYear();

          return (
            rowYear === year &&
            isFlood(row)
          );
        }
      ).length;
    });


  // =========================================================
  // SEASON DATA
  // =========================================================

  const seasonNames = [
    "Winter",
    "Summer",
    "Monsoon",
    "Post-Monsoon",
  ];


  const seasonalRainfall =
    seasonNames.map((season) => {
      const rows =
        filteredData.filter(
          (row) =>
            row.Season === season
        );

      if (rows.length === 0) {
        return 0;
      }

      return (
        rows.reduce(
          (sum, row) =>
            sum +
            numberValue(
              row.Rainfall_mm
            ),
          0
        ) / rows.length
      );
    });


  const floodsBySeason =
    seasonNames.map((season) => {
      return filteredData.filter(
        (row) =>
          row.Season === season &&
          isFlood(row)
      ).length;
    });


  // =========================================================
  // FLOODS BY LOCATION
  // =========================================================

  const locationNames =
    Array.from(
      new Set(
        filteredData
          .map((row) => row.Location)
          .filter(Boolean)
      )
    ).sort();


  const locationFloodCounts =
    locationNames.map(
      (location) =>
        filteredData.filter(
          (row) =>
            row.Location ===
              location &&
            isFlood(row)
        ).length
    );


  // =========================================================
  // RAINFALL INTENSITY
  // =========================================================

  const intensities = [
    "No Rain",
    "Light",
    "Moderate",
    "Heavy",
    "Very Heavy",
    "Extreme",
  ];


  const intensityFloods =
    intensities.map(
      (intensity) =>
        filteredData.filter(
          (row) =>
            row.Rainfall_Intensity ===
              intensity &&
            isFlood(row)
        ).length
    );


  const intensityTotals =
    intensities.map(
      (intensity) =>
        filteredData.filter(
          (row) =>
            row.Rainfall_Intensity ===
            intensity
        ).length
    );


  const intensityFloodRates =
    intensities.map(
      (intensity, index) => {
        if (
          intensityTotals[index] === 0
        ) {
          return 0;
        }

        return (
          (intensityFloods[index] /
            intensityTotals[index]) *
          100
        );
      }
    );


  // =========================================================
  // RISK LEVEL
  // =========================================================

  const riskLevels = [
    "Low",
    "Moderate",
    "High",
    "Very High",
  ];


  const riskCounts =
    riskLevels.map(
      (risk) =>
        filteredData.filter(
          (row) =>
            row.Risk_Level === risk
        ).length
    );


  // =========================================================
  // CHART DATA
  // =========================================================

  const monthlyChartData =
    monthNames.map(
      (month, index) => ({
        month,
        rainfall:
          Number(
            monthlyRainfall[index]
          ).toFixed(2),
        floods:
          floodsByMonth[index],
      })
    );


  const yearlyChartData =
    years.map((year, index) => ({
      year: String(year),
      rainfall:
        Number(
          yearlyRainfall[index]
        ).toFixed(2),
      floods:
        floodsByYear[index],
    }));


  const seasonalChartData =
    seasonNames.map(
      (season, index) => ({
        season,
        rainfall:
          Number(
            seasonalRainfall[index]
          ).toFixed(2),
        floods:
          floodsBySeason[index],
      })
    );


  const locationChartData =
    locationNames.map(
      (location, index) => ({
        location,
        floods:
          locationFloodCounts[index],
      })
    );


  const intensityChartData =
    intensities.map(
      (intensity, index) => ({
        intensity,
        floods:
          intensityFloods[index],
        rate:
          Number(
            intensityFloodRates[index]
          ).toFixed(2),
      })
    );


  const riskChartData =
    riskLevels.map(
      (risk, index) => ({
        name: risk,
        value:
          riskCounts[index],
      })
    );


  // =========================================================
  // SCATTER DATA
  // =========================================================

  const scatterData =
    filteredData.map((row) => ({
      rainfall:
        numberValue(
          row.Rainfall_mm
        ),
      flood:
        isFlood(row) ? 1 : 0,
      location:
        row.Location || "",
    }));


  // =========================================================
  // CORRELATION
  // =========================================================

  const calculateCorrelation = (
    x,
    y
  ) => {
    if (
      x.length < 2 ||
      y.length < 2
    ) {
      return 0;
    }

    const meanX =
      x.reduce(
        (a, b) => a + b,
        0
      ) / x.length;

    const meanY =
      y.reduce(
        (a, b) => a + b,
        0
      ) / y.length;

    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;

    for (
      let i = 0;
      i < x.length;
      i++
    ) {
      const dx =
        x[i] - meanX;

      const dy =
        y[i] - meanY;

      numerator += dx * dy;
      denominatorX +=
        dx * dx;
      denominatorY +=
        dy * dy;
    }

    if (
      denominatorX === 0 ||
      denominatorY === 0
    ) {
      return 0;
    }

    return (
      numerator /
      Math.sqrt(
        denominatorX *
          denominatorY
      )
    );
  };


  const correlation =
    calculateCorrelation(
      filteredData.map((row) =>
        numberValue(
          row.Rainfall_mm
        )
      ),
      filteredData.map((row) =>
        isFlood(row) ? 1 : 0
      )
    );


  // =========================================================
  // HIGHLIGHTS
  // =========================================================

  const highestRainfallMonthIndex =
    monthlyRainfall.indexOf(
      Math.max(
        ...monthlyRainfall
      )
    );

  const highestFloodMonthIndex =
    floodsByMonth.indexOf(
      Math.max(
        ...floodsByMonth
      )
    );

  const highestFloodLocationIndex =
    locationFloodCounts.indexOf(
      Math.max(
        ...locationFloodCounts
      )
    );


  const highestRainfallMonth =
    monthNames[
      highestRainfallMonthIndex
    ] || "-";

  const highestFloodMonth =
    monthNames[
      highestFloodMonthIndex
    ] || "-";

  const highestFloodLocation =
    locationNames[
      highestFloodLocationIndex
    ] || "-";


  // =========================================================
  // MAP DATA
  // =========================================================

  const mapLocations =
    useMemo(() => {
      const grouped = {};

      filteredData.forEach(
        (row) => {
          const lat =
            numberValue(
              row.Latitude
            );

          const lon =
            numberValue(
              row.Longitude
            );

          if (!lat || !lon) {
            return;
          }

          const location =
            row.Location ||
            "Unknown";

          if (!grouped[location]) {
            grouped[location] = {
              location,
              latitude: lat,
              longitude: lon,
              floodCount: 0,
              total: 0,
              highRisk: 0,
            };
          }

          grouped[location]
            .total += 1;

          if (isFlood(row)) {
            grouped[location]
              .floodCount += 1;
          }

          if (
            row.Risk_Level ===
              "High" ||
            row.Risk_Level ===
              "Very High"
          ) {
            grouped[location]
              .highRisk += 1;
          }
        }
      );

      return Object.values(
        grouped
      );
    }, [filteredData]);


  // =========================================================
  // COLORS
  // =========================================================

  const riskColors = [
    "#22c55e",
    "#f59e0b",
    "#f97316",
    "#ef4444",
  ];


  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-card">

          <div className="loading-icon">
            🌧️
          </div>

          <h1>
            Rainfall & Flood Risk
            Analysis
          </h1>

          <p>
            Preparing interactive
            dashboard...
          </p>

          <div className="loading-spinner"></div>

          <small>
            Loading rainfall dataset
          </small>

        </div>
      </div>
    );
  }


  // =========================================================
  // ERROR SCREEN
  // =========================================================

  if (error) {
    return (
      <div className="loading-screen">

        <div className="loading-card error-card">

          <div className="loading-icon">
            ⚠️
          </div>

          <h1>
            Dataset Loading Error
          </h1>

          <p>{error}</p>

          <p>
            Make sure the CSV file
            is inside:
          </p>

          <code>
            public/flood_risk_analysis_india.csv
          </code>

        </div>

      </div>
    );
  }


  // =========================================================
  // NAVIGATION
  // =========================================================

  const tabs = [
    "Overview",
    "Rainfall",
    "Flood Events",
    "Risk Analysis",
    "Risk Map",
    "Insights",
  ];


  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar">

        <div className="nav-brand">

          <div className="brand-icon">
            🌧️
          </div>

          <div>
            <h2>
              Rainfall & Flood Risk
            </h2>

            <span>
              Data Exploration Dashboard
            </span>
          </div>

        </div>


        <div className="nav-tabs">

          {tabs.map((tab) => (
            <button
              key={tab}
              className={
                activeTab === tab
                  ? "nav-tab active"
                  : "nav-tab"
              }
              onClick={() =>
                setActiveTab(tab)
              }
            >
              {tab}
            </button>
          ))}

        </div>

      </nav>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero">

        <div className="hero-content">

          <div className="hero-badge">
            📊 Data Exploration &
            Visualization
          </div>

          <h1>
            Understanding Rainfall
            <br />

            <span>
              Patterns & Flood Risk
            </span>
          </h1>

          <p>
            Explore rainfall trends,
            seasonal patterns, flood
            events and risk levels
            through interactive
            visualizations.
          </p>

          <div className="hero-info">

            <span>
              📅 2018 – 2025
            </span>

            <span>
              📍 Multiple Locations
            </span>

            <span>
              📈{" "}
              {totalRecords.toLocaleString()}
              {" "}Records
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <section className="filter-section">

        <div className="filter-title">
          <span>🔎</span>
          Explore Dataset
        </div>

        <div className="filter-control">

          <label>
            Location
          </label>

          <select
            value={
              selectedLocation
            }
            onChange={(e) =>
              setSelectedLocation(
                e.target.value
              )
            }
          >

            {locations.map(
              (location) => (
                <option
                  key={location}
                  value={location}
                >
                  {location}
                </option>
              )
            )}

          </select>

        </div>

        <div className="filter-info">
          Showing{" "}
          <strong>
            {filteredData.length.toLocaleString()}
          </strong>{" "}
          records
        </div>

      </section>


      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <section className="kpi-grid">

        <div className="kpi-card blue">

          <div className="kpi-icon">
            📊
          </div>

          <div>

            <span>
              Total Records
            </span>

            <strong>
              {totalRecords.toLocaleString()}
            </strong>

          </div>

        </div>


        <div className="kpi-card purple">

          <div className="kpi-icon">
            🌧️
          </div>

          <div>

            <span>
              Average Rainfall
            </span>

            <strong>
              {averageRainfall.toFixed(2)}
              <small> mm</small>
            </strong>

          </div>

        </div>


        <div className="kpi-card orange">

          <div className="kpi-icon">
            🌊
          </div>

          <div>

            <span>
              Flood Events
            </span>

            <strong>
              {floodEvents.toLocaleString()}
            </strong>

          </div>

        </div>


        <div className="kpi-card pink">

          <div className="kpi-icon">
            ⛈️
          </div>

          <div>

            <span>
              Maximum Rainfall
            </span>

            <strong>
              {maximumRainfall.toFixed(1)}
              <small> mm</small>
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="dashboard-content">


        {/* ===================================================
            OVERVIEW
        =================================================== */}

        {activeTab === "Overview" && (
          <>

            <div className="section-heading">

              <div>

                <span>
                  📌 OVERVIEW
                </span>

                <h2>
                  Dataset at a Glance
                </h2>

              </div>

              <p>
                A visual summary of
                rainfall, flood events
                and risk distribution.
              </p>

            </div>


            <div className="chart-grid two-columns">


              {/* MONTHLY RAINFALL */}

              <div className="chart-card">

                <div className="chart-header">

                  <h3>
                    Monthly Average
                    Rainfall
                  </h3>

                  <span>🌧️</span>

                </div>

                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={350}
                  >

                    <LineChart
                      data={
                        monthlyChartData
                      }
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.25}
                      />

                      <XAxis
                        dataKey="month"
                        angle={-35}
                        textAnchor="end"
                        height={70}
                      />

                      <YAxis />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="rainfall"
                        name="Rainfall (mm)"
                        stroke="#4f46e5"
                        strokeWidth={4}
                        dot={{
                          r: 5,
                        }}
                        activeDot={{
                          r: 8,
                        }}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>

              </div>


              {/* YEARLY RAINFALL */}

              <div className="chart-card">

                <div className="chart-header">

                  <h3>
                    Yearly Average
                    Rainfall
                  </h3>

                  <span>📅</span>

                </div>

                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={350}
                  >

                    <BarChart
                      data={
                        yearlyChartData
                      }
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.25}
                      />

                      <XAxis
                        dataKey="year"
                      />

                      <YAxis />

                      <Tooltip />

                      <Bar
                        dataKey="rainfall"
                        name="Rainfall (mm)"
                        fill="#06b6d4"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </div>


            <div className="chart-grid two-columns">


              {/* SEASONAL */}

              <div className="chart-card">

                <div className="chart-header">

                  <h3>
                    Seasonal Rainfall
                  </h3>

                  <span>🌦️</span>

                </div>

                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={350}
                  >

                    <BarChart
                      data={
                        seasonalChartData
                      }
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.25}
                      />

                      <XAxis
                        dataKey="season"
                      />

                      <YAxis />

                      <Tooltip />

                      <Bar
                        dataKey="rainfall"
                        name="Rainfall (mm)"
                        fill="#8b5cf6"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>


              {/* RISK PIE */}

              <div className="chart-card">

                <div className="chart-header">

                  <h3>
                    Risk Level
                    Distribution
                  </h3>

                  <span>⚠️</span>

                </div>

                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={350}
                  >

                    <PieChart>

                      <Pie
                        data={
                          riskChartData
                        }
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={120}
                        paddingAngle={3}
                        label
                      >

                        {riskChartData.map(
                          (_, index) => (
                            <Cell
                              key={index}
                              fill={
                                riskColors[
                                  index
                                ]
                              }
                            />
                          )
                        )}

                      </Pie>

                      <Tooltip />

                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </div>

          </>
        )}


        {/* ===================================================
            RAINFALL
        =================================================== */}

        {activeTab === "Rainfall" && (
          <>

            <div className="section-heading">

              <div>

                <span>
                  🌧️ RAINFALL ANALYSIS
                </span>

                <h2>
                  Rainfall Patterns
                </h2>

              </div>

              <p>
                Explore monthly, yearly
                and seasonal rainfall
                behavior.
              </p>

            </div>


            <div className="chart-card full-width">

              <div className="chart-header">

                <h3>
                  Monthly Rainfall Trend
                </h3>

                <span>📈</span>

              </div>

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height={450}
                >

                  <LineChart
                    data={
                      monthlyChartData
                    }
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.25}
                    />

                    <XAxis
                      dataKey="month"
                      angle={-35}
                      textAnchor="end"
                      height={80}
                    />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="rainfall"
                      name="Average Rainfall (mm)"
                      stroke="#2563eb"
                      strokeWidth={4}
                      dot={{
                        r: 5,
                      }}
                      activeDot={{
                        r: 8,
                      }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </div>


            <div className="chart-grid two-columns">

              <div className="chart-card">

                <div className="chart-header">

                  <h3>
                    Rainfall by Year
                  </h3>

                  <span>📅</span>

                </div>

                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={380}
                  >

                    <BarChart
                      data={
                        yearlyChartData
                      }
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.25}
                      />

                      <XAxis
                        dataKey="year"
                      />

                      <YAxis />

                      <Tooltip />

                      <Bar
                        dataKey="rainfall"
                        name="Rainfall (mm)"
                        fill="#0ea5e9"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>


              <div className="chart-card">

                <div className="chart-header">

                  <h3>
                    Flood Events by Month
                  </h3>

                  <span>🌊</span>

                </div>

                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={380}
                  >

                    <BarChart
                      data={
                        monthlyChartData
                      }
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.25}
                      />

                      <XAxis
                        dataKey="month"
                        angle={-35}
                        textAnchor="end"
                        height={75}
                      />

                      <YAxis />

                      <Tooltip />

                      <Bar
                        dataKey="floods"
                        name="Flood Events"
                        fill="#f97316"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </div>

          </>
        )}


        {/* ===================================================
            FLOOD EVENTS
        =================================================== */}

        {activeTab === "Flood Events" && (
          <>

            <div className="section-heading">

              <div>

                <span>
                  🌊 FLOOD EVENTS
                </span>

                <h2>
                  Flood Event Analysis
                </h2>

              </div>

              <p>
                Analyze when and where
                flood events occurred
                in the dataset.
              </p>

            </div>


            <div className="chart-grid two-columns">


              {/* YEAR */}

              <div className="chart-card">

                <div className="chart-header">

                  <h3>
                    Flood Events by Year
                  </h3>

                  <span>📅</span>

                </div>

                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={380}
                  >

                    <BarChart
                      data={
                        yearlyChartData
                      }
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.25}
                      />

                      <XAxis
                        dataKey="year"
                      />

                      <YAxis />

                      <Tooltip />

                      <Bar
                        dataKey="floods"
                        name="Flood Events"
                        fill="#ef4444"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>


              {/* MONTH */}

              <div className="chart-card">

                <div className="chart-header">

                  <h3>
                    Flood Events by Month
                  </h3>

                  <span>🌧️</span>

                </div>

                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={380}
                  >

                    <BarChart
                      data={
                        monthlyChartData
                      }
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.25}
                      />

                      <XAxis
                        dataKey="month"
                        angle={-35}
                        textAnchor="end"
                        height={75}
                      />

                      <YAxis />

                      <Tooltip />

                      <Bar
                        dataKey="floods"
                        name="Flood Events"
                        fill="#f97316"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </div>


            {/* LOCATION */}

            <div className="chart-card full-width">

              <div className="chart-header">

                <h3>
                  Flood Events by Location
                </h3>

                <span>📍</span>

              </div>

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height={450}
                >

                  <BarChart
                    data={
                      locationChartData
                    }
                    layout="vertical"
                    margin={{
                      left: 30,
                      right: 30,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.25}
                    />

                    <XAxis
                      type="number"
                    />

                    <YAxis
                      type="category"
                      dataKey="location"
                      width={90}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="floods"
                      name="Flood Events"
                      fill="#dc2626"
                      radius={[
                        0,
                        8,
                        8,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>


            {/* INTENSITY */}

            <div className="chart-card full-width">

              <div className="chart-header">

                <h3>
                  Flood Events by Rainfall
                  Intensity
                </h3>

                <span>⛈️</span>

              </div>

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height={420}
                >

                  <BarChart
                    data={
                      intensityChartData
                    }
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.25}
                    />

                    <XAxis
                      dataKey="intensity"
                    />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="floods"
                      name="Flood Events"
                      fill="#f43f5e"
                      radius={[
                        8,
                        8,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

          </>
        )}


        {/* ===================================================
            RISK ANALYSIS
        =================================================== */}

        {activeTab === "Risk Analysis" && (
          <>

            <div className="section-heading">

              <div>

                <span>
                  ⚠️ RISK ANALYSIS
                </span>

                <h2>
                  Rainfall → Flood
                  Relationship
                </h2>

              </div>

              <p>
                Explore the relationship
                between rainfall and
                recorded flood events.
              </p>

            </div>


            <div className="analysis-summary">

              <div className="analysis-stat">

                <span>
                  Rainfall–Flood
                  Correlation
                </span>

                <strong>
                  {correlation.toFixed(3)}
                </strong>

              </div>


              <div className="analysis-stat">

                <span>
                  Flood Event Rate
                </span>

                <strong>
                  {floodPercentage.toFixed(
                    2
                  )}
                  %
                </strong>

              </div>


              <div className="analysis-stat">

                <span>
                  Peak Rainfall Month
                </span>

                <strong>
                  {highestRainfallMonth}
                </strong>

              </div>

            </div>


            {/* SCATTER */}

            <div className="chart-card full-width">

              <div className="chart-header">

                <h3>
                  Rainfall vs Flood Events
                </h3>

                <span>📊</span>

              </div>

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height={480}
                >

                  <ScatterChart>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.25}
                    />

                    <XAxis
                      type="number"
                      dataKey="rainfall"
                      name="Rainfall"
                      label={{
                        value:
                          "Rainfall (mm)",
                        position:
                          "insideBottom",
                        offset:
                          -5,
                      }}
                    />

                    <YAxis
                      type="number"
                      dataKey="flood"
                      domain={[
                        0,
                        1,
                      ]}
                      ticks={[
                        0,
                        1,
                      ]}
                      tickFormatter={(
                        value
                      ) =>
                        value === 1
                          ? "Flood"
                          : "No Flood"
                      }
                    />

                    <Tooltip
                      cursor={{
                        strokeDasharray:
                          "3 3",
                      }}
                      formatter={(
                        value,
                        name
                      ) => {
                        if (
                          name ===
                          "Flood Event"
                        ) {
                          return [
                            value === 1
                              ? "Flood"
                              : "No Flood",
                            name,
                          ];
                        }

                        return [
                          value,
                          name,
                        ];
                      }}
                    />

                    <Scatter
                      name="Flood Event"
                      data={
                        scatterData
                      }
                      fill="#ef4444"
                      opacity={0.55}
                    />

                  </ScatterChart>

                </ResponsiveContainer>

              </div>

            </div>


            <div className="chart-grid two-columns">


              {/* RISK */}

              <div className="chart-card">

                <div className="chart-header">

                  <h3>
                    Risk Distribution
                  </h3>

                  <span>⚠️</span>

                </div>

                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={400}
                  >

                    <PieChart>

                      <Pie
                        data={
                          riskChartData
                        }
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={130}
                        paddingAngle={3}
                        label
                      >

                        {riskChartData.map(
                          (_, index) => (
                            <Cell
                              key={index}
                              fill={
                                riskColors[
                                  index
                                ]
                              }
                            />
                          )
                        )}

                      </Pie>

                      <Tooltip />

                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

              </div>


              {/* RATE */}

              <div className="chart-card">

                <div className="chart-header">

                  <h3>
                    Flood Rate by
                    Rainfall Intensity
                  </h3>

                  <span>⛈️</span>

                </div>

                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={400}
                  >

                    <BarChart
                      data={
                        intensityChartData
                      }
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.25}
                      />

                      <XAxis
                        dataKey="intensity"
                        angle={-30}
                        textAnchor="end"
                        height={80}
                      />

                      <YAxis
                        domain={[
                          0,
                          100,
                        ]}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="rate"
                        name="Flood Rate (%)"
                        fill="#a855f7"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </div>

          </>
        )}


        {/* ===================================================
            RISK MAP
        =================================================== */}

        {activeTab === "Risk Map" && (
          <>

            <div className="section-heading">

              <div>

                <span>
                  🗺️ RISK MAP
                </span>

                <h2>
                  Geographic Flood Risk
                  View
                </h2>

              </div>

              <p>
                Explore flood-event
                concentration across
                locations.
              </p>

            </div>


            <div className="map-card">

              <MapContainer
                center={[
                  20.5,
                  78.9,
                ]}
                zoom={5}
                scrollWheelZoom={
                  true
                }
                style={{
                  height:
                    "600px",
                  width:
                    "100%",
                  borderRadius:
                    "20px",
                }}
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                {mapLocations.map(
                  (location) => {

                    const radius =
                      Math.max(
                        10,
                        Math.min(
                          30,
                          location
                            .floodCount /
                            5
                        )
                      );

                    return (
                      <CircleMarker
                        key={
                          location.location
                        }
                        center={[
                          location.latitude,
                          location.longitude,
                        ]}
                        radius={
                          radius
                        }
                        pathOptions={{
                          fillOpacity:
                            0.65,
                        }}
                      >

                        <Popup>

                          <div className="map-popup">

                            <h3>
                              {
                                location.location
                              }
                            </h3>

                            <p>
                              📊 Total
                              Records:{" "}
                              <strong>
                                {
                                  location.total
                                }
                              </strong>
                            </p>

                            <p>
                              🌊 Flood
                              Events:{" "}
                              <strong>
                                {
                                  location.floodCount
                                }
                              </strong>
                            </p>

                            <p>
                              ⚠️ High /
                              Very High
                              Risk:{" "}
                              <strong>
                                {
                                  location.highRisk
                                }
                              </strong>
                            </p>

                          </div>

                        </Popup>

                      </CircleMarker>
                    );
                  }
                )}

              </MapContainer>

            </div>


            <div className="map-info-grid">

              <div className="map-info-card">

                <span>📍</span>

                <div>

                  <small>
                    Highest Flood
                    Location
                  </small>

                  <strong>
                    {
                      highestFloodLocation
                    }
                  </strong>

                </div>

              </div>


              <div className="map-info-card">

                <span>🌊</span>

                <div>

                  <small>
                    Flood Events
                  </small>

                  <strong>
                    {floodEvents}
                  </strong>

                </div>

              </div>


              <div className="map-info-card">

                <span>⚠️</span>

                <div>

                  <small>
                    High Risk
                    Records
                  </small>

                  <strong>
                    {
                      riskCounts[2] +
                      riskCounts[3]
                    }
                  </strong>

                </div>

              </div>

            </div>

          </>
        )}


        {/* ===================================================
            INSIGHTS
        =================================================== */}

        {activeTab === "Insights" && (
          <>

            <div className="section-heading">

              <div>

                <span>
                  💡 KEY INSIGHTS
                </span>

                <h2>
                  What the Dataset
                  Shows
                </h2>

              </div>

              <p>
                Important observations
                derived from the
                analyzed dataset.
              </p>

            </div>


            <div className="insight-grid">


              <div className="insight-card">

                <div className="insight-icon">
                  🌧️
                </div>

                <span>
                  RAINFALL PEAK
                </span>

                <h3>
                  {
                    highestRainfallMonth
                  }
                </h3>

                <p>
                  This month has the
                  highest average
                  rainfall in the
                  selected dataset.
                </p>

              </div>


              <div className="insight-card">

                <div className="insight-icon">
                  🌊
                </div>

                <span>
                  FLOOD PEAK
                </span>

                <h3>
                  {
                    highestFloodMonth
                  }
                </h3>

                <p>
                  This month records
                  the highest number
                  of flood events.
                </p>

              </div>


              <div className="insight-card">

                <div className="insight-icon">
                  📍
                </div>

                <span>
                  LOCATION
                </span>

                <h3>
                  {
                    highestFloodLocation
                  }
                </h3>

                <p>
                  This location has
                  the highest number
                  of recorded flood
                  events.
                </p>

              </div>


              <div className="insight-card">

                <div className="insight-icon">
                  📊
                </div>

                <span>
                  CORRELATION
                </span>

                <h3>
                  {correlation.toFixed(
                    3
                  )}
                </h3>

                <p>
                  Correlation value
                  between rainfall
                  amount and
                  flood-event
                  indicator in this
                  dataset.
                </p>

              </div>


              <div className="insight-card">

                <div className="insight-icon">
                  🌊
                </div>

                <span>
                  FLOOD EVENT RATE
                </span>

                <h3>
                  {floodPercentage.toFixed(
                    2
                  )}
                  %
                </h3>

                <p>
                  Percentage of
                  records marked as
                  flood events.
                </p>

              </div>


              <div className="insight-card">

                <div className="insight-icon">
                  ⛈️
                </div>

                <span>
                  MAXIMUM RAINFALL
                </span>

                <h3>
                  {maximumRainfall.toFixed(
                    1
                  )}{" "}
                  mm
                </h3>

                <p>
                  Highest rainfall
                  value found in the
                  selected records.
                </p>

              </div>

            </div>


            <div className="dataset-note">

              <div className="dataset-note-icon">
                ℹ️
              </div>

              <div>

                <h3>
                  About the Dataset
                </h3>

                <p>
                  This micro project
                  uses a synthetic
                  educational dataset
                  created for data
                  exploration and
                  visualization. The
                  results are intended
                  for academic analysis
                  and demonstration,
                  not for official flood
                  warnings or
                  operational
                  forecasting.
                </p>

              </div>

            </div>

          </>
        )}

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">

        <div>

          <strong>
            Rainfall Patterns &
            Flood Risk Analysis
          </strong>

          <span>
            Data Exploration &
            Visualization
          </span>

        </div>

        <p>
          B.Tech Artificial
          Intelligence & Data
          Science • Academic
          Project
        </p>

      </footer>

    </div>
  );
}


export default App;