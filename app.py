from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Load trained ML model
model = joblib.load("bus_demand_model.pkl")


@app.route("/")
def home():
    return "Bus Demand Prediction ML Model is running!"


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    input_data = pd.DataFrame([data])

    prediction = model.predict(input_data)[0]

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
