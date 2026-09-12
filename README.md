# AI-Based Bus Passenger Demand Prediction and Extra Bus Alert System

**Location Context:** Tirupur Bus Stand Terminal Monitoring & Decision Support System  
**Academic Prototype:** Version 1.0 (HTML / CSS / JavaScript)

---

## 📌 Problem Statement
Passengers at Tirupur Bus Stand wait for scheduled buses while the crowd increases as the arrival time approaches. Current crowd information alone cannot tell how many passengers will arrive before the bus reaches the stand, often resulting in severe overcrowding.

## 🎯 Objective
Estimate future passenger demand before a scheduled bus arrives and provide an early alert when predicted demand may exceed bus capacity, recommending an extra bus deployment in advance.

---

## 🚀 Features
- **Real-Time Parameter Inputs**:
  - Bus Route / Name
  - Scheduled Bus Arrival Time
  - Bus Capacity (Seats / Limit)
  - Current Waiting Passengers (Headcount at platform)
  - Historical Average Passengers (Time slot profile)
  - Minutes Remaining Before Arrival
- **Intelligent Demand Calculation**: Heuristic baseline estimation calculating incoming passenger buildup rate prior to vehicle arrival.
- **Dynamic Fleet Alerts**:
  - ⚠️ **`HIGH CROWD EXPECTED`** & **`EXTRA BUS RECOMMENDED`** when predicted demand > capacity.
  - ✅ **`NORMAL CROWD EXPECTED`** & **`EXTRA BUS NOT REQUIRED`** when capacity is sufficient.
- **Quick Demo Scenarios**: 1-click test scenarios for presentations and evaluations.
- **Modular Design**: Prediction logic is isolated in `script.js` (`predictPassengerDemand()`) for future integration with a trained Machine Learning model (e.g., Python Flask/FastAPI serving Random Forest or XGBoost).

---

## 📂 Project Structure
```
AI-Bus-Demand-Prediction/
├── index.html       # Web dashboard interface & KPI presentation
├── style.css        # Responsive transit command-center styling
└── script.js        # Form handler, modular prediction engine & alerts
```

---

## 💻 How to Run
1. Clone or download this repository.
2. Open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
3. No server or build step required.
