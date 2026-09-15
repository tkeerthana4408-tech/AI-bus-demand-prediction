# AI-Based Bus Passenger Demand Prediction and Extra Bus Alert System

**Location Context:** Tirupur Bus Stand Terminal Monitoring & Decision Support System  
**Academic Prototype:** Version 1.0 (HTML / CSS / JavaScript)

---

## 📌 Problem Statement
Passengers at Tirupur Bus Stand wait for scheduled buses while the crowd increases as the arrival time approaches. Current crowd information alone cannot tell how many passengers will arrive before the bus reaches the stand, often resulting in severe overcrowding.

## 🎯 Objective
Estimate future passenger demand before a scheduled bus arrives and provide an early alert when predicted demand may exceed bus capacity, recommending an extra bus deployment in advance.

---

## 📋 Current Review 1 Progress
The current working prototype successfully delivers the foundational milestone for project Review 1:
- **Problem Identification:** Formulated the challenge of passenger buildup and unpredictable boarding congestion at Tirupur Bus Stand.
- **Solution Design:** Designed a predictive demand assessment framework and alert workflow to support proactive bus dispatch decisions.
- **Web Dashboard:** Developed a clean, responsive, single-page interface for transit controllers and project demonstration.
- **Passenger Input Module:** Interactive parameter input fields capturing live terminal counts and scheduled trip details.
- **Demand Prediction Prototype:** Real-time baseline calculation projecting passenger count at the exact moment of bus arrival.
- **Bus Capacity Comparison:** Automated comparison between projected demand and scheduled bus seating/standing limit.
- **Crowd Status Evaluation:** Dynamic classification of passenger load into Normal and High Crowd categories.
- **Extra Bus Recommendation:** High-visibility decision recommendation system triggering extra vehicle alerts when demand exceeds capacity.
- **Quick Demo Scenarios:** One-click scenario presets enabling instant testing and evaluation during project presentations.
- **GitHub Repository:** Source control repository initialized and maintained with structured version tracking.

---

## ⚙️ Prototype Prediction Method
The current version utilizes an isolated, **rule-based / heuristic estimation method** implemented directly in client-side JavaScript (`script.js`):

$$\text{Arrival Rate (passengers/min)} = \frac{\text{Historical Average}}{30\text{ minutes}}$$
$$\text{Estimated New Arrivals} = \text{Arrival Rate} \times \text{Minutes Remaining}$$
$$\text{Predicted Passenger Demand} = \text{Current Waiting Passengers} + \text{Estimated New Arrivals}$$

> [!IMPORTANT]
> **Prototype Baseline Disclaimer:**  
> This version uses a heuristic calculation formula for demonstration and functional workflow validation. **This is NOT a trained Machine Learning model yet.** The calculation module (`predictPassengerDemand()`) is deliberately decoupled so a trained ML model (e.g., Random Forest, XGBoost, or Time-Series Neural Network) can be integrated via an API endpoint in upcoming project phases.

---

## 🚀 Features
- **Real-Time Parameter Inputs**:
  - Bus Route / Name
  - Scheduled Bus Arrival Time
  - Bus Capacity (Seats / Limit)
  - Current Waiting Passengers (Headcount at platform)
  - Historical Average Passengers (Time slot profile)
  - Minutes Remaining Before Arrival
- **Intelligent Demand Calculation**: Baseline estimation calculating incoming passenger buildup rate prior to vehicle arrival.
- **Dynamic Fleet Alerts**:
  - ⚠️ **`HIGH CROWD EXPECTED`** & **`EXTRA BUS RECOMMENDED`** when predicted demand > capacity.
  - ✅ **`NORMAL CROWD EXPECTED`** & **`EXTRA BUS NOT REQUIRED`** when capacity is sufficient.
- **Quick Demo Scenarios**: 1-click test scenarios for presentations and evaluations.
- **Modular Design**: Prediction logic is isolated in `script.js` (`predictPassengerDemand()`) for future integration with a trained Machine Learning model.

