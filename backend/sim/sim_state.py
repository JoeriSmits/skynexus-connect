# sim/sim_state.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AircraftData(BaseModel):
    model: str
    lat: float
    lon: float
    rpm: float
    fuel_liters: float
    block_time: float
    fuel_used: float


class SimState(BaseModel):
    connected: bool = False
    aircraft: Optional[AircraftData] = None
    last_rpm_over_100: Optional[datetime] = None


simulator_state = SimState()
