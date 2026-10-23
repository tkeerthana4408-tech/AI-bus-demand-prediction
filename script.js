/**
 * AI-Based Bus Passenger Demand Prediction and Extra Bus Alert System
 * Tirupur Bus Stand Terminal Monitoring & Decision Support System
 *
 * Frontend Controller connected to Python Flask REST API & Trained ML Model
 */

// Flask Backend API Endpoint
const API_URL = "/predict";

// DOM Form & Input Elements
const predictionForm = document.getElementById("predictionForm");
const busRouteInput = document.getElementById("busRoute");
const arrivalTimeInput = document.getElementById("arrivalTime");
const busCapacityInput = document.getElementById("busCapacity");
const currentPassengersInput = document.getElementById("currentPassengers");
const historicalAverageInput = document.getElementById("historicalAverage");
const minutesRemainingInput = document.getElementById("minutesRemaining");
const predictBtn = document.getElementById("predictBtn");
const formErrorMessage = document.getElementById("formErrorMessage");

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
const presetMediumCrowdBtn = document.getElementById("presetMediumCrowd");
const presetNormalCrowdBtn = document.getElementById("presetNormalCrowd");
const resetDefaultsBtn = document.getElementById("resetDefaults");


/**
 * Maps entered route string to one of the 5 canonical model routes
 */
function getMLRoute(routeText) {
  const text = (routeText || "").toLowerCase();
  if (text.includes("coimbatore")) return "Tiruppur-Coimbatore";
  if (text.includes("kangeyam")) return "Tiruppur-Kangeyam";
  if (text.includes("palladam")) return "Tiruppur-Palladam";
  if (text.includes("udumalpet")) return "Tiruppur-Udumalpet";
  return "Tiruppur-Avinashi"; // Default Tiruppur hub corridor
}

/**
 * Returns current day of the week for temporal features
 */
function getCurrentDay() {
  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
  ];
  return days[new Date().getDay()];
}

/**
 * Parses scheduled arrival time string into integer hour (0-23)
 */
function getHour() {
  const time = arrivalTimeInput.value;
  if (!time) return 12;
  const parts = time.split(":");
  const hour = parseInt(parts[0], 10);
  return isNaN(hour) ? 12 : hour;
}

/**
 * Display inline validation error banner
 */
function showError(message, inputElement = null) {
  if (formErrorMessage) {
    formErrorMessage.textContent = message;
    formErrorMessage.style.display = "flex";
  }
  if (inputElement) {
    inputElement.classList.add("input-invalid");
    inputElement.focus();
  }
}

/**
 * Clear validation errors
 */
function clearError() {
  if (formErrorMessage) {
    formErrorMessage.textContent = "";
    formErrorMessage.style.display = "none";
  }
  const inputs = [
    busRouteInput,
    arrivalTimeInput,
    busCapacityInput,
    currentPassengersInput,
    historicalAverageInput,
    minutesRemainingInput
  ];
  inputs.forEach(input => {
    if (input) input.classList.remove("input-invalid");
  });
}

/**
 * Form Input Validation
 * Enforces non-empty, non-negative, and currentPassengers <= busCapacity
 */
