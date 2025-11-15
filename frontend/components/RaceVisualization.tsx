'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import TelemetryPanel from './TelemetryPanel';
import RaceControls from './RaceControls';
import { RaceData } from '@/lib/api';
import React from 'react';

// Define props type if not imported
export interface RaceVisualizationProps {
  raceData: any; // Replace 'any' with your actual raceData type if available
  driver1State: { position: [number, number, number] };
  driver2State: { position: [number, number, number] };
  trackPoints: Array<[number, number]>;
  onBack?: () => void;
}

// Helper to get 3-char abbreviation
function getAbbreviation(name: string) {
  const parts = name.split(' ');
  if (parts.length === 1) return name.slice(0, 3).toUpperCase();
  return (
    (parts[0][0] || '') + (parts[1][0] || '') + (parts[1][1] || '')
  ).toUpperCase();
}

export default function RaceVisualization({
  raceData,
  onBack,
}: RaceVisualizationProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
  const [winnerColor, setWinnerColor] = useState<string>('#E10600');

  const driver1FinishTime =
    raceData.driver1.telemetry.time[
      raceData.driver1.telemetry.time.length - 1
    ] ?? 0;
  const driver2FinishTime =
    raceData.driver2.telemetry.time[
      raceData.driver2.telemetry.time.length - 1
    ] ?? 0;
  const maxTime = Math.max(driver1FinishTime, driver2FinishTime);

  const determineWinner = useCallback(() => {
    if (driver1FinishTime === driver2FinishTime) {
      return null;
    }
    return driver1FinishTime < driver2FinishTime
      ? raceData.driver1.name
      : raceData.driver2.name;
  }, [driver1FinishTime, driver2FinishTime, raceData.driver1.name, raceData.driver2.name]);

  // Track points for 3D visualization
  const trackPoints = useMemo(() => {
    return raceData.driver1.telemetry.x.map((x: number, i: number) => [
      -x, // Flip left-right to match camera orientation
      raceData.driver1.telemetry.y[i],
    ]) as Array<[number, number]>;
  }, [raceData]);

  const trackGeometry = useMemo(() => {
    if (!trackPoints.length) {
      return null;
    }

    const baseScale = 0.01;
    const points3D = trackPoints.map(
      ([x, y]) => new THREE.Vector3(x * baseScale, 0, y * baseScale)
    );

    const centerVec = points3D
      .reduce((acc, p) => acc.add(p), new THREE.Vector3())
      .divideScalar(points3D.length);

    const centeredPoints = points3D.map((p) => p.clone().sub(centerVec));
    const box = new THREE.Box3().setFromPoints(centeredPoints);
    const size = box.getSize(new THREE.Vector3());
    const width = Math.max(size.x, size.z);
    const desiredWidth = 220;
    const scaleMultiplier = width > 0 ? desiredWidth / width : 1;

    const scaledPoints = centeredPoints.map((p) =>
      p.clone().multiplyScalar(scaleMultiplier)
    );

    // Use centripetal Catmull-Rom to reduce overshoot glitches near the seam
    const curve = new THREE.CatmullRomCurve3(
      scaledPoints,
      true,
      'centripetal',
      0
    );

    const numCorners = Math.max(
      8,
      Math.min(20, Math.round(trackPoints.length / 60))
    );
    const cornerData = Array.from({ length: numCorners }, (_, i) => {
      const t = i / numCorners;
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const normal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
      return { point, normal };
    });

    const startPoint = curve.getPoint(0);
    const startTangent = curve.getTangent(0).normalize();
    const startNormal = new THREE.Vector3(startTangent.z, 0, -startTangent.x).normalize();
    const flagPosition = startPoint
      .clone()
      .add(startNormal.clone().multiplyScalar(-8));

    return {
      curve,
      cornerData,
      startPoint,
      flagPosition,
      transform: {
        baseScale,
        center: { x: centerVec.x, z: centerVec.z },
        scaleMultiplier,
      },
    };
  }, [trackPoints]);

  // Animation loop using requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) return;
    setWinnerMessage(null);

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (timestamp: number) => {
      const delta = (timestamp - lastTime) / 1000; // Convert to seconds
      lastTime = timestamp;
      let reachedFinish = false;

      setCurrentTime((prev) => {
        const newTime = prev + delta * playbackSpeed;
        if (newTime >= maxTime) {
          reachedFinish = true;
          return maxTime;
        }
        return newTime;
      });

      if (reachedFinish) {
        const winner = determineWinner();
        if (winner) {
          setWinnerColor(
            winner === raceData.driver1.name
              ? raceData.driver1.team_color
              : raceData.driver2.team_color
          );
          setWinnerMessage(`${winner} wins the battle lap`);
        } else {
          setWinnerColor('#E10600');
          setWinnerMessage('Battle lap ends in a draw');
        }
        setIsPlaying(false);
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, playbackSpeed, maxTime, determineWinner]);

  // Get current telemetry values
  const driver1State = useMemo(() => {
    const pos = interpolatePosition(
      raceData.driver1.telemetry,
      currentTime,
      trackGeometry?.transform
    );
    return {
      ...pos,
      speed: interpolateValue(
        raceData.driver1.telemetry.time,
        raceData.driver1.telemetry.speed,
        currentTime
      ),
      throttle: interpolateValue(
        raceData.driver1.telemetry.time,
        raceData.driver1.telemetry.throttle,
        currentTime
      ),
      brake: interpolateValue(
        raceData.driver1.telemetry.time,
        raceData.driver1.telemetry.brake,
        currentTime
      ),
      gear: Math.round(
        interpolateValue(
          raceData.driver1.telemetry.time,
          raceData.driver1.telemetry.gear,
          currentTime
        )
      ),
    };
  }, [currentTime, raceData.driver1.telemetry, trackGeometry]);

  const driver2State = useMemo(() => {
    const pos = interpolatePosition(
      raceData.driver2.telemetry,
      currentTime,
      trackGeometry?.transform
    );
    return {
      ...pos,
      speed: interpolateValue(
        raceData.driver2.telemetry.time,
        raceData.driver2.telemetry.speed,
        currentTime
      ),
      throttle: interpolateValue(
        raceData.driver2.telemetry.time,
        raceData.driver2.telemetry.throttle,
        currentTime
      ),
      brake: interpolateValue(
        raceData.driver2.telemetry.time,
        raceData.driver2.telemetry.brake,
        currentTime
      ),
      gear: Math.round(
        interpolateValue(
          raceData.driver2.telemetry.time,
          raceData.driver2.telemetry.gear,
          currentTime
        )
      ),
    };
  }, [currentTime, raceData.driver2.telemetry, trackGeometry]);

  // Calculate gap (time difference at same distance)
  const gap = useMemo(() => {
    const distance1 = interpolateValue(
      raceData.driver1.telemetry.time,
      raceData.driver1.telemetry.distance,
      currentTime
    );
    // Find time when driver2 was at same distance
    let gapTime = 0;
    for (let i = 0; i < raceData.driver2.telemetry.distance.length; i++) {
      if (raceData.driver2.telemetry.distance[i] >= distance1) {
        if (i > 0) {
          const t =
            (distance1 - raceData.driver2.telemetry.distance[i - 1]) /
            (raceData.driver2.telemetry.distance[i] -
              raceData.driver2.telemetry.distance[i - 1]);
          gapTime =
            raceData.driver2.telemetry.time[i - 1] +
            (raceData.driver2.telemetry.time[i] -
              raceData.driver2.telemetry.time[i - 1]) *
              t;
        } else {
          gapTime = raceData.driver2.telemetry.time[i];
        }
        break;
      }
    }
    return currentTime - gapTime;
  }, [currentTime, raceData]);

  const formatLapTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  };

  return (
    <div className="relative h-screen bg-f1-bg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-f1-grid">
        <button
          onClick={onBack}
          className="text-f1-text-secondary hover:text-f1-red transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          {raceData.track.flag && (
            <span
              className="text-3xl"
              role="img"
              aria-label={`${raceData.track.name} flag`}
            >
              {raceData.track.flag}
            </span>
          )}
          <h1 className="text-2xl font-bold uppercase text-f1-red">
            {raceData.track.name}
          </h1>
        </div>
        <div className="w-20"></div>
      </div>

      {winnerMessage && (
        <div
          className="absolute top-24 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full font-bold tracking-wide uppercase text-2xl"
          style={{ color: winnerColor }}
        >
          {winnerMessage}
        </div>
      )}

      {/* Main Race View */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
        {/* Left Panel */}
        <div className="col-span-1 md:col-span-2 order-2 md:order-1">
          <TelemetryPanel
            name={raceData.driver1.name}
            team={raceData.driver1.team}
            teamColor={raceData.driver1.team_color}
            speed={driver1State.speed}
            throttle={driver1State.throttle}
            brake={driver1State.brake}
            gear={driver1State.gear}
            gap={-gap}
            lapTime={formatLapTime(currentTime)}
            isLeft={true}
          />
        </div>

        {/* 3D Scene */}
        <div className="col-span-1 md:col-span-8 relative order-1 md:order-2 h-64 md:h-auto">
          <Canvas shadows>
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 50, 10]}
              intensity={1}
              castShadow
            />

            {/* Track rendering */}
            {trackGeometry && (
              <>
                <Line
                  points={trackGeometry.curve
                    .getPoints(400)
                    .map((p) => [p.x, p.y, p.z])}
                  color="#e0e0e0"
                  lineWidth={4}
                />
                {/* Start/finish flag */}
                <group
                  position={[
                    trackGeometry.flagPosition.x,
                    0,
                    trackGeometry.flagPosition.z,
                  ]}
                >
                  <Billboard position={[0, 5, 0]} follow>
                    <Text
                      fontSize={6}
                      color="#FFFFFF"
                      anchorX="center"
                      anchorY="bottom"
                    >
                      🏁
                    </Text>
                  </Billboard>
                </group>
                {trackGeometry.cornerData.map(({ point, normal }, i) => {
                  const offsetX = point.x + normal.x * 6;
                  const offsetZ = point.z + normal.z * 6;
                  const angleToFlag = Math.atan2(
                    offsetX - trackGeometry.flagPosition.x,
                    offsetZ - trackGeometry.flagPosition.z
                  );

                  return (
                    <React.Fragment key={`corner-${i}`}>
                      <Sphere args={[0.6, 16, 16]} position={[point.x, 0.2, point.z]}>
                        <meshStandardMaterial color="#FFD600" />
                      </Sphere>
                      <Text
                        position={[offsetX, 1.8, offsetZ]}
                        fontSize={3.8}
                        color="#FFD600"
                        anchorX="center"
                        anchorY="middle"
                        rotation={[-Math.PI / 2, angleToFlag, 0]}
                      >
                        {i + 1}
                      </Text>
                    </React.Fragment>
                  );
                })}
              </>
            )}

            {/* Driver dots */}
            {[{ state: driver1State, data: raceData.driver1, key: 'driver1' }, { state: driver2State, data: raceData.driver2, key: 'driver2' }].map(({ state, data, key }) => (
              <React.Fragment key={key}>
                <Sphere args={[1.6, 24, 24]} position={state.position as [number, number, number]}>
                  <meshStandardMaterial color={data.team_color} emissive={data.team_color} emissiveIntensity={0.5} />
                </Sphere>
                <Text
                  position={[(state.position[0] as number), 3, (state.position[2] as number)]}
                  fontSize={3.5}
                  color={data.team_color}
                  anchorX="center"
                  anchorY="bottom"
                  outlineWidth={0.6}
                  outlineColor="#111"
                >
                  {getAbbreviation(data.name)}
                </Text>
              </React.Fragment>
            ))}

            <OrbitControls
              enableRotate={true}
              enableZoom={true}
              enablePan={false}
              minDistance={20}
              maxDistance={200}
              maxPolarAngle={Math.PI / 2.2}
            />
          </Canvas>

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2/3">
            <RaceControls
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onPlayPause={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                } else {
                  if (currentTime >= maxTime) {
                    setCurrentTime(0);
                  }
                  setWinnerMessage(null);
                  setIsPlaying(true);
                }
              }}
              onSpeedChange={setPlaybackSpeed}
              onReset={() => {
                setWinnerMessage(null);
                setCurrentTime(0);
                setIsPlaying(false);
              }}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-1 md:col-span-2 order-3">
          <TelemetryPanel
            name={raceData.driver2.name}
            team={raceData.driver2.team}
            teamColor={raceData.driver2.team_color}
            speed={driver2State.speed}
            throttle={driver2State.throttle}
            brake={driver2State.brake}
            gear={driver2State.gear}
            gap={gap}
            lapTime={formatLapTime(currentTime)}
            isLeft={false}
          />
        </div>
      </div>
    </div>
  );
}

