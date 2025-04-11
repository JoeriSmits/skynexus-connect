from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel

class AircraftData(BaseModel):
    lat: float
    lon: float
    rpm: float
    fuel_liters: float
    block_time: float
    block_out: Optional[datetime] = None
    block_in: Optional[datetime] = None
    fuel_used: float

    maintenance_state: Optional[Dict[str, float]] = None
    maintenance_used: Optional[Dict[str, float]] = None  # <- must be defined separately


class SimState(BaseModel):
    connected: bool = False
    aircraft: Optional[AircraftData] = None
    last_completed_aircraft: Optional[AircraftData] = None

    tracking_active: bool = False
    start_time: Optional[datetime] = None
    start_fuel: Optional[float] = None
    block_out: Optional[datetime] = None
    block_in: Optional[datetime] = None
    start_maintenance: Optional[Dict[str, float]] = None  # Track starting wear

simulator_state = SimState()
