'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface Track3DProps {
  points: Array<[number, number]>;
}

export default function Track3D({ points }: Track3DProps) {
  const { trackLine, racingLine } = useMemo(() => {
    if (!points || points.length < 2) {
      return { trackLine: null, racingLine: null };
    }

    // Scale coordinates (F1 coordinates are in meters, scale for visualization)
    const scale = 0.01;
    
    // Create 3D curve from points
    const curvePoints = points.map(([x, y]) => 
      new THREE.Vector3(x * scale, 0, y * scale)
    );
    
    // Close the loop
    if (curvePoints.length > 0 && curvePoints[0].distanceTo(curvePoints[curvePoints.length - 1]) > 1) {
      curvePoints.push(curvePoints[0].clone());
    }
    
    // Create smooth curve
    const curve = new THREE.CatmullRomCurve3(curvePoints, true);
    
    // Create tube geometry for track (simplified - use fewer segments for performance)
    const segments = Math.min(curvePoints.length * 2, 200);
    const trackGeometry = new THREE.TubeGeometry(curve, segments, 6, 8, true);
    
    // Create racing line (center line) - thinner tube
    const racingLineGeometry = new THREE.TubeGeometry(curve, segments, 0.2, 8, true);

    return { 
      trackLine: trackGeometry, 
      racingLine: racingLineGeometry 
    };
  }, [points]);

  if (!trackLine) return null;

  return (
    <group>
      {/* Track surface */}
      <mesh geometry={trackLine} receiveShadow>
        <meshStandardMaterial
          color="#444444"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Racing line */}
      {racingLine && (
        <mesh geometry={racingLine}>
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      )}

      {/* Grid floor */}
      <gridHelper args={[2000, 100, '#2A2A35', '#2A2A35']} />
    </group>
  );
}

