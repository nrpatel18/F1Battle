const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Log API URL in development to help debug
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API URL:', API_URL);
}

export interface Session {
  round: number;
  name: string;
  country: string;
  location: string;
}

export interface Driver {
  driver_number: string;
  full_name: string;
  team: string;
  team_color: string;
}

export interface TelemetryData {
  time: number[];
  distance: number[];
  x: number[];
  y: number[];
  speed: number[];
  throttle: number[];
  brake: number[];
  gear: number[];
}

export interface DriverRaceData {
  name: string;
  driver_number: string;
  team: string;
  team_color: string;
  fastest_lap: string;
  telemetry: TelemetryData;
}

export interface RaceData {
  driver1: DriverRaceData;
  driver2: DriverRaceData;
  track: {
    name: string;
    corners: Array<{ number: number; x: number; y: number }>;
    flag?: string;
  };
}

export async function fetchSessions(year: number): Promise<Session[]> {
  const url = `${API_URL}/api/sessions?year=${year}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch sessions from ${url}:`, response.status, errorText);
      throw new Error(`Failed to fetch sessions: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching sessions from ${url}:`, error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Cannot connect to ${API_URL}. Check if NEXT_PUBLIC_API_URL is set correctly.`);
    }
    throw error;
  }
}

export async function fetchDrivers(
  year: number,
  round: number,
  session: string
): Promise<Driver[]> {
  const response = await fetch(
    `${API_URL}/api/drivers?year=${year}&round=${round}&session=${session}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch drivers');
  }
  return response.json();
}

export async function fetchRaceData(
  year: number,
  round: number,
  session: string,
  driver1: string,
  driver2: string
): Promise<RaceData> {
  const response = await fetch(
    `${API_URL}/api/race-data?year=${year}&round=${round}&session=${session}&driver1=${driver1}&driver2=${driver2}`
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || 'Failed to fetch race data');
  }
  return response.json();
}

