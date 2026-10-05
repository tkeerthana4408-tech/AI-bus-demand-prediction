from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Load trained model
model = joblib.load("bus_demand_model.pkl")


@app.route("/")
def home():
    return "Bus Demand Prediction ML Model is running!"


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    # Create all 19 features used during training
    input_data = {
        "Bus_Capacity": data["Bus_Capacity"],
        "Current_Passengers": data["Current_Passengers"],
        "Historical_Average": data["Historical_Average"],
        "Hour": data["Hour"],

        "Day_Friday": 1 if data["Day"] == "Friday" else 0,
        "Day_Monday": 1 if data["Day"] == "Monday" else 0,
        "Day_Saturday": 1 if data["Day"] == "Saturday" else 0,
        "Day_Sunday": 1 if data["Day"] == "Sunday" else 0,
        "Day_Thursday": 1 if data["Day"] == "Thursday" else 0,
        "Day_Tuesday": 1 if data["Day"] == "Tuesday" else 0,
        "Day_Wednesday": 1 if data["Day"] == "Wednesday" else 0,

        "Route_Tiruppur-Avinashi": 1 if data["Route"] == "Tiruppur-Avinashi" else 0,
        "Route_Tiruppur-Coimbatore": 1 if data["Route"] == "Tiruppur-Coimbatore" else 0,
        "Route_Tiruppur-Kangeyam": 1 if data["Route"] == "Tiruppur-Kangeyam" else 0,
        "Route_Tiruppur-Palladam": 1 if data["Route"] == "Tiruppur-Palladam" else 0,
        "Route_Tiruppur-Udumalpet": 1 if data["Route"] == "Tiruppur-Udumalpet" else 0,

        "Weather_Cloudy": 1 if data["Weather"] == "Cloudy" else 0,
        "Weather_Normal": 1 if data["Weather"] == "Normal" else 0,
        "Weather_Rainy": 1 if data["Weather"] == "Rainy" else 0
    }

    input_df = pd.DataFrame([input_data])

    prediction = model.predict(input_df)[0]

    capacity = data["Bus_Capacity"]

    if prediction >= capacity * 0.90:
        alert = "HIGH CROWD EXPECTED - EXTRA BUS RECOMMENDED"
    elif prediction >= capacity * 0.75:
        alert = "MEDIUM CROWD EXPECTED"
    else:
        alert = "LOW CROWD EXPECTED"

    return jsonify({
        "predicted_passengers": round(float(prediction), 2),
        "alert": alert
    })


if __name__ == "__main__":
    app.run(debug=True)
