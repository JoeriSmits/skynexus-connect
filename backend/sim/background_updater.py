from threading import Thread
from time import sleep
from datetime import datetime

from .sim_state import AircraftData, simulator_state
from sim.connection import wait_for_vr

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
            lat = vr.get(tracked_vars["lat"])
            lon = vr.get(tracked_vars["lon"])
            rpm = vr.get(tracked_vars["rpm"])
            fuel_gal = vr.get(tracked_vars["fuel"])
            fuel_liters = fuel_gal * 3.78541

            block_time = 0.0
            fuel_used = 0.0

            if rpm > 100 and not simulator_state.tracking_active:
                now = datetime.utcnow()
                simulator_state.start_time = now
                simulator_state.start_fuel = fuel_liters
                simulator_state.tracking_active = True
                simulator_state.block_out = now
                print(f"🟢 Flight started at {now}, fuel: {fuel_liters:.2f} L")

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
                simulator_state.block_out = None

            # Always update current aircraft state
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
    def wait_and_run():
        vr = wait_for_vr(timeout=3600)  # Wait up to an hour
        if vr:
            fetch_aircraft_data(vr)
        else:
            print("❌ Timeout waiting for SimConnect connection")

    thread = Thread(target=wait_and_run, daemon=True)
    thread.start()
