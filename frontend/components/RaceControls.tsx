'use client';

import { motion } from 'framer-motion';

interface RaceControlsProps {
  isPlaying: boolean;
  playbackSpeed: number;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}

export default function RaceControls({
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onSpeedChange,
  onReset,
}: RaceControlsProps) {
  const speeds = [0.5, 1, 2, 4];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-lg p-4 border-2 border-f1-grid flex items-center justify-center gap-4"
    >
      {/* Play/Pause */}
      <button
        onClick={onPlayPause}
        className="bg-f1-red hover:bg-f1-accent text-white font-bold uppercase py-2 px-6 rounded transition-colors"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Speed Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-f1-text-secondary uppercase">Speed:</span>
        {speeds.map((speed) => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
              playbackSpeed === speed
                ? 'bg-f1-red text-white'
                : 'bg-f1-surface text-f1-text-secondary hover:bg-f1-grid'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="bg-f1-surface hover:bg-f1-grid text-f1-text-secondary hover:text-white font-bold uppercase py-2 px-4 rounded transition-colors"
      >
        Reset
      </button>
    </motion.div>
  );
}