function validateInputs() {
  clearError();

  const route = busRouteInput.value.trim();
  if (!route) {
    showError("Please enter or select a bus route.", busRouteInput);
    return null;
  }

  const time = arrivalTimeInput.value.trim();
  if (!time) {
    showError("Please specify scheduled arrival time.", arrivalTimeInput);
    return null;
  }

  const capacityStr = busCapacityInput.value.trim();
  if (capacityStr === "" || isNaN(capacityStr)) {
    showError("Please enter scheduled bus capacity.", busCapacityInput);
    return null;
  }
  const busCapacity = parseInt(capacityStr, 10);
  if (busCapacity <= 0) {
    showError("Bus capacity must be at least 1 seat.", busCapacityInput);
    return null;
  }

  const currentStr = currentPassengersInput.value.trim();
  if (currentStr === "" || isNaN(currentStr)) {
    showError("Please enter current waiting passengers.", currentPassengersInput);
    return null;
  }
  const currentPassengers = parseInt(currentStr, 10);
  if (currentPassengers < 0) {
    showError("Current waiting passengers cannot be negative.", currentPassengersInput);
    return null;
  }

  const historicalStr = historicalAverageInput.value.trim();
  if (historicalStr === "" || isNaN(historicalStr)) {
    showError("Please enter historical average passengers.", historicalAverageInput);
    return null;
  }
  const historicalAverage = parseInt(historicalStr, 10);
  if (historicalAverage < 0) {
    showError("Historical average passengers cannot be negative.", historicalAverageInput);
    return null;
  }

  const minutesStr = minutesRemainingInput.value.trim();
  if (minutesStr === "" || isNaN(minutesStr)) {
    showError("Please enter minutes remaining before arrival.", minutesRemainingInput);
    return null;
  }
  const minutesRemaining = parseInt(minutesStr, 10);
  if (minutesRemaining < 0) {
    showError("Minutes remaining cannot be negative.", minutesRemainingInput);
    return null;
  }

  // Constraint: Current waiting passengers cannot exceed bus capacity
  if (currentPassengers > busCapacity) {
    showError(
      `Current waiting passengers (${currentPassengers}) cannot exceed scheduled bus capacity (${busCapacity}).`,
      currentPassengersInput
    );
    return null;
  }

  return {
    route,
    time,
    busCapacity,
    currentPassengers,
    historicalAverage,
    minutesRemaining
  };
}

/**
 * Updates all DOM elements with the calculated ML prediction metrics
 */
function updateDashboardUI(apiResult, inputs) {
  const predictedDemand = Number(apiResult.predicted_passengers);
  const busCapacity = inputs.busCapacity;
  const difference = apiResult.difference !== undefined 
    ? Number(apiResult.difference) 
    : Number((predictedDemand - busCapacity).toFixed(2));
  const utilization = apiResult.utilization_percentage !== undefined
    ? apiResult.utilization_percentage
    : Math.round((predictedDemand / busCapacity) * 100);

  const ratio = busCapacity > 0 ? (predictedDemand / busCapacity) : 0;
  const isHighCrowd = ratio >= 0.90;
  const isMediumCrowd = ratio >= 0.75 && ratio < 0.90;

  // 1. Update Primary Alert Banner
  if (isHighCrowd) {
    alertBanner.className = "alert-banner alert-high";
    alertIcon.textContent = "⚠️";
    crowdStatusText.textContent = "HIGH CROWD EXPECTED";
    busRecommendationText.textContent = "EXTRA BUS RECOMMENDED";
  } else if (isMediumCrowd) {
    alertBanner.className = "alert-banner alert-medium";
    alertIcon.textContent = "ℹ️";
    crowdStatusText.textContent = "MEDIUM CROWD EXPECTED";
    busRecommendationText.textContent = "EXTRA BUS NOT REQUIRED";
  } else {
    alertBanner.className = "alert-banner alert-normal";
    alertIcon.textContent = "✅";
    crowdStatusText.textContent = "LOW CROWD EXPECTED";
    busRecommendationText.textContent = "EXTRA BUS NOT REQUIRED";
  }

  // 2. Update KPI Cards
  kpiPredictedDemand.textContent = Math.round(predictedDemand);
  kpiBusCapacity.textContent = busCapacity;

  const incoming = Math.max(0, Math.round(predictedDemand - inputs.currentPassengers));
  kpiIncomingBreakdown.textContent = `Includes ~${incoming} incoming`;

  const diffSign = difference > 0 ? `+${difference.toFixed(1)}` : `${difference.toFixed(1)}`;
  kpiDifference.textContent = diffSign;

  if (difference > 0) {
    kpiDifference.className = "metric-value diff-overload";
    diffStatusText.textContent = `${Math.abs(difference).toFixed(1)} pax above capacity (Overcapacity)`;
  } else if (difference < 0) {
    kpiDifference.className = "metric-value diff-normal";
    diffStatusText.textContent = `${Math.abs(difference).toFixed(1)} spare seats remaining`;
  } else {
    kpiDifference.className = "metric-value";
    diffStatusText.textContent = "Exactly at full capacity";
  }

  // Crowd status pill
  if (isHighCrowd) {
    kpiCrowdStatus.textContent = "HIGH";
    kpiCrowdStatus.className = "metric-value status-indicator status-high";
  } else if (isMediumCrowd) {
    kpiCrowdStatus.textContent = "MEDIUM";
    kpiCrowdStatus.className = "metric-value status-indicator status-medium";
  } else {
    kpiCrowdStatus.textContent = "LOW";
    kpiCrowdStatus.className = "metric-value status-indicator status-normal";
  }

  kpiCapacityUtilization.textContent = `${utilization}% of capacity`;

  // 3. Update Detailed Breakdown List
  summaryCurrent.textContent = `${inputs.currentPassengers} passengers`;
  summaryIncoming.textContent = `+${incoming} passengers (ML inference)`;
  const rate = inputs.minutesRemaining > 0 
    ? (incoming / inputs.minutesRemaining).toFixed(1) 
    : "0.0";
  summaryRate.textContent = `${rate} passengers/min (est.)`;
  summaryTotal.textContent = `${Math.round(predictedDemand)} passengers (${difference > 0 ? "Exceeds Capacity" : "Within Capacity"})`;
}

