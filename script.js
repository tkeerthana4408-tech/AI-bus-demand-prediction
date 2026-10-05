/**
 * AI-Based Bus Passenger Demand Prediction
 * Frontend connected to Flask ML API
 */

// API endpoint
const API_URL = "/predict";

// DOM Element References
const predictionForm = document.getElementById("predictionForm");

const busRouteInput = document.getElementById("busRoute");
const arrivalTimeInput = document.getElementById("arrivalTime");
const busCapacityInput = document.getElementById("busCapacity");
const currentPassengersInput = document.getElementById("currentPassengers");
const historicalAverageInput = document.getElementById("historicalAverage");
const minutesRemainingInput = document.getElementById("minutesRemaining");

// Output Elements
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

// Breakdown Elements
const summaryCurrent = document.getElementById("summaryCurrent");
const summaryIncoming = document.getElementById("summaryIncoming");
const summaryRate = document.getElementById("summaryRate");
const summaryTotal = document.getElementById("summaryTotal");

// Preset Buttons
const presetHighCrowdBtn = document.getElementById("presetHighCrowd");
const presetNormalCrowdBtn = document.getElementById("presetNormalCrowd");
const resetDefaultsBtn = document.getElementById("resetDefaults");


/*
 * Convert the existing route text into
 * one of the routes used while training the ML model.
 */
function getMLRoute(routeText) {

  if (routeText.includes("Avinashi")) {
    return "Tiruppur-Avinashi";
  }

  if (routeText.includes("Coimbatore")) {
    return "Tiruppur-Coimbatore";
  }

  if (routeText.includes("Kangeyam")) {
    return "Tiruppur-Kangeyam";
  }

  if (routeText.includes("Palladam")) {
    return "Tiruppur-Palladam";
  }

  if (routeText.includes("Udumalpet")) {
    return "Tiruppur-Udumalpet";
  }

  // Default route
  return "Tiruppur-Avinashi";
}


/*
 * Get current day.
 */
function getCurrentDay() {

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  return days[new Date().getDay()];
}


/*
 * Convert arrival time into hour.
 */
function getHour() {

  const time = arrivalTimeInput.value;

  if (!time) {
    return 12;
  }

  return parseInt(time.split(":")[0], 10);
}


/*
 * Send input data to Flask ML API.
 */
