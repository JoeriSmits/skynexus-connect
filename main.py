import time
from tracker.simconnect_client import SimConnectClient
from tracker.flight_tracker import FlightTracker

def main():
    print("[SKYNEXUS TRACKER] Connecting to MSFS...")
    sim = SimConnectClient()
    tracker = FlightTracker(sim)

    print("[SKYNEXUS TRACKER] Ready. Waiting for engine start...\n")
    while True:
        try:
            tracker.tick()
            time.sleep(2)
        except Exception as e:
            print("[ERROR]", e)
            time.sleep(5)

if __name__ == "__main__":
    main()