/**
 * Sends validated form inputs to the Flask REST API endpoint /predict
 */
async function predictPassengerDemand() {
  const validData = validateInputs();
  if (!validData) return;

  const hour = getHour();
  const route = getMLRoute(validData.route);
  const day = getCurrentDay();
  const weather = "Normal";

  const requestPayload = {
    Bus_Capacity: validData.busCapacity,
    Current_Passengers: validData.currentPassengers,
    Historical_Average: validData.historicalAverage,
    Hour: hour,
    Day: day,
    Route: route,
    Weather: weather
  };

  const originalBtnHTML = predictBtn ? predictBtn.innerHTML : "";

  try {
    if (predictBtn) {
      predictBtn.disabled = true;
      predictBtn.innerHTML = "<span>⏳ Evaluating with Random Forest...</span>";
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `Server responded with status ${response.status}`);
    }

    updateDashboardUI(data, validData);
  } catch (error) {
    console.error("Prediction API Error:", error);
    showError(error.message || "Unable to connect to the ML prediction server. Ensure Flask is running.");
  } finally {
    if (predictBtn) {
      predictBtn.disabled = false;
      predictBtn.innerHTML = originalBtnHTML;
    }
  }
}

/**
 * Pre-set Scenarios for Quick Testing and Academic Presentations
 */
const SCENARIOS = {
  highCrowd: {
    route: "Route 20A - Tirupur Old Bus Stand to Avinashi",
    time: "17:30",
    capacity: 50,
    current: 45,
    historical: 65,
    minutesRemaining: 15
  },
  mediumCrowd: {
    route: "Route 15 - Tirupur Bus Stand to Palladam",
    time: "15:00",
    capacity: 50,
    current: 38,
    historical: 42,
    minutesRemaining: 15
  },
  normalCrowd: {
    route: "Route 12B - Tirupur New Bus Stand to Kangeyam",
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
  clearError();
  busRouteInput.value = scenario.route;
  arrivalTimeInput.value = scenario.time;
  busCapacityInput.value = scenario.capacity;
  currentPassengersInput.value = scenario.current;
  historicalAverageInput.value = scenario.historical;
  minutesRemainingInput.value = scenario.minutesRemaining;

  predictPassengerDemand();
}

// Input change listeners to clear error states automatically
[busRouteInput, arrivalTimeInput, busCapacityInput, currentPassengersInput, historicalAverageInput, minutesRemainingInput].forEach(input => {
  if (input) {
    input.addEventListener("input", () => {
      clearError();
    });
  }
});

// Event Listeners
predictionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  predictPassengerDemand();
});

presetHighCrowdBtn.addEventListener("click", () => {
  applyScenario(SCENARIOS.highCrowd);
});

if (presetMediumCrowdBtn) {
  presetMediumCrowdBtn.addEventListener("click", () => {
    applyScenario(SCENARIOS.mediumCrowd);
  });
}

presetNormalCrowdBtn.addEventListener("click", () => {
  applyScenario(SCENARIOS.normalCrowd);
});

resetDefaultsBtn.addEventListener("click", () => {
  applyScenario(SCENARIOS.default);
});

// Execute initial evaluation on page load
window.addEventListener("DOMContentLoaded", () => {
  predictPassengerDemand();
});
