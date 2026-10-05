from flask import Flask
import joblib

app = Flask(__name__)

# Load trained ML model
model = joblib.load("bus_demand_model.pkl")

@app.route("/")
def home():
    return "Bus Demand Prediction ML Model is running!"

if __name__ == "__main__":
    app.run()
