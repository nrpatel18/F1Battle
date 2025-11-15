'use client';

import { useState, useEffect } from 'react';
import { fetchSessions, Session } from '@/lib/api';
import { motion } from 'framer-motion';

interface SessionSelectorProps {
  onSessionSelect: (year: number, round: number, session: string) => void;
}

export default function SessionSelector({ onSessionSelect }: SessionSelectorProps) {
  const [year, setYear] = useState(2024);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>('R');
  const [loading, setLoading] = useState(false);

  const sessionTypes = [
    { value: 'Q', label: 'Qualifying' },
    { value: 'R', label: 'Race' },
  ];

  useEffect(() => {
    loadSessions();
  }, [year]);

  // Ensure selectedRound is always a valid value when sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      // If current selectedRound is not in the new sessions, reset to first
      if (!sessions.some((s) => s.round === selectedRound)) {
        setSelectedRound(sessions[0].round);
      }
    } else {
      setSelectedRound(null);
    }
  }, [sessions]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await fetchSessions(year);
      // DEBUG: Log the data to verify what is received from backend
      console.log('Fetched sessions:', data);
      setSessions(data);
      setSelectedRound(data.length > 0 ? data[0].round : null);
    } catch (error) {
      setSessions([]);
      setSelectedRound(null);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading sessions:', errorMessage, error);
      // Show user-friendly error
      alert(`Failed to load sessions: ${errorMessage}\n\nPlease check:\n1. Backend is running\n2. NEXT_PUBLIC_API_URL is set in Vercel\n3. CORS is configured correctly`);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedRound) {
      onSessionSelect(year, selectedRound, selectedSession);
    }
  };

  return (
    <div className="min-h-screen bg-f1-bg flex items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl glass rounded-lg p-8 border-2 border-f1-red"
      >
        <h1 className="text-4xl font-bold uppercase mb-2 text-f1-red text-center">
          F1 Telemetry Battle
        </h1>
        <p className="text-f1-text-secondary text-center mb-8">
          Select a session to compare driver telemetry
        </p>

        <div className="space-y-6">
          {/* Year Selector */}
          <div>
            <label className="block text-sm font-semibold uppercase mb-2 text-f1-text-secondary">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full bg-f1-surface border-2 border-f1-grid rounded px-4 py-3 text-white focus:border-f1-red focus:outline-none transition-colors"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
            </select>
          </div>

          {/* Grand Prix Selector */}
          <div>
            <label className="block text-sm font-semibold uppercase mb-2 text-f1-text-secondary">
              Grand Prix
            </label>
            {loading ? (
              <div className="w-full bg-f1-surface border-2 border-f1-grid rounded px-4 py-3 text-f1-text-secondary">
                Loading sessions...
              </div>
            ) : (
              <select
                value={selectedRound !== null ? selectedRound : ''}
                onChange={(e) => setSelectedRound(Number(e.target.value))}
                className={`w-full bg-f1-surface border-2 rounded px-4 py-3 text-white focus:border-f1-red focus:outline-none transition-colors ${!selectedRound ? 'border-f1-red' : 'border-f1-grid'}`}
                disabled={sessions.length === 0}
              >
                <option value="" disabled>
                  {sessions.length === 0 ? 'No sessions available' : 'Select a Grand Prix'}
                </option>
                {sessions
                  .filter((session) => session.name !== 'Pre-Season Testing')
                  .map((session) => (
                    <option key={session.round} value={session.round}>
                      {session.name}
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* Session Type Selector */}
          <div>
            <label className="block text-sm font-semibold uppercase mb-2 text-f1-text-secondary">
              Session Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {sessionTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedSession(type.value)}
                  className={`py-3 px-4 rounded border-2 transition-all ${
                    selectedSession === type.value
                      ? 'bg-f1-red border-f1-red text-white font-bold'
                      : 'bg-f1-surface border-f1-grid text-f1-text-secondary hover:border-f1-red'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <motion.button
            onClick={handleContinue}
            disabled={!selectedRound || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-f1-red hover:bg-f1-accent text-white font-bold uppercase py-4 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Drivers →
          </motion.button>
        </div>
      </motion.div>

      {/* GitHub Link Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-6">
        <a
          href="https://github.com/nrpatel18/F1Battle"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-f1-text-secondary hover:text-f1-red transition-colors group"
        >
          <span className="text-sm">Peek under the hood</span>
          <svg
            className="w-5 h-5 transition-transform group-hover:scale-110"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </footer>
    </div>
  );
}

