
from threading import Thread
from .simconnect_mobiflight import SimConnectMobiFlight
from .mobiflight_variable_requests import MobiFlightVariableRequests
from .sim_state import AircraftData, simulator_state
from time import sleep
from datetime import datetime

# Corrected unit labels — SimConnect returns values in degrees already
tracked_vars = {
    "lat": "(A:PLANE LATITUDE, Degrees)",
    "lon": "(A:PLANE LONGITUDE, Degrees)",
    "rpm": "(A:GENERAL ENG RPM:1, rpm)",
    "fuel": "(A:FUEL TOTAL QUANTITY,Gallons)"
}

def fetch_aircraft_data(vr):
    print("📡 Background updater started.")

    while True:
        try:
            lat = vr.get(tracked_vars["lat"])  # already in degrees
            lon = vr.get(tracked_vars["lon"])  # already in degrees
            rpm = vr.get(tracked_vars["rpm"])
            fuel = vr.get(tracked_vars["fuel"])

            print(f"🌍 lat: {lat}, lon: {lon} | ⛽ fuel: {fuel} | RPM: {rpm}")

            aircraft = AircraftData(
                model="Beechcraft Duke B60",
                lat=lat,
                lon=lon,
                rpm=rpm,
                fuel_liters=fuel,
                block_time=0.0,
                fuel_used=0.0,
            )

            simulator_state.connected = True
            simulator_state.aircraft = aircraft

            if rpm > 100:
                simulator_state.last_rpm_over_100 = datetime.utcnow()

        except Exception as e:
            simulator_state.connected = False
            simulator_state.aircraft = None
            print(f"[SIM ERROR] {e}")

        sleep(1)

def start_background_updater():
    sm = SimConnectMobiFlight()
    vr = MobiFlightVariableRequests(sm)
    vr.clear_sim_variables()

    thread = Thread(target=fetch_aircraft_data, args=(vr,), daemon=True)
    thread.start()
