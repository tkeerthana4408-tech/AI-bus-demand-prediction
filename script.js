/**
 * AI-Based Bus Passenger Demand Prediction and Extra Bus Alert System
 * Client-side Controller & Heuristic Demand Engine
 *
 * NOTE FOR COLLEGE PROJECT EVALUATION:
 * This prototype uses a decoupled baseline prediction engine (`predictPassengerDemand`).
 * It simulates passenger arrival trends based on historical observation rates.
 * In a future phase, this isolated function can be directly replaced by an API request
 * to a trained Machine Learning model (e.g., Python Flask/FastAPI serving an XGBoost,
 * Random Forest, or LSTM model).
 */

// DOM Element References
const predictionForm = document.getElementById("predictionForm");
const busRouteInput = document.getElementById("busRoute");
const arrivalTimeInput = document.getElementById("arrivalTime");
const busCapacityInput = document.getElementById("busCapacity");
const currentPassengersInput = document.getElementById("currentPassengers");
const historicalAverageInput = document.getElementById("historicalAverage");
const minutesRemainingInput = document.getElementById("minutesRemaining");

// Output & KPI Elements
const alertBanner = document.getElementById("alertBanner");
const alertIcon = document.getElementById("alertIcon");
const crowdStatusText = document.getElementById("crowdStatusText");
const busRecommendationText = document.getElementById("busRecommendationText");

const kpiPredictedDemand = document.getElementById("kpiPredictedDemand");
const kpiBusCapacity = document.getElementById("kpiBusCapacity");
const kpiDifference = document.getElementById("kpiDifference");
const kpiCrowdStatus = document.getElementById("kpiCrowdStatus");
const kpiIncomingBreakdown = document.getElementById("kpiIncomingBreakdown");
const kpiCapacityUtilization = document.getElementById("kpiCapacityUtilization");
const diffStatusText = document.getElementById("diffStatusText");

// Breakdown Summary Elements
const summaryCurrent = document.getElementById("summaryCurrent");
const summaryIncoming = document.getElementById("summaryIncoming");
const summaryRate = document.getElementById("summaryRate");
const summaryTotal = document.getElementById("summaryTotal");

// Preset Action Buttons
const presetHighCrowdBtn = document.getElementById("presetHighCrowd");
const presetNormalCrowdBtn = document.getElementById("presetNormalCrowd");
const resetDefaultsBtn = document.getElementById("resetDefaults");

/**
 * ==========================================================================
 * DECOUPLED PREDICTION ENGINE (PROTOTYPE BASELINE)
 * ==========================================================================
 * 
 * Future Integration Guide:
 * Replace this function with an async call to your ML backend:
 * 
 * async function predictPassengerDemand(params) {
 *   const response = await fetch('/api/predict', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(params)
 *   });
 *   return await response.json();
 * }
 */
function predictPassengerDemand({
  currentPassengers,
  historicalAverage,
  minutesRemaining,
  busCapacity
}) {
  // Baseline arrival window assumption (30-minute standard pre-arrival buildup)
  const observationWindowMins = 30;

  // Rate of arrivals per minute deduced from historical time-slot volume
  const arrivalRatePerMinute = historicalAverage > 0 ? (historicalAverage / observationWindowMins) : 0;

  // Estimated incoming passengers before the bus physically arrives at Tirupur platform
  const estimatedNewArrivals = Math.max(0, Math.round(arrivalRatePerMinute * minutesRemaining));

  // Total predicted future demand when bus doors open
  const predictedDemand = Math.max(0, currentPassengers + estimatedNewArrivals);

  // Difference calculation: (Predicted Demand - Bus Capacity)
  // Positive value (+) = shortage / overcrowding
  // Negative value (-) = surplus seats available
  const difference = predictedDemand - busCapacity;

  // Overcrowding threshold condition
  const isHighCrowd = predictedDemand > busCapacity;

  // Alert and status copy matching project requirements exactly
  const alertTitle = isHighCrowd ? "HIGH CROWD EXPECTED" : "NORMAL CROWD EXPECTED";
  const alertRecommendation = isHighCrowd ? "EXTRA BUS RECOMMENDED" : "EXTRA BUS NOT REQUIRED";
  const crowdStatus = isHighCrowd ? "HIGH CROWD" : "NORMAL CROWD";

  // Additional analytics: percentage of bus capacity requested
  const utilizationPercentage = busCapacity > 0 ? Math.round((predictedDemand / busCapacity) * 100) : 0;

  return {
    predictedDemand,
    busCapacity,
    difference,
    estimatedNewArrivals,
    arrivalRatePerMinute,
    isHighCrowd,
    crowdStatus,
    alertTitle,
    alertRecommendation,
    utilizationPercentage
  };
}

/**
 * Updates all DOM elements with the calculated prediction metrics
 */
