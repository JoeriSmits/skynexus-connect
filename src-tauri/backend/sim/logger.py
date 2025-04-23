# sim/logger.py
import time, json, math, os
from datetime import datetime
from SimConnect import SimConnect, AircraftRequests

LOG_INTERVAL_SECONDS = 1

SIMVARS = [
    # Flight Dynamics & Position
    "PLANE_LATITUDE", "PLANE_LONGITUDE", "PLANE_ALTITUDE",
    "AIRSPEED_INDICATED", "AIRSPEED_TRUE", "VERTICAL_SPEED",
    "PLANE_HEADING_DEGREES_TRUE", "PLANE_PITCH_DEGREES", "PLANE_BANK_DEGREES",
    "G_FORCE", "ACCELERATION_BODY_X", "ACCELERATION_BODY_Y", "ACCELERATION_BODY_Z",
    "ROTATION_VELOCITY_BODY_X", "ROTATION_VELOCITY_BODY_Y", "ROTATION_VELOCITY_BODY_Z",
    "VELOCITY_WORLD_X", "VELOCITY_WORLD_Y", "VELOCITY_WORLD_Z",

    # Systems & Status
    "FLAPS_HANDLE_INDEX", "GEAR_HANDLE_POSITION", "GENERAL_ENG_THROTTLE_LEVER_POSITION:1", "STALL_WARNING",
    "OVERSPEED_WARNING", "BRAKE_PARKING_INDICATOR", "SIM_ON_GROUND",

    # Touchdown proxy
    "GROUND_VELOCITY",

    # Environment
    "AMBIENT_TEMPERATURE", "AMBIENT_WIND_VELOCITY", "AMBIENT_WIND_DIRECTION",
    "AMBIENT_WIND_X", "AMBIENT_WIND_Y", "AMBIENT_WIND_Z", "AMBIENT_PRESSURE",

    # Controls
    "YOKE_X_POSITION", "YOKE_Y_POSITION", "RUDDER_POSITION",
    "ELEVATOR_POSITION", "AILERON_POSITION", "ELEVATOR_TRIM_POSITION",

    # Engine
    "PROP_RPM:1", "PROP_RPM:2"
]

def wait_until_data_valid(aq, var):
    for _ in range(40):
        value = aq.get(var)
        if value is not None:
            return True
        time.sleep(0.5)
    return False

def start_logging():
    global logging_active, in_memory_log
    logging_active = False  # stop any previous session
    time.sleep(0.1)         # short wait to break any loops
    in_memory_log = []      # reset log here ✅

    sm = SimConnect()
    aq = AircraftRequests(sm, _time=100)

    valid_vars = [v for v in SIMVARS if wait_until_data_valid(aq, v)]
    if not valid_vars:
        print("🚫 No valid simvars.")
        return

    logging_active = True
    while logging_active:
        snapshot = {"timestamp": datetime.utcnow().isoformat() + "Z"}
        for var in valid_vars:
            try:
                val = aq.get(var)
                if var == "PLANE_HEADING_DEGREES_TRUE" and val is not None:
                    val = math.degrees(val)
                snapshot[var] = val
            except:
                snapshot[var] = None
        in_memory_log.append(snapshot)
        time.sleep(LOG_INTERVAL_SECONDS)

def stop_logging():
    global logging_active
    logging_active = False

def get_logged_data():
    return in_memory_log