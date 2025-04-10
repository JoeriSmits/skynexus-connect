from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class AircraftData(BaseModel):
    lat: float
    lon: float
    rpm: float
    fuel_liters: float
    block_time: float
    fuel_used: float

class SimState(BaseModel):
    connected: bool = False
    aircraft: Optional[AircraftData] = None
    last_completed_aircraft: Optional[AircraftData] = None

    # Add these:
    tracking_active: bool = False
    start_time: Optional[datetime] = None
    start_fuel: Optional[float] = None

simulator_state = SimState()