---

## 🧪 Testing & Validation Scenarios

The prototype has been validated against the following operational test cases:

### Scenario 1 – High Crowd (Surge / Extra Bus Triggered)
- **Current Waiting Passengers:** 42
- **Bus Capacity:** 50
- **Historical Average:** 60
- **Minutes Remaining:** 15
- **Calculation:** $42 + \left(\frac{60}{30} \times 15\right) = 42 + 30 = 72\text{ passengers}$
- **Predicted Demand:** 72
- **Capacity Difference:** +22 passengers (Overcapacity)
- **Result:**
  - Status: **`HIGH CROWD EXPECTED`**
  - Alert: **`EXTRA BUS RECOMMENDED`**

### Scenario 2 – Normal Flow (Capacity Sufficient)
- **Current Waiting Passengers:** 20
- **Bus Capacity:** 55
- **Historical Average:** 35
- **Minutes Remaining:** 10
- **Calculation:** $20 + \left(\frac{35}{30} \times 10\right) = 20 + 12 = 32\text{ passengers}$
- **Predicted Demand:** 32
- **Capacity Difference:** -23 seats (Available Surplus)
- **Result:**
  - Status: **`NORMAL CROWD EXPECTED`**
  - Alert: **`EXTRA BUS NOT REQUIRED`**

---

## 📂 Project Structure
```
AI-Bus-Demand-Prediction/
├── index.html       # Web dashboard interface & KPI presentation
├── style.css        # Responsive transit command-center styling
├── script.js        # Form handler, modular prediction engine & alerts
└── README.md        # Project documentation and review progress
```

---

## 💻 How to Run
1. Clone or download this repository.
2. Open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
3. No build tools, external libraries, or backends required for this prototype.

---

## ⚠️ Current Limitations
The current Review 1 deliverable represents an early academic prototype with the following known limitations:
- **Manual Input:** Terminal counts and schedule parameters are currently entered manually via the web form.
- **No Real Historical Dataset:** Real historical passenger travel datasets from Tirupur transport divisions have not yet been integrated.
- **No Trained ML Model:** The prediction logic is a heuristic baseline and does not yet employ a trained regression or machine learning model.
- **No Live CCTV / Vision Integration:** Automated computer-vision passenger counting from terminal cameras is not yet implemented.
- **No Automated Authority Dispatch:** Automated SMS/email alerts to transit depot managers or transport corporations are not yet connected.

---

## 🔮 Future Scope
Future phases of this project will build upon this prototype framework:
1. **Real Passenger Data Collection:** Gathering physical passenger boarding logs and peak-hour counts at Tirupur Bus Stand.
2. **Historical Dataset Creation:** Structuring historical datasets including route numbers, day of week, weather conditions, festival calendars, and time intervals.
3. **Machine Learning Model Development:** Training regression/time-series models (e.g., Random Forest, XGBoost, or LSTM) to model passenger arrival trends accurately.
4. **Real-Time Passenger Counting:** Integrating OpenCV / YOLO computer vision modules on CCTV feeds for automated platform headcount.
5. **Website & ML Model Integration:** Connecting the web dashboard to an ML inference backend (e.g., Python FastAPI/Flask) via REST APIs.
6. **Automatic Alerts:** Dispatching automated notifications (SMS / Telegram / Dashboard webhook) to bus depot managers.
7. **Cloud Deployment:** Hosting the complete predictive system on cloud infrastructure for multi-terminal tracking.

---

## 🎓 Academic Note
This project repository represents a **working academic prototype** developed for preliminary evaluation (Review 1). It establishes the problem statement, functional workflow, UI dashboard, and decision alert system. Advanced modules—including machine learning model training, live CCTV passenger vision, real historical dataset collection, and automated fleet dispatch integration—are planned for development in subsequent review phases.
