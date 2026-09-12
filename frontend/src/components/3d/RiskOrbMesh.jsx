import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function RiskOrbMesh({ isDark = true, riskScore = 64 }) {
  const meshRef = useRef();
  const ringGroupRef = useRef();
  const innerCoreRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
    }
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.z += delta * 0.4;
      ringGroupRef.current.rotation.y -= delta * 0.2;
    }
    if (innerCoreRef.current) {
      const scale = 1 + Math.sin(time * 2.2) * 0.05;
      innerCoreRef.current.scale.set(scale, scale, scale);
    }
  });

  // Color mapping based on score
  const orbColor = riskScore > 70 ? "#f59e0b" : riskScore > 40 ? "#10b981" : "#059669";
  const glowColor = riskScore > 70 ? "#fbbf24" : "#34d399";

  return (
    <group>
      {/* Outer segmented translucent shell */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.4, 48, 48]} />
        <meshPhysicalMaterial
          color={isDark ? "#064e3b" : "#6ee7b7"}
          emissive={orbColor}
          emissiveIntensity={isDark ? 0.4 : 0.2}
          roughness={0.2}
          transmission={0.88}
          thickness={1.5}
          transparent
          opacity={0.85}
          clearcoat={0.9}
        />
      </mesh>

      {/* Internal energy pulse core */}
      <mesh ref={innerCoreRef}>
        <dodecahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={isDark ? 1.0 : 0.6}
          wireframe={true}
        />
      </mesh>

      {/* Stratified Multi-Axis Risk Indicator Rings */}
      <group ref={ringGroupRef}>
        {/* Cardiovascular Ring */}
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.8, 0.015, 16, 80, Math.PI * 1.5]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>

        {/* Hypertension Ring */}
        <mesh rotation={[-Math.PI / 4, Math.PI / 3, 0]}>
          <torusGeometry args={[2.05, 0.012, 16, 80, Math.PI * 1.7]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>

        {/* Metabolic / Diabetes Ring */}
        <mesh rotation={[0, -Math.PI / 4, Math.PI / 6]}>
          <torusGeometry args={[2.28, 0.01, 16, 80, Math.PI * 1.3]} />
          <meshBasicMaterial color="#34d399" />
        </mesh>
      </group>

      <pointLight color={glowColor} intensity={isDark ? 2.0 : 1.2} distance={5} />
    </group>
  );
}
