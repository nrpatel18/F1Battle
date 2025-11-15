'use client';

import { motion } from 'framer-motion';

interface TelemetryPanelProps {
  name: string;
  team: string;
  teamColor: string;
  speed: number;
  throttle: number;
  brake: number;
  gear: number;
  gap: number;
  lapTime: string;
  isLeft?: boolean;
}

export default function TelemetryPanel({
  name,
  team,
  teamColor,
  speed,
  throttle,
  brake,
  gear,
  gap,
  lapTime,
  isLeft = false,
}: TelemetryPanelProps) {
  const gapDisplay = gap >= 0 ? `+${gap.toFixed(3)}s` : `${gap.toFixed(3)}s`;
  const gapColor = gap >= 0 ? 'text-f1-text-secondary' : 'text-f1-success';

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-lg p-6 h-full border-2 backdrop-blur-lg"
      style={{ borderColor: teamColor }}
    >
      {/* Header */}
      <div className="mb-6">
        <div
          className="text-2xl font-bold uppercase mb-1"
          style={{ color: teamColor }}
        >
          {name.toUpperCase()}
        </div>
        <div className="text-sm text-f1-text-secondary">
          #{name.split(' ').pop()?.charAt(0)} • {team}
        </div>
      </div>

      {/* Speed */}
      <div className="mb-6">
        <div className="text-xs uppercase text-f1-text-secondary mb-2">
          Speed
        </div>
        <div className="text-5xl font-mono font-bold text-white">
          {Math.round(speed)}
        </div>
        <div className="text-sm text-f1-text-secondary">km/h</div>
      </div>

      {/* Throttle */}
      <div className="mb-4">
        <div className="flex justify-between text-xs uppercase text-f1-text-secondary mb-2">
          <span>Throttle</span>
          <span>{Math.round(throttle)}%</span>
        </div>
        <div className="w-full bg-f1-surface rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-f1-red"
            initial={{ width: 0 }}
            animate={{ width: `${throttle}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Brake */}
      <div className="mb-4">
        <div className="flex justify-between text-xs uppercase text-f1-text-secondary mb-2">
          <span>Brake</span>
          <span>{Math.round(brake)}%</span>
        </div>
        <div className="w-full bg-f1-surface rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-f1-success"
            initial={{ width: 0 }}
            animate={{ width: `${brake}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Gear */}
      <div className="mb-4">
        <div className="text-xs uppercase text-f1-text-secondary mb-2">
          Gear
        </div>
        <div className="text-4xl font-mono font-bold text-white">{gear}</div>
      </div>

      {/* Gap */}
      <div className="mb-4">
        <div className="text-xs uppercase text-f1-text-secondary mb-2">
          Gap
        </div>
        <div className={`text-2xl font-mono font-bold ${gapColor}`}>
          {gapDisplay}
        </div>
      </div>

      {/* Lap Time */}
      <div>
        <div className="text-xs uppercase text-f1-text-secondary mb-2">
          Lap Time
        </div>
        <div className="text-xl font-mono font-bold text-white">{lapTime}</div>
      </div>
    </motion.div>
  );
}

