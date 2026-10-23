import os
import warnings
import joblib
import pandas as pd
from flask import Flask, jsonify, request, send_from_directory

# Suppress sklearn unpickling version warnings for clean server logs
warnings.filterwarnings("ignore", category=UserWarning)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=".", static_url_path="")

# Load trained model
MODEL_PATH = os.path.join(BASE_DIR, "bus_demand_model.pkl")
model = joblib.load(MODEL_PATH)
FEATURE_NAMES = list(model.feature_names_in_)


@app.route("/")
def home():
    """Serve the main web dashboard."""
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/<path:path>")
def serve_static(path):
    """Serve static assets like CSS and JS from the project root."""
    if os.path.exists(os.path.join(BASE_DIR, path)):
        return send_from_directory(BASE_DIR, path)
    return jsonify({"error": f"File '{path}' not found"}), 404


@app.route("/predict", methods=["POST"])
def predict():
    """Predict passenger demand using the trained Random Forest model.

    Features (19 total):
      - Bus_Capacity, Current_Passengers, Historical_Average, Hour
      - Day: Friday, Monday, Saturday, Sunday, Thursday, Tuesday, Wednesday (7)
      - Route: Tiruppur-Avinashi, Tiruppur-Coimbatore, Tiruppur-Kangeyam,
               Tiruppur-Palladam, Tiruppur-Udumalpet (5)
      - Weather: Cloudy, Normal, Rainy (3)
    """
    data = request.get_json(silent=True)

    if not data or not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Invalid request. JSON body is required."
        }), 400

    # Required field presence check
    required_fields = ["Bus_Capacity", "Current_Passengers", "Hour"]
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == "":
            return jsonify({
                "success": False,
                "error": f"Missing required field: {field}"
            }), 400

    # Type & numeric boundary validation
    try:
        bus_capacity = int(data["Bus_Capacity"])
        current_passengers = int(data["Current_Passengers"])
        historical_average = int(data.get("Historical_Average", 0) or 0)
        hour = int(data["Hour"])
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "error": "Numeric inputs must be valid integers."
        }), 400

    if bus_capacity <= 0:
        return jsonify({
            "success": False,
            "error": "Bus capacity must be greater than zero."
        }), 400

    if current_passengers < 0:
        return jsonify({
            "success": False,
            "error": "Current waiting passengers cannot be negative."
        }), 400

    if historical_average < 0:
        return jsonify({
            "success": False,
            "error": "Historical average passengers cannot be negative."
        }), 400

    if not (0 <= hour <= 23):
        return jsonify({
            "success": False,
            "error": "Arrival hour must be between 0 and 23."
        }), 400

    # Business logic validation: Current waiting passengers cannot exceed bus capacity
    if current_passengers > bus_capacity:
        return jsonify({
            "success": False,
            "error": f"Current waiting passengers ({current_passengers}) cannot exceed scheduled bus capacity ({bus_capacity})."
        }), 400

    route = str(data.get("Route", "Tiruppur-Avinashi"))
    day = str(data.get("Day", "Monday"))
    weather = str(data.get("Weather", "Normal"))

    # Construct the exact 19 features required by the trained model
    input_data = {
        "Bus_Capacity": bus_capacity,
        "Current_Passengers": current_passengers,
        "Historical_Average": historical_average,
        "Hour": hour,

        # Days of the week (7)
        "Day_Friday": 1 if day == "Friday" else 0,
        "Day_Monday": 1 if day == "Monday" else 0,
        "Day_Saturday": 1 if day == "Saturday" else 0,
        "Day_Sunday": 1 if day == "Sunday" else 0,
        "Day_Thursday": 1 if day == "Thursday" else 0,
        "Day_Tuesday": 1 if day == "Tuesday" else 0,
        "Day_Wednesday": 1 if day == "Wednesday" else 0,

        # Routes (5)
        "Route_Tiruppur-Avinashi": 1 if route == "Tiruppur-Avinashi" else 0,
        "Route_Tiruppur-Coimbatore": 1 if route == "Tiruppur-Coimbatore" else 0,
        "Route_Tiruppur-Kangeyam": 1 if route == "Tiruppur-Kangeyam" else 0,
        "Route_Tiruppur-Palladam": 1 if route == "Tiruppur-Palladam" else 0,
        "Route_Tiruppur-Udumalpet": 1 if route == "Tiruppur-Udumalpet" else 0,

        # Weather conditions (3)
        "Weather_Cloudy": 1 if weather == "Cloudy" else 0,
        "Weather_Normal": 1 if weather == "Normal" else 0,
        "Weather_Rainy": 1 if weather == "Rainy" else 0,
    }

    # Ensure columns match the exact feature names and order the model was trained on
    input_df = pd.DataFrame([input_data])[FEATURE_NAMES]

    # Predict using the trained Random Forest model
    raw_prediction = float(model.predict(input_df)[0])
    prediction = max(0.0, raw_prediction)
    predicted_passengers = round(prediction, 2)

    # Crowd classification based on capacity percentage:
    # >= 90% -> HIGH CROWD + EXTRA BUS RECOMMENDED
    # 75% to < 90% -> MEDIUM CROWD + EXTRA BUS NOT REQUIRED
    # < 75% -> LOW CROWD + EXTRA BUS NOT REQUIRED
    ratio = predicted_passengers / bus_capacity if bus_capacity > 0 else 0
    utilization_percentage = round(ratio * 100, 1)
    difference = round(predicted_passengers - bus_capacity, 2)

    if ratio >= 0.90:
        crowd_status = "HIGH CROWD"
        crowd_level = "HIGH"
        crowd_alert = "HIGH CROWD EXPECTED"
        recommendation = "EXTRA BUS RECOMMENDED"
        extra_bus_recommended = True
        alert = "HIGH CROWD EXPECTED - EXTRA BUS RECOMMENDED"
    elif ratio >= 0.75:
        crowd_status = "MEDIUM CROWD"
        crowd_level = "MEDIUM"
        crowd_alert = "MEDIUM CROWD EXPECTED"
        recommendation = "EXTRA BUS NOT REQUIRED"
        extra_bus_recommended = False
        alert = "MEDIUM CROWD EXPECTED"
    else:
        crowd_status = "LOW CROWD"
        crowd_level = "LOW"
        crowd_alert = "LOW CROWD EXPECTED"
        recommendation = "EXTRA BUS NOT REQUIRED"
        extra_bus_recommended = False
        alert = "LOW CROWD EXPECTED"

    return jsonify({
        "success": True,
        "predicted_passengers": predicted_passengers,
        "crowd_status": crowd_status,
        "crowd_level": crowd_level,
        "crowd_alert": crowd_alert,
        "extra_bus_recommended": extra_bus_recommended,
        "recommendation": recommendation,
        "alert": alert,
        "difference": difference,
        "utilization_percentage": utilization_percentage,
        "bus_capacity": bus_capacity,
        "current_passengers": current_passengers
    })


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