async function predictPassengerDemand() {

  const currentPassengers =
    parseInt(currentPassengersInput.value, 10) || 0;

  const historicalAverage =
    parseInt(historicalAverageInput.value, 10) || 0;

  const busCapacity =
    parseInt(busCapacityInput.value, 10) || 1;

  const hour = getHour();

  const route = getMLRoute(busRouteInput.value);

  const day = getCurrentDay();

  // Weather is currently set to Normal
  // because the existing form does not have a weather input.
  const weather = "Normal";


  const requestData = {

    Bus_Capacity: busCapacity,

    Current_Passengers: currentPassengers,

    Historical_Average: historicalAverage,

    Hour: hour,

    Day: day,

    Route: route,

    Weather: weather
  };


  try {

    const response = await fetch(API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(requestData)

    });


    if (!response.ok) {
      throw new Error("Prediction API error");
    }


    const result = await response.json();


    const predictedDemand =
      Number(result.predicted_passengers);

    const difference =
      predictedDemand - busCapacity;


    const utilization =
      busCapacity > 0
        ? Math.round((predictedDemand / busCapacity) * 100)
        : 0;


    const isHighCrowd =
      predictedDemand >= busCapacity * 0.90;


    /*
     * Update Alert Banner
     */

    if (isHighCrowd) {

      alertBanner.className =
        "alert-banner alert-high";

      alertIcon.textContent = "⚠️";

    } else {

      alertBanner.className =
        "alert-banner alert-normal";

      alertIcon.textContent = "✅";
    }


    crowdStatusText.textContent =
      isHighCrowd
        ? "HIGH CROWD EXPECTED"
        : "NORMAL CROWD EXPECTED";


    busRecommendationText.textContent =
      result.alert;


    /*
     * Update KPI cards
     */

    kpiPredictedDemand.textContent =
      predictedDemand.toFixed(2);

    kpiBusCapacity.textContent =
      busCapacity;


    const diffSign =
      difference > 0
        ? `+${difference.toFixed(2)}`
        : difference.toFixed(2);


    kpiDifference.textContent =
      diffSign;


    if (difference > 0) {

      kpiDifference.className =
        "metric-value diff-overload";

      diffStatusText.textContent =
        `${difference.toFixed(2)} passengers above capacity`;

    } else if (difference < 0) {

      kpiDifference.className =
        "metric-value diff-normal";

      diffStatusText.textContent =
        `${Math.abs(difference).toFixed(2)} spare seats remaining`;

    } else {

      kpiDifference.className =
        "metric-value";

      diffStatusText.textContent =
        "Exactly at full capacity";
    }


    /*
     * Crowd status
     */

    kpiCrowdStatus.textContent =
      isHighCrowd ? "HIGH" : "NORMAL";


    kpiCrowdStatus.className =
      `metric-value status-indicator ${
        isHighCrowd
          ? "status-high"
          : "status-normal"
      }`;


    kpiCapacityUtilization.textContent =
      `${utilization}% capacity utilization`;


    /*
     * Breakdown
     */

    summaryCurrent.textContent =
      `${currentPassengers} passengers`;

    summaryIncoming.textContent =
      "ML model prediction";

    summaryRate.textContent =
      `Historical average: ${historicalAverage}`;

    summaryTotal.textContent =
      `${predictedDemand.toFixed(2)} passengers ${
        difference > 0
          ? "(Exceeds Capacity)"
          : "(Within Capacity)"
      }`;

  }

  catch (error) {

    console.error(error);

    alert(
      "Unable to connect to the ML prediction server."
    );
  }
}


/*
 * Handle form submission
 */

predictionForm.addEventListener("submit", function(event) {

  event.preventDefault();

  predictPassengerDemand();

});


/*
 * Demo Scenarios
 */

const SCENARIOS = {

  highCrowd: {

    route:
      "Route 20A - Tirupur Old Bus Stand to Avinashi (Peak Hour)",

    time: "17:30",

    capacity: 50,

    current: 45,

    historical: 65,

    minutesRemaining: 15
  },


  normalCrowd: {

    route:
      "Route 12B - Tirupur New Bus Stand to Kangeyam (Mid-day)",

    time: "14:15",

    capacity: 55,

    current: 20,

    historical: 35,

    minutesRemaining: 10
  },


  default: {

    route:
      "Route 20A - Tirupur Old Bus Stand to Avinashi",

    time: "16:45",

    capacity: 50,

    current: 42,

    historical: 60,

    minutesRemaining: 15
  }
};


/*
 * Apply scenario
 */

function applyScenario(scenario) {

  busRouteInput.value =
    scenario.route;

  arrivalTimeInput.value =
    scenario.time;

  busCapacityInput.value =
    scenario.capacity;

  currentPassengersInput.value =
    scenario.current;

  historicalAverageInput.value =
    scenario.historical;

  minutesRemainingInput.value =
    scenario.minutesRemaining;


  predictPassengerDemand();
}


/*
 * Preset buttons
 */

presetHighCrowdBtn.addEventListener(
  "click",
  function() {

    applyScenario(
      SCENARIOS.highCrowd
    );

  }
);


presetNormalCrowdBtn.addEventListener(
  "click",
  function() {

    applyScenario(
      SCENARIOS.normalCrowd
    );

  }
);


resetDefaultsBtn.addEventListener(
  "click",
  function() {

    applyScenario(
      SCENARIOS.default
    );

  }
);


/*
 * Initial prediction
 */

window.addEventListener(
  "DOMContentLoaded",
  function() {

    predictPassengerDemand();

  }
);
