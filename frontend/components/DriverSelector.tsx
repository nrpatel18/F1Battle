'use client';

import { useState, useEffect } from 'react';
import { fetchDrivers, Driver } from '@/lib/api';
import { motion } from 'framer-motion';

interface DriverSelectorProps {
  year: number;
  round: number;
  session: string;
  onDriversSelect: (driver1: string, driver2: string) => void;
  onBack: () => void;
}

export default function DriverSelector({
  year,
  round,
  session,
  onDriversSelect,
  onBack,
}: DriverSelectorProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrivers();
  }, [year, round, session]);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await fetchDrivers(year, round, session);
      setDrivers(data);
    } catch (error) {
      console.error('Error loading drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDriver = (driverNumber: string) => {
    setSelectedDrivers((prev) => {
      if (prev.includes(driverNumber)) {
        return prev.filter((d) => d !== driverNumber);
      } else if (prev.length < 2) {
        return [...prev, driverNumber];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    if (selectedDrivers.length === 2) {
      onDriversSelect(selectedDrivers[0], selectedDrivers[1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-f1-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-f1-text-secondary mb-4">Loading drivers...</div>
          <div className="w-16 h-16 border-4 border-f1-red border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-f1-bg p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="text-f1-text-secondary hover:text-f1-red transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold uppercase text-f1-red">
            Select 2 Drivers
          </h1>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {drivers.map((driver) => {
            const isSelected = selectedDrivers.includes(driver.driver_number);
            const isDisabled = !isSelected && selectedDrivers.length >= 2;

            return (
              <motion.button
                key={driver.driver_number}
                onClick={() => toggleDriver(driver.driver_number)}
                disabled={isDisabled}
                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                className={`glass rounded-lg p-6 border-2 transition-all ${
                  isSelected
                    ? 'border-f1-red shadow-lg shadow-f1-red/50'
                    : isDisabled
                    ? 'border-f1-grid opacity-50 cursor-not-allowed'
                    : 'border-f1-grid hover:border-f1-red'
                }`}
                style={{
                  borderColor: isSelected ? driver.team_color : undefined,
                }}
              >
                <div
                  className="text-4xl font-bold mb-2"
                  style={{ color: driver.team_color }}
                >
                  #{driver.driver_number}
                </div>
                <div className="text-lg font-semibold text-white mb-1">
                  {driver.full_name.split(' ').pop()}
                </div>
                <div className="text-sm text-f1-text-secondary">
                  {driver.team}
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2 text-f1-red font-bold"
                  >
                    ✓ Selected
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {selectedDrivers.length === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <motion.button
              onClick={handleContinue}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-f1-red hover:bg-f1-accent text-white font-bold uppercase py-4 px-12 rounded transition-colors"
            >
              Watch Race →
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

