'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface Car3DProps {
  position: [number, number, number];
  rotation: number;
  color: string;
  driverNumber: string;
  speed: number;
  throttle: number;
  brake: number;
}

export default function Car3D({
  position,
  rotation,
  color,
  driverNumber,
  speed,
  throttle,
  brake,
}: Car3DProps) {
  const carRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // Add slight tilt based on acceleration/braking
  const tilt = throttle > 50 ? -0.1 : brake > 50 ? 0.1 : 0;

  useFrame(() => {
    if (carRef.current) {
      carRef.current.rotation.y = rotation;
      carRef.current.rotation.x = tilt;
    }
  });

  return (
    <group ref={carRef} position={position}>
      {/* Car body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 0.5, 1]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Driver number on top */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.3}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {driverNumber}
      </Text>

      {/* Glow effect */}
      <pointLight
        ref={glowRef}
        color={color}
        intensity={0.5}
        distance={5}
        decay={2}
      />

      {/* Shadow plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.25, 0]}
        receiveShadow
      >
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

