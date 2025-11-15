'use client';

import { useState } from 'react';
import SessionSelector from '@/components/SessionSelector';
import DriverSelector from '@/components/DriverSelector';
import RaceVisualization from '@/components/RaceVisualization';
import { RaceData, fetchRaceData } from '@/lib/api';

type View = 'session' | 'drivers' | 'race';

export default function Home() {
  const [view, setView] = useState<View>('session');
  const [year, setYear] = useState(2024);
  const [round, setRound] = useState(1);
  const [session, setSession] = useState('R');
  const [driver1, setDriver1] = useState<string>('');
  const [driver2, setDriver2] = useState<string>('');
  const [raceData, setRaceData] = useState<RaceData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSessionSelect = (
    selectedYear: number,
    selectedRound: number,
    selectedSession: string
  ) => {
    setYear(selectedYear);
    setRound(selectedRound);
    setSession(selectedSession);
    setView('drivers');
  };

  const handleDriversSelect = async (
    selectedDriver1: string,
    selectedDriver2: string
  ) => {
    setDriver1(selectedDriver1);
    setDriver2(selectedDriver2);
    setLoading(true);

    try {
      const data = await fetchRaceData(
        year,
        round,
        session,
        selectedDriver1,
        selectedDriver2
      );
      setRaceData(data);
      setView('race');
    } catch (error) {
      console.error('Error loading race data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load race data. Please try again.';
      alert(errorMessage);
      setView('drivers'); // Go back to driver selection on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-f1-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-f1-text-secondary mb-4">
            Loading telemetry data...
          </div>
          <div className="w-16 h-16 border-4 border-f1-red border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (view === 'session') {
    return <SessionSelector onSessionSelect={handleSessionSelect} />;
  }

  if (view === 'drivers') {
    return (
      <DriverSelector
        year={year}
        round={round}
        session={session}
        onDriversSelect={handleDriversSelect}
        onBack={() => setView('session')}
      />
    );
  }

  if (view === 'race' && raceData) {
    return (
      <RaceVisualization
        raceData={raceData}
        onBack={() => setView('drivers')}
      />
    );
  }

  return null;
}

