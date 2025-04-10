
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

from datetime import datetime

def fetch_aircraft_data(vr):
    print("📡 Background updater started.")

    while True:
        try:
            lat = vr.get(tracked_vars["lat"])
            lon = vr.get(tracked_vars["lon"]) 
            rpm = vr.get(tracked_vars["rpm"])
            fuel_gal = vr.get(tracked_vars["fuel"])
            fuel_liters = fuel_gal * 3.78541

            block_time = 0.0
            fuel_used = 0.0

            # Start flight
            if rpm > 100 and not simulator_state.tracking_active:
                now = datetime.utcnow()
                simulator_state.start_time = now
                simulator_state.start_fuel = fuel_liters
                simulator_state.tracking_active = True
                simulator_state.block_out = now
                print(f"🟢 Flight started at {simulator_state.start_time}, fuel: {fuel_liters:.2f} L")

            # End flight
            elif rpm <= 100 and simulator_state.tracking_active:
                now = datetime.utcnow()
                block_time = (now - simulator_state.start_time).total_seconds() / 3600
                fuel_used = simulator_state.start_fuel - fuel_liters

                simulator_state.tracking_active = False
                simulator_state.start_time = None
                simulator_state.start_fuel = None

                aircraft = AircraftData(
                    lat=lat,
                    lon=lon,
                    rpm=rpm,
                    fuel_liters=fuel_liters,
                    fuel_used=round(fuel_used, 2),
                    block_time=round(block_time, 2),
                    block_out=simulator_state.block_out,
                    block_in=now,
                )
                simulator_state.last_completed_aircraft = aircraft
                simulator_state.aircraft = aircraft
                simulator_state.block_out = None  # clear for next flight


            # Always update aircraft
            aircraft = AircraftData(
                lat=lat,
                lon=lon,
                rpm=rpm,
                fuel_liters=fuel_liters,
                block_time=round(block_time, 2),
                fuel_used=round(fuel_used, 2),
            )

            simulator_state.aircraft = aircraft
            simulator_state.connected = True
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
