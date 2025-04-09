from .simconnect_mobiflight import SimConnectMobiFlight
from .mobiflight_variable_requests import MobiFlightVariableRequests

def get_mobiflight_interface():
    sm = SimConnectMobiFlight()
    vr = MobiFlightVariableRequests(sm)
    return vr
