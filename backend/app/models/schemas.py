from pydantic import BaseModel
from typing import List, Optional


class SessionInfo(BaseModel):
    round: int
    name: str
    country: str
    location: str


class DriverInfo(BaseModel):
    driver_number: str
    full_name: str
    team: str
    team_color: str


class TelemetryData(BaseModel):
    time: List[float]
    distance: List[float]
    x: List[float]
    y: List[float]
    speed: List[float]
    throttle: List[float]
    brake: List[float]
    gear: List[int]


class CornerInfo(BaseModel):
    number: int
    x: float
    y: float


class TrackInfo(BaseModel):
    name: str
    corners: List[CornerInfo]


class DriverRaceData(BaseModel):
    name: str
    driver_number: str
    team: str
    team_color: str
    fastest_lap: str
    telemetry: TelemetryData


class RaceDataResponse(BaseModel):
    driver1: DriverRaceData
    driver2: DriverRaceData
    track: TrackInfo

