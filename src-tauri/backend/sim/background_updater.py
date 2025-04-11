from threading import Thread
from time import sleep
from datetime import datetime
from .sim_state import AircraftData, simulator_state
from sim.connection import wait_for_vr

# Tracked SimVars
tracked_vars = {
    "lat": "(A:PLANE LATITUDE, Degrees)",
    "lon": "(A:PLANE LONGITUDE, Degrees)",
    "rpm": "(A:GENERAL ENG RPM:1, rpm)",
    "fuel": "(A:FUEL TOTAL QUANTITY,Gallons)",
    "wear_L": "(L:var_engineDamage_L)",
    "wear_R": "(L:var_engineDamage_R)",
    "camera": "(A:CAMERA STATE, Enum)"  # Used to detect MSFS menu
}

def fetch_aircraft_data(vr):
    print("📡 Background updater started.")
    while True:
        try:
            camera_state = vr.get(tracked_vars["camera"])
            in_menu = camera_state > 6

            if in_menu:
                if simulator_state.tracking_active:
                    print("🟡 User entered menu during flight — ending tracking session.")

                    now = datetime.utcnow()
                    fuel_liters = vr.get(tracked_vars["fuel"]) * 3.78541
                    block_time = (now - simulator_state.start_time).total_seconds() / 3600
                    fuel_used = simulator_state.start_fuel - fuel_liters

                    maintenance = {
                        "L:var_engineDamage_L": vr.get(tracked_vars["wear_L"]),
                        "L:var_engineDamage_R": vr.get(tracked_vars["wear_R"]),
                    }
                    maintenance_used = {
                        key: round(maintenance[key] - simulator_state.start_maintenance.get(key, 0.0), 2)
                        for key in maintenance
                    }

                    aircraft = AircraftData(
                        lat=vr.get(tracked_vars["lat"]),
                        lon=vr.get(tracked_vars["lon"]),
                        rpm=vr.get(tracked_vars["rpm"]),
                        fuel_liters=fuel_liters,
                        fuel_used=round(fuel_used, 2),
                        block_time=round(block_time, 2),
                        block_out=simulator_state.block_out,
                        block_in=now,
                        maintenance_state=maintenance,
                        maintenance_used=maintenance_used
                    )

                    simulator_state.last_completed_aircraft = aircraft
                    simulator_state.aircraft = aircraft
                    simulator_state.block_out = None
                    simulator_state.tracking_active = False
                    simulator_state.start_time = None
                    simulator_state.start_fuel = None
                    simulator_state.start_maintenance = None

                simulator_state.connected = False
                simulator_state.aircraft = None
                sleep(1)
                continue

            # Normal update loop
            lat = vr.get(tracked_vars["lat"])
            lon = vr.get(tracked_vars["lon"])
            rpm = vr.get(tracked_vars["rpm"])
            fuel_gal = vr.get(tracked_vars["fuel"])
            fuel_liters = fuel_gal * 3.78541
            wear_L = vr.get(tracked_vars["wear_L"])
            wear_R = vr.get(tracked_vars["wear_R"])

            maintenance = {
                "L:var_engineDamage_L": wear_L,
                "L:var_engineDamage_R": wear_R,
            }

            block_time = 0.0
            fuel_used = 0.0
            maintenance_used = None

            if rpm > 100 and not simulator_state.tracking_active:
                now = datetime.utcnow()
                simulator_state.start_time = now
                simulator_state.start_fuel = fuel_liters
                simulator_state.tracking_active = True
                simulator_state.block_out = now
                simulator_state.start_maintenance = maintenance.copy()
                print(f"🟢 Flight started at {now}, fuel: {fuel_liters:.2f} L")

            elif rpm <= 100 and simulator_state.tracking_active:
                now = datetime.utcnow()
                block_time = (now - simulator_state.start_time).total_seconds() / 3600
                fuel_used = simulator_state.start_fuel - fuel_liters

                maintenance_used = {
                    key: round(maintenance[key] - simulator_state.start_maintenance.get(key, 0.0), 2)
                    for key in maintenance
                }

                simulator_state.tracking_active = False
                simulator_state.start_time = None
                simulator_state.start_fuel = None
                simulator_state.start_maintenance = None

                aircraft = AircraftData(
                    lat=lat,
                    lon=lon,
                    rpm=rpm,
                    fuel_liters=fuel_liters,
                    fuel_used=round(fuel_used, 2),
                    block_time=round(block_time, 2),
                    block_out=simulator_state.block_out,
                    block_in=now,
                    maintenance_state=maintenance,
                    maintenance_used=maintenance_used
                )
                simulator_state.last_completed_aircraft = aircraft
                simulator_state.aircraft = aircraft
                simulator_state.block_out = None

            aircraft = AircraftData(
                lat=lat,
                lon=lon,
                rpm=rpm,
                fuel_liters=fuel_liters,
                block_time=round(block_time, 2),
                fuel_used=round(fuel_used, 2),
                maintenance_state=maintenance
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
        vr = wait_for_vr(timeout=3600)
        if vr:
            fetch_aircraft_data(vr)
        else:
            print("❌ Timeout waiting for SimConnect connection")

    thread = Thread(target=wait_and_run, daemon=True)
    thread.start()
