# AI-Based Bus Passenger Demand Prediction and Extra Bus Alert System

**Location Context:** Tirupur Bus Stand Terminal Monitoring & Decision Support System  
**Technology Stack:** Python (Flask), Scikit-Learn (Random Forest Regression), JavaScript (Fetch API), HTML5, CSS3

---

## 📌 Problem Statement
Passengers at Tirupur Bus Stand wait for scheduled buses while the platform headcount increases as the arrival time approaches. Current crowd headcount alone cannot project how many passengers will accumulate before the vehicle arrives, frequently leading to severe overcrowding and platform delays.

## 🎯 Objective
Estimate future passenger demand before a scheduled bus arrives at the platform using machine learning, evaluate capacity utilization, dynamically classify crowd levels into **High**, **Medium**, or **Low**, and trigger an automated **Extra Bus Recommendation** early enough for fleet dispatchers to deploy backup buses.

---

## 🤖 Machine Learning Model & Dataset

- **Algorithm:** Random Forest Regressor (`n_estimators=100`, `random_state=42`)
- **Model Artifact:** `bus_demand_model.pkl` (pre-trained, serialised via Joblib)
- **Dataset:** `bus_demand_dataset_500_rows.csv` (simulated synthetic records tailored for Tirupur transit corridors)
- **Target Variable:** `Actual_Passengers`
- **Evaluation Metrics (Synthetic Dataset):**
  - **MAE:** 3.43 passengers
  - **RMSE:** 4.43 passengers
  - **R² Score:** 81.15%

### 19 Input Features
The trained model consumes exactly 19 numerical and one-hot encoded features:
1. `Bus_Capacity` (Integer: Scheduled bus seat capacity)
2. `Current_Passengers` (Integer: Observed waiting platform headcount)
3. `Historical_Average` (Integer: Historical passenger volume for the slot)
4. `Hour` (Integer: 0-23 derived from scheduled arrival time)
5. `Day_Friday`, `Day_Monday`, `Day_Saturday`, `Day_Sunday`, `Day_Thursday`, `Day_Tuesday`, `Day_Wednesday` (7 Binary One-Hot indicators)
6. `Route_Tiruppur-Avinashi`, `Route_Tiruppur-Coimbatore`, `Route_Tiruppur-Kangeyam`, `Route_Tiruppur-Palladam`, `Route_Tiruppur-Udumalpet` (5 Binary One-Hot indicators)
7. `Weather_Cloudy`, `Weather_Normal`, `Weather_Rainy` (3 Binary One-Hot indicators)

---

## 📊 Crowd Classification & Alert Logic

$$\text{Capacity Utilization} = \left(\frac{\text{Predicted Passengers}}{\text{Bus Capacity}}\right) \times 100\%$$

| Utilization Threshold | Crowd Status | Alert Banner | Extra Bus Recommendation |
| :--- | :--- | :--- | :--- |
| **$\ge$ 90%** of capacity | **HIGH CROWD** | ⚠️ `HIGH CROWD EXPECTED` | 🚨 **`EXTRA BUS RECOMMENDED`** |
| **75% to < 90%** of capacity | **MEDIUM CROWD** | ℹ️ `MEDIUM CROWD EXPECTED` | ✅ **`EXTRA BUS NOT REQUIRED`** |
| **< 75%** of capacity | **LOW CROWD** | ✅ `LOW CROWD EXPECTED` | ✅ **`EXTRA BUS NOT REQUIRED`** |

---

## 🛡️ Input Validation
The system validates inputs on both frontend (`script.js`) and backend (`app.py`):
- Required fields cannot be empty.
- Bus capacity must be greater than zero.
- Passenger counts and minutes cannot be negative.
- **Current waiting passengers cannot exceed scheduled bus capacity.**

---

## 🚀 How to Run the Website

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Flask Application
```bash
python app.py
```

### 3. Open the Dashboard
Open your web browser and navigate to:
```
http://127.0.0.1:5000/
```

---

## 🧪 Quick Demo Scenarios (One-Click Presets)
- **⚠️ Scenario 1: High Surge (Extra Bus Needed)**
  - Route 20A (Avinashi), 17:30 (Peak), Cap: 50, Current: 45, Hist: 65, Mins: 15
  - *Result:* High Crowd (~99.6% load) $\rightarrow$ **`EXTRA BUS RECOMMENDED`**
- **ℹ️ Scenario 2: Moderate Load (Medium Crowd)**
  - Route 15 (Palladam), 15:00, Cap: 50, Current: 38, Hist: 42, Mins: 15
  - *Result:* Medium Crowd (~79.0% load) $\rightarrow$ **`EXTRA BUS NOT REQUIRED`**
- **✅ Scenario 3: Normal Flow (Capacity Sufficient / Low Crowd)**
  - Route 12B (Kangeyam), 14:15, Cap: 55, Current: 20, Hist: 35, Mins: 10
  - *Result:* Low Crowd (~58.4% load) $\rightarrow$ **`EXTRA BUS NOT REQUIRED`**

---

## 📂 Project Structure
```
AI-Bus-Demand-Prediction/
├── app.py                         # Flask REST API backend & static file server
├── bus_demand_model.pkl           # Pre-trained Random Forest ML model (19 features)
├── bus_demand_dataset_500_rows.csv# Synthetic dataset (500 records)
├── index.html                     # Web dashboard interface & KPI cards
├── style.css                      # Modern transit command-center responsive stylesheet
├── script.js                      # Form validator, API caller, and dashboard updater
├── test_system.py                 # Comprehensive automated test suite
├── requirements.txt               # Deployment dependencies (Flask, joblib, pandas, scikit-learn)
└── README.md                      # Project documentation and presentation guide
```
