# AI-Based Bus Passenger Demand Prediction & Extra Bus Alert System

Passengers at Tirupur Bus Stand wait for scheduled buses while the crowd increases as the arrival time approaches. Current crowd information alone cannot tell how many passengers will arrive before the bus reaches the stand, often resulting in severe overcrowding.

## 🎯 Objective

Estimate future passenger demand before a scheduled bus arrives and provide an early alert when predicted demand may exceed bus capacity, recommending an extra bus deployment in advance.

---

## 📋 Current Project Progress

The project has progressed from the initial rule-based prototype to a **functional Machine Learning-based prototype**.

### Completed Work

- **Problem Identification:** Formulated the challenge of passenger buildup and unpredictable boarding congestion at Tirupur Bus Stand.
- **Solution Design:** Designed a predictive demand assessment framework and alert workflow to support proactive bus dispatch decisions.
- **Web Dashboard:** Developed a responsive single-page dashboard for project demonstration.
- **Passenger Input Module:** Interactive input fields for route, arrival time, bus capacity, current passengers, and historical demand.
- **Synthetic Dataset Creation:** Created a dataset containing **500 simulated passenger-demand records**.
- **Data Preprocessing:** Performed feature extraction, categorical encoding, and preparation of data for machine learning.
- **Machine Learning Model:** Developed a **Random Forest Regression** model for passenger-demand prediction.
- **Model Evaluation:** Evaluated the model using MAE, RMSE, and R² score.
- **Prediction System:** Implemented passenger-demand prediction using the trained model.
- **Crowd Status Evaluation:** Classified predicted demand based on available bus capacity.
- **Extra Bus Recommendation:** Generates an extra-bus recommendation when predicted demand reaches the high-crowd threshold.
- **Flask Backend:** Developed a Python Flask backend to load the trained model and provide prediction responses.
- **Trained Model:** Saved the trained model as `bus_demand_model.pkl`.
- **GitHub Repository:** Source code, dataset, trained model, dashboard, and documentation are maintained in GitHub.

---

## 🤖 Machine Learning Method

The current system uses a **Random Forest Regression** model to predict the expected number of passengers.

### Input Features

The model uses the following information:

- Bus Capacity
- Current Passengers
- Historical Average
- Hour
- Day
- Route
- Weather

The target variable is:
from sklearn.ensemble import RandomForestRegressor

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

```text
Actual_Passengers
