import time
import threading
from sim.simconnect_mobiflight import SimConnectMobiFlight
from sim.mobiflight_variable_requests import MobiFlightVariableRequests

vr = None
sm = None

def get_vr():
    return vr

def connection_loop():
    global vr, sm
    while True:
        try:
            print("🔄 Attempting to connect to MSFS...")
            sm = SimConnectMobiFlight()
            vr = MobiFlightVariableRequests(sm)
            vr.clear_sim_variables()
            print("✅ Connected to MSFS via SimConnect.")
            break
        except Exception as e:
            vr = None
            sm = None
            print(f"❌ SimConnect connection failed: {e}")
            time.sleep(5)  # retry in 5 seconds

def start_connection_monitor():
    thread = threading.Thread(target=connection_loop, daemon=True)
    thread.start()

def wait_for_vr(timeout=30):
    """Blocks until vr is connected or timeout is reached."""
    start = time.time()
    while vr is None and (time.time() - start) < timeout:
        time.sleep(0.5)
    return vr