function interpolateValue(
  times: number[],
  values: number[],
  currentTime: number
): number {
  if (times.length === 0) return 0;
  if (currentTime <= times[0]) return values[0];
  if (currentTime >= times[times.length - 1]) return values[values.length - 1];

  for (let i = 0; i < times.length - 1; i++) {
    if (currentTime >= times[i] && currentTime <= times[i + 1]) {
      const t =
        (currentTime - times[i]) / (times[i + 1] - times[i]);
      return values[i] + (values[i + 1] - values[i]) * t;
    }
  }
  return values[values.length - 1];
}

type TrackTransform = {
  baseScale: number;
  center: { x: number; z: number };
  scaleMultiplier: number;
};

function interpolatePosition(
  telemetry: RaceData['driver1']['telemetry'],
  currentTime: number,
  transform?: TrackTransform
): { position: [number, number, number]; rotation: number } {
  if (!transform) {
    return { position: [0, 0.3, 0], rotation: 0 };
  }

  const { baseScale, center, scaleMultiplier } = transform;

  const rawX = interpolateValue(telemetry.time, telemetry.x, currentTime);
  const rawY = interpolateValue(telemetry.time, telemetry.y, currentTime);

  const baseX = -rawX * baseScale;
  const baseZ = rawY * baseScale;

  const x = (baseX - center.x) * scaleMultiplier;
  const z = (baseZ - center.z) * scaleMultiplier;
  const y = 0.6;

  const nextRawX = interpolateValue(
    telemetry.time,
    telemetry.x,
    currentTime + 0.1
  );
  const nextRawY = interpolateValue(
    telemetry.time,
    telemetry.y,
    currentTime + 0.1
  );
  const nextX = ((-nextRawX * baseScale) - center.x) * scaleMultiplier;
  const nextZ = ((nextRawY * baseScale) - center.z) * scaleMultiplier;
  const rotation = Math.atan2(nextX - x, nextZ - z);

  return { position: [x, y, z], rotation };
}

