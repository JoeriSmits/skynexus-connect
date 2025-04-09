from SimConnect import SimConnect, AircraftRequests

class SimConnectClient:
    def __init__(self):
        self.sm = SimConnect()
        self.aq = AircraftRequests(self.sm, _time=2000)

    def get(self, name, unit=None):
        return self.aq.get(name, unit) if unit else self.aq.get(name)
