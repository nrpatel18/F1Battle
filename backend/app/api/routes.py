from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.services.f1_service import F1Service
from app.models.schemas import SessionInfo, DriverInfo, RaceDataResponse
import os

router = APIRouter()
f1_service = F1Service(cache_dir=os.getenv("F1_CACHE_DIR", "./f1_cache"))


@router.get("/sessions", response_model=List[SessionInfo])
async def get_sessions(year: int = Query(..., ge=2020, le=2024)):
    """Get all Grand Prix sessions for a given year."""
    sessions = f1_service.get_sessions(year)
    if not sessions:
        raise HTTPException(status_code=404, detail=f"No sessions found for year {year}")
    return sessions


@router.get("/drivers", response_model=List[DriverInfo])
async def get_drivers(
    year: int = Query(..., ge=2020, le=2024),
    round: int = Query(..., ge=1, le=25),
    session: str = Query(..., regex="^(FP1|FP2|FP3|Q|R|Sprint|Sprint Qualifying|Sprint Shootout)$")
):
    """Get all drivers for a specific session."""
    drivers = f1_service.get_drivers(year, round, session)
    if not drivers:
        raise HTTPException(
            status_code=404, 
            detail=f"No drivers found for {year} Round {round} {session}"
        )
    return drivers


@router.get("/race-data", response_model=RaceDataResponse)
async def get_race_data(
    year: int = Query(..., ge=2020, le=2024),
    round: int = Query(..., ge=1, le=25),
    session: str = Query(..., regex="^(FP1|FP2|FP3|Q|R|Sprint|Sprint Qualifying|Sprint Shootout)$"),
    driver1: str = Query(...),
    driver2: str = Query(...)
):
    """Get complete race visualization data for two drivers."""
    try:
        race_data = f1_service.get_race_data(year, round, session, driver1, driver2)
        if not race_data:
            raise HTTPException(
                status_code=404,
                detail="Could not fetch race data. Ensure both drivers have valid lap data."
            )
        return race_data
    except Exception as e:
        error_detail = str(e)
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching race data: {error_detail}"
        )

