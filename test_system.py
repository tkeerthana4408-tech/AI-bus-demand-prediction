"""
Comprehensive Automated Test Suite for AI-Based Bus Passenger Demand Prediction
"""
import unittest
import json
from app import app

class BusDemandPredictionTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = self.app.test_client()

    def test_static_routes(self):
        """Verify dashboard, CSS, and JS serve properly with HTTP 200."""
        r_home = self.client.get('/')
        self.assertEqual(r_home.status_code, 200)
        self.assertIn(b"AI-Based Bus Passenger Demand Prediction", r_home.data)

        r_css = self.client.get('/style.css')
        self.assertEqual(r_css.status_code, 200)
        self.assertIn(b"--danger-bg", r_css.data)
        self.assertIn(b"--warning-bg", r_css.data)

        r_js = self.client.get('/script.js')
        self.assertEqual(r_js.status_code, 200)
        self.assertIn(b"predictPassengerDemand", r_js.data)

    def test_high_crowd_and_extra_bus(self):
        """Test high crowd (>= 90% capacity) triggers Extra Bus Recommendation."""
        payload = {
            "Bus_Capacity": 50,
            "Current_Passengers": 45,
            "Historical_Average": 65,
            "Hour": 17,
            "Route": "Tiruppur-Avinashi",
            "Day": "Friday",
            "Weather": "Normal"
        }
        res = self.client.post('/predict', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["crowd_level"], "HIGH")
        self.assertEqual(data["crowd_status"], "HIGH CROWD")
        self.assertEqual(data["crowd_alert"], "HIGH CROWD EXPECTED")
        self.assertTrue(data["extra_bus_recommended"])
        self.assertEqual(data["recommendation"], "EXTRA BUS RECOMMENDED")
        self.assertGreaterEqual(data["utilization_percentage"], 90.0)

    def test_medium_crowd(self):
        """Test medium crowd (75% to < 90% capacity) does NOT trigger Extra Bus."""
        payload = {
            "Bus_Capacity": 50,
            "Current_Passengers": 38,
            "Historical_Average": 42,
            "Hour": 15,
            "Route": "Tiruppur-Palladam",
            "Day": "Wednesday",
            "Weather": "Cloudy"
        }
        res = self.client.post('/predict', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["crowd_level"], "MEDIUM")
        self.assertEqual(data["crowd_status"], "MEDIUM CROWD")
        self.assertEqual(data["crowd_alert"], "MEDIUM CROWD EXPECTED")
        self.assertFalse(data["extra_bus_recommended"])
        self.assertEqual(data["recommendation"], "EXTRA BUS NOT REQUIRED")
        self.assertGreaterEqual(data["utilization_percentage"], 75.0)
        self.assertLess(data["utilization_percentage"], 90.0)

    def test_low_crowd(self):
        """Test low crowd (< 75% capacity)."""
        payload = {
            "Bus_Capacity": 55,
            "Current_Passengers": 20,
            "Historical_Average": 35,
            "Hour": 14,
            "Route": "Tiruppur-Kangeyam",
            "Day": "Monday",
            "Weather": "Normal"
        }
        res = self.client.post('/predict', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["crowd_level"], "LOW")
        self.assertEqual(data["crowd_status"], "LOW CROWD")
        self.assertEqual(data["crowd_alert"], "LOW CROWD EXPECTED")
        self.assertFalse(data["extra_bus_recommended"])
        self.assertEqual(data["recommendation"], "EXTRA BUS NOT REQUIRED")
        self.assertLess(data["utilization_percentage"], 75.0)

    def test_validation_current_exceeds_capacity(self):
        """Validation: Current passengers greater than bus capacity should return 400."""
        payload = {
            "Bus_Capacity": 50,
            "Current_Passengers": 55,
            "Historical_Average": 60,
            "Hour": 16
        }
        res = self.client.post('/predict', json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data["success"])
        self.assertIn("cannot exceed", data["error"])

    def test_validation_negative_passengers(self):
        """Validation: Negative passengers should return 400."""
        payload = {
            "Bus_Capacity": 50,
            "Current_Passengers": -5,
            "Historical_Average": 60,
            "Hour": 16
        }
        res = self.client.post('/predict', json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data["success"])
        self.assertIn("negative", data["error"])

    def test_validation_zero_or_negative_capacity(self):
        """Validation: Bus capacity <= 0 should return 400."""
        payload = {
            "Bus_Capacity": 0,
            "Current_Passengers": 0,
            "Historical_Average": 20,
            "Hour": 10
        }
        res = self.client.post('/predict', json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data["success"])
        self.assertIn("greater than zero", data["error"])

    def test_validation_missing_fields(self):
        """Validation: Missing required fields should return 400."""
        payload = {
            "Bus_Capacity": 50
        }
        res = self.client.post('/predict', json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data["success"])
        self.assertIn("Missing required field", data["error"])

    def test_all_routes_and_times(self):
        """Verify model inference on all supported routes and varied times of day."""
        routes = [
            "Tiruppur-Avinashi",
            "Tiruppur-Coimbatore",
            "Tiruppur-Kangeyam",
            "Tiruppur-Palladam",
            "Tiruppur-Udumalpet"
        ]
        times = [8, 12, 16, 20]
        for route in routes:
            for hour in times:
                res = self.client.post('/predict', json={
                    "Bus_Capacity": 50,
                    "Current_Passengers": 30,
                    "Historical_Average": 40,
                    "Hour": hour,
                    "Route": route,
                    "Day": "Tuesday",
                    "Weather": "Normal"
                })
                self.assertEqual(res.status_code, 200, f"Failed for route {route} at hour {hour}")
                data = res.get_json()
                self.assertIn(data["crowd_level"], ["HIGH", "MEDIUM", "LOW"])

if __name__ == "__main__":
    unittest.main()
