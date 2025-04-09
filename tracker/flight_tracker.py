import time

class FlightTracker:
    def __init__(self, sim):
        self.sim = sim
        self.flight_started = False
        self.start_time = None
        self.start_fuel = None

    def tick(self):
        rpm1 = self.sim.get("GENERAL_ENG_RPM:1")
        rpm2 = self.sim.get("GENERAL_ENG_RPM:2")

        if not self.flight_started and rpm1 > 100:
            self.flight_started = True
            self.start_time = time.time()
            self.start_fuel = self.sim.get("FUEL_TOTAL_QUANTITY", "liters")
            print(f"[INFO] Flight started | Fuel: {self.start_fuel:.2f} L")

        if self.flight_started and rpm1 < 50 and rpm2 < 50:
            self.flight_started = False
            end_time = time.time()
            end_fuel = self.sim.get("FUEL_TOTAL_QUANTITY", "liters")

            block_time = (end_time - self.start_time) / 60
            fuel_used = self.start_fuel - end_fuel

            print("\n[FLIGHT COMPLETED]")
            print(f"  Block time      : {block_time:.1f} minutes")
            print(f"  Fuel used       : {fuel_used:.2f} liters")

            try:
                damage_L = self.sim.get("L:var_engineDamage_L")
                damage_R = self.sim.get("L:var_engineDamage_R")
                print(f"  Engine damage L : {damage_L}")
                print(f"  Engine damage R : {damage_R}")
            except Exception as e:
                print("  [WARN] L:vars not accessible:", e)

            self.reset()

    def reset(self):
        self.start_time = None
        self.start_fuel = None
        print("\n[TRACKER] Ready for next flight...\n")