function updateDashboardUI(result, inputs) {
  // 1. Update Primary Alert Banner
  if (result.isHighCrowd) {
    alertBanner.className = "alert-banner alert-high";
    alertIcon.textContent = "⚠️";
  } else {
    alertBanner.className = "alert-banner alert-normal";
    alertIcon.textContent = "✅";
  }

  crowdStatusText.textContent = result.alertTitle;
  busRecommendationText.textContent = result.alertRecommendation;

  // 2. Update KPI Cards
  kpiPredictedDemand.textContent = result.predictedDemand;
  kpiBusCapacity.textContent = result.busCapacity;
  kpiIncomingBreakdown.textContent = `Includes ~${result.estimatedNewArrivals} incoming`;

  // Format difference with explicit sign (+ / -)
  const diffSign = result.difference > 0 ? `+${result.difference}` : `${result.difference}`;
  kpiDifference.textContent = diffSign;

  if (result.difference > 0) {
    kpiDifference.className = "metric-value diff-overload";
    diffStatusText.textContent = `${result.difference} passengers above capacity`;
  } else if (result.difference < 0) {
    kpiDifference.className = "metric-value diff-normal";
    diffStatusText.textContent = `${Math.abs(result.difference)} spare seats remaining`;
  } else {
    kpiDifference.className = "metric-value";
    diffStatusText.textContent = "Exactly at full capacity";
  }

  // Crowd status pill
  kpiCrowdStatus.textContent = result.isHighCrowd ? "HIGH" : "NORMAL";
  kpiCrowdStatus.className = `metric-value status-indicator ${result.isHighCrowd ? "status-high" : "status-normal"}`;
  kpiCapacityUtilization.textContent = `${result.utilizationPercentage}% capacity utilization`;

  // 3. Update Detailed Breakdown List
  summaryCurrent.textContent = `${inputs.currentPassengers} passengers`;
  summaryIncoming.textContent = `+${result.estimatedNewArrivals} passengers`;
  summaryRate.textContent = `${result.arrivalRatePerMinute.toFixed(1)} passengers/min`;
  summaryTotal.textContent = `${result.predictedDemand} passengers (${result.difference > 0 ? "Exceeds Capacity" : "Within Capacity"})`;
}

/**
 * Reads form values, executes demand estimation, and updates UI
 */
function handlePrediction() {
  const currentPassengers = parseInt(currentPassengersInput.value, 10) || 0;
  const historicalAverage = parseInt(historicalAverageInput.value, 10) || 0;
  const minutesRemaining = parseInt(minutesRemainingInput.value, 10) || 0;
  const busCapacity = parseInt(busCapacityInput.value, 10) || 1; // avoid division by zero

  const inputs = {
    currentPassengers,
    historicalAverage,
    minutesRemaining,
    busCapacity,
    busRoute: busRouteInput.value,
    arrivalTime: arrivalTimeInput.value
  };

  const predictionResult = predictPassengerDemand(inputs);
  updateDashboardUI(predictionResult, inputs);
}

/**
 * Pre-set Scenarios for Quick Testing and Academic Presentations
 */
const SCENARIOS = {
  highCrowd: {
    route: "Route 20A - Tirupur Old Bus Stand to Avinashi (Peak Hour)",
    time: "17:30",
    capacity: 50,
    current: 45,
    historical: 65,
    minutesRemaining: 15
  },
  normalCrowd: {
    route: "Route 12B - Tirupur New Bus Stand to Kangeyam (Mid-day)",
    time: "14:15",
    capacity: 55,
    current: 20,
    historical: 35,
    minutesRemaining: 10
  },
  default: {
    route: "Route 20A - Tirupur Old Bus Stand to Avinashi",
    time: "16:45",
    capacity: 50,
    current: 42,
    historical: 60,
    minutesRemaining: 15
  }
};

function applyScenario(scenario) {
  busRouteInput.value = scenario.route;
  arrivalTimeInput.value = scenario.time;
  busCapacityInput.value = scenario.capacity;
  currentPassengersInput.value = scenario.current;
  historicalAverageInput.value = scenario.historical;
  minutesRemainingInput.value = scenario.minutesRemaining;

  // Immediately evaluate with the new scenario values
  handlePrediction();
}

// Event Listeners
predictionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handlePrediction();
});

presetHighCrowdBtn.addEventListener("click", () => {
  applyScenario(SCENARIOS.highCrowd);
});

presetNormalCrowdBtn.addEventListener("click", () => {
  applyScenario(SCENARIOS.normalCrowd);
});

resetDefaultsBtn.addEventListener("click", () => {
  applyScenario(SCENARIOS.default);
});

// Initialize on page load with sample values
window.addEventListener("DOMContentLoaded", () => {
  handlePrediction();
});
