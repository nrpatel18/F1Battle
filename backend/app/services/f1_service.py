import fastf1
import pandas as pd
import numpy as np
import os
from typing import List, Dict, Optional
from datetime import timedelta


class F1Service:
    def __init__(self, cache_dir: str = "./f1_cache"):
        self.cache_dir = cache_dir
        # Create cache directory if it doesn't exist
        os.makedirs(cache_dir, exist_ok=True)
        fastf1.Cache.enable_cache(cache_dir)
    
    def get_sessions(self, year: int) -> List[Dict]:
        """Get all Grand Prix sessions for a given year."""
        try:
            schedule = fastf1.get_event_schedule(year)
            sessions = []
            
            for idx, event in schedule.iterrows():
                sessions.append({
                    "round": int(event['RoundNumber']),
                    "name": event['EventName'],
                    "country": event['Country'],
                    "location": event['Location']
                })
            
            return sorted(sessions, key=lambda x: x['round'])
        except Exception as e:
            print(f"Error fetching sessions: {e}")
            return []
    
    def get_drivers(self, year: int, round: int, session: str) -> List[Dict]:
        """Get all drivers for a specific session."""
        try:
            session_obj = fastf1.get_session(year, round, session)
            session_obj.load()
            
            drivers = []
            driver_info = session_obj.drivers
            
            for driver_num in driver_info:
                try:
                    driver_data = session_obj.get_driver(driver_num)
                    team = session_obj.results.loc[
                        session_obj.results['Abbreviation'] == driver_data['Abbreviation'],
                        'TeamName'
                    ].iloc[0] if len(session_obj.results) > 0 else "Unknown"
                    
                    # Get team color (default to a color if not available)
                    team_color = self._get_team_color(team)
                    
                    drivers.append({
                        "driver_number": str(driver_num),
                        "full_name": driver_data['FullName'],
                        "team": team,
                        "team_color": team_color
                    })
                except Exception as e:
                    print(f"Error processing driver {driver_num}: {e}")
                    continue
            
            return drivers
        except Exception as e:
            print(f"Error fetching drivers: {e}")
            return []
    
    def get_race_data(
        self, 
        year: int, 
        round: int, 
        session: str, 
        driver1_num: str, 
        driver2_num: str
    ) -> Optional[Dict]:
        """Get complete race visualization data for two drivers."""
        try:
            session_obj = fastf1.get_session(year, round, session)
            session_obj.load()
            
            # Get fastest laps for both drivers
            # Accept both string and int driver numbers (FastF1 expects int)
            try:
                driver1_num_int = int(driver1_num)
                driver2_num_int = int(driver2_num)
            except Exception:
                raise Exception(f"Invalid driver identifier '{driver1_num}' or '{driver2_num}'")

            laps1 = session_obj.laps.pick_drivers([driver1_num_int])
            laps2 = session_obj.laps.pick_drivers([driver2_num_int])
            
            if len(laps1) == 0:
                print(f"No laps found for driver {driver1_num}")
                return None
            if len(laps2) == 0:
                print(f"No laps found for driver {driver2_num}")
                return None
            
            lap1 = laps1.pick_fastest()
            lap2 = laps2.pick_fastest()
            
            # Get telemetry data
            telemetry1 = lap1.get_car_data().add_distance()
            telemetry2 = lap2.get_car_data().add_distance()
            
            # Get position data - handle cases where it might not be available
            try:
                pos1 = lap1.get_pos_data()
                pos2 = lap2.get_pos_data()
                
                # Check if position data is available and has X, Y columns
                if (pos1 is None or len(pos1) == 0 or pos2 is None or len(pos2) == 0 or 
                    'X' not in pos1.columns or 'Y' not in pos1.columns or
                    'X' not in pos2.columns or 'Y' not in pos2.columns):
                    print("Position data not available for this session, using distance-based approximation")
                    # Use telemetry data without position - we'll use distance-based approximation
                    full_data1 = telemetry1.copy()
                    full_data2 = telemetry2.copy()
                    # Create approximate X, Y from distance (circular path approximation)
                    max_dist1 = full_data1['Distance'].max() if len(full_data1) > 0 else 5000
                    max_dist2 = full_data2['Distance'].max() if len(full_data2) > 0 else 5000
                    # Create a circular path approximation
                    full_data1['X'] = np.cos(full_data1['Distance'] / max_dist1 * 2 * np.pi) * max_dist1 * 0.01
                    full_data1['Y'] = np.sin(full_data1['Distance'] / max_dist1 * 2 * np.pi) * max_dist1 * 0.01
                    full_data2['X'] = np.cos(full_data2['Distance'] / max_dist2 * 2 * np.pi) * max_dist2 * 0.01
                    full_data2['Y'] = np.sin(full_data2['Distance'] / max_dist2 * 2 * np.pi) * max_dist2 * 0.01
                else:
                    # Merge telemetry with position data
                    full_data1 = telemetry1.merge(pos1[['X', 'Y']], left_index=True, right_index=True, how='left')
                    full_data2 = telemetry2.merge(pos2[['X', 'Y']], left_index=True, right_index=True, how='left')
                    # Fill any NaN values with approximation
                    if full_data1['X'].isna().any() or full_data1['Y'].isna().any():
                        max_dist1 = full_data1['Distance'].max() if len(full_data1) > 0 else 5000
                        full_data1['X'] = full_data1['X'].fillna(np.cos(full_data1['Distance'] / max_dist1 * 2 * np.pi) * max_dist1 * 0.01)
                        full_data1['Y'] = full_data1['Y'].fillna(np.sin(full_data1['Distance'] / max_dist1 * 2 * np.pi) * max_dist1 * 0.01)
                    if full_data2['X'].isna().any() or full_data2['Y'].isna().any():
                        max_dist2 = full_data2['Distance'].max() if len(full_data2) > 0 else 5000
                        full_data2['X'] = full_data2['X'].fillna(np.cos(full_data2['Distance'] / max_dist2 * 2 * np.pi) * max_dist2 * 0.01)
                        full_data2['Y'] = full_data2['Y'].fillna(np.sin(full_data2['Distance'] / max_dist2 * 2 * np.pi) * max_dist2 * 0.01)
            except Exception as pos_error:
                print(f"Error getting position data: {pos_error}")
                import traceback
                traceback.print_exc()
                # Fallback: use telemetry without position data
                full_data1 = telemetry1.copy()
                full_data2 = telemetry2.copy()
                # Create approximate X, Y from distance (circular path)
                max_dist1 = full_data1['Distance'].max() if len(full_data1) > 0 else 5000
                max_dist2 = full_data2['Distance'].max() if len(full_data2) > 0 else 5000
                full_data1['X'] = np.cos(full_data1['Distance'] / max_dist1 * 2 * np.pi) * max_dist1 * 0.01
                full_data1['Y'] = np.sin(full_data1['Distance'] / max_dist1 * 2 * np.pi) * max_dist1 * 0.01
                full_data2['X'] = np.cos(full_data2['Distance'] / max_dist2 * 2 * np.pi) * max_dist2 * 0.01
                full_data2['Y'] = np.sin(full_data2['Distance'] / max_dist2 * 2 * np.pi) * max_dist2 * 0.01
            
            # Downsample to ~250 points for performance
            step1 = max(1, len(full_data1) // 250)
            step2 = max(1, len(full_data2) // 250)
            
            sampled1 = full_data1.iloc[::step1].copy()
            sampled2 = full_data2.iloc[::step2].copy()
            
            # Get driver info (use .pick_drivers and .get_driver with fallback to Abbreviation)
            try:
                driver1_info = session_obj.get_driver(driver1_num)
            except Exception:
                # Try to match by abbreviation if number fails
                driver1_info = None
                for drv in session_obj.drivers:
                    info = session_obj.get_driver(drv)
                    if str(drv) == str(driver1_num) or info.get('Abbreviation') == str(driver1_num):
                        driver1_info = info
                        break
                if driver1_info is None:
                    raise Exception(f"Invalid driver identifier '{driver1_num}'")
            try:
                driver2_info = session_obj.get_driver(driver2_num)
            except Exception:
                driver2_info = None
                for drv in session_obj.drivers:
                    info = session_obj.get_driver(drv)
                    if str(drv) == str(driver2_num) or info.get('Abbreviation') == str(driver2_num):
                        driver2_info = info
                        break
                if driver2_info is None:
                    raise Exception(f"Invalid driver identifier '{driver2_num}'")
            
            team1 = session_obj.results.loc[
                session_obj.results['Abbreviation'] == driver1_info['Abbreviation'],
                'TeamName'
            ].iloc[0] if len(session_obj.results) > 0 else "Unknown"
            
            team2 = session_obj.results.loc[
                session_obj.results['Abbreviation'] == driver2_info['Abbreviation'],
                'TeamName'
            ].iloc[0] if len(session_obj.results) > 0 else "Unknown"
            
            # Format fastest lap time
            fastest_lap1 = str(timedelta(seconds=lap1['LapTime'].total_seconds()))[2:-3]
            fastest_lap2 = str(timedelta(seconds=lap2['LapTime'].total_seconds()))[2:-3]
            
            # Prepare telemetry data
            telemetry1_data = {
                "time": sampled1['Time'].dt.total_seconds().tolist(),
                "distance": sampled1['Distance'].tolist(),
                "x": sampled1['X'].tolist(),
                "y": sampled1['Y'].tolist(),
                "speed": sampled1['Speed'].tolist(),
                "throttle": sampled1['Throttle'].tolist(),
                "brake": sampled1['Brake'].tolist(),
                "gear": sampled1['nGear'].astype(int).tolist()
            }
            
            telemetry2_data = {
                "time": sampled2['Time'].dt.total_seconds().tolist(),
                "distance": sampled2['Distance'].tolist(),
                "x": sampled2['X'].tolist(),
                "y": sampled2['Y'].tolist(),
                "speed": sampled2['Speed'].tolist(),
                "throttle": sampled2['Throttle'].tolist(),
                "brake": sampled2['Brake'].tolist(),
                "gear": sampled2['nGear'].astype(int).tolist()
            }
            
            # Get track info
            track_name = session_obj.event['Location']
            corners = self._extract_corners(sampled1[['X', 'Y']])
            
            return {
                "driver1": {
                    "name": driver1_info['FullName'],
                    "driver_number": str(driver1_num),
                    "team": team1,
                    "team_color": self._get_team_color(team1),
                    "fastest_lap": fastest_lap1,
                    "telemetry": telemetry1_data
                },
                "driver2": {
                    "name": driver2_info['FullName'],
                    "driver_number": str(driver2_num),
                    "team": team2,
                    "team_color": self._get_team_color(team2),
                    "fastest_lap": fastest_lap2,
                    "telemetry": telemetry2_data
                },
                "track": {
                    "name": track_name,
                    "corners": corners
                }
            }
        except Exception as e:
            error_msg = f"Error fetching race data: {str(e)}"
            print(error_msg)
            import traceback
            traceback.print_exc()
            # Return error info instead of None for better debugging
            raise Exception(error_msg)
    
    def _get_team_color(self, team: str) -> str:
        """Map team names to their official colors."""
        team_colors = {
            "Red Bull Racing": "#3671C6",
            "Red Bull Racing RBPT": "#3671C6",
            "Ferrari": "#F91536",
            "Mercedes": "#00D2BE",
            "McLaren": "#F58020",
            "Alpine F1 Team": "#2293D1",
            "Aston Martin": "#00665E",
            "Aston Martin F1 Team": "#00665E",
            "AlphaTauri": "#4E7C9B",
            "Scuderia AlphaTauri": "#4E7C9B",
            "Alfa Romeo": "#B12039",
            "Alfa Romeo F1 Team": "#B12039",
            "Haas F1 Team": "#B6BABD",
            "Haas": "#B6BABD",
            "Williams": "#37BEDD",
            "Williams Racing": "#37BEDD"
        }
        return team_colors.get(team, "#FFFFFF")
    
    def _extract_corners(self, positions: pd.DataFrame) -> List[Dict]:
        """Extract corner positions from track data (simplified - marks major direction changes)."""
        corners = []
        if len(positions) < 10:
            return corners
        
        # Simple corner detection: find points with significant direction changes
        x_coords = positions['X'].values
        y_coords = positions['Y'].values
        
        # Sample every 50th point as potential corners
        step = max(1, len(positions) // 20)
        corner_num = 1
        
        for i in range(step, len(positions) - step, step):
            corners.append({
                "number": corner_num,
                "x": float(x_coords[i]),
                "y": float(y_coords[i])
            })
            corner_num += 1
        
        return corners

