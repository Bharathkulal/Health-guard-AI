import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function HealthCoreMesh({ isDark = true, pulseSpeed = 1, accentColor = "#10b981" }) {
  const coreRef = useRef();
  const innerRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const wireRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    // Core smooth rotation & breathing pulse
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.25;
      coreRef.current.rotation.x = Math.sin(time * 0.4) * 0.15;
      const scale = 1 + Math.sin(time * (1.8 * pulseSpeed)) * 0.04;
      coreRef.current.scale.set(scale, scale, scale);
    }

    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.4;
      innerRef.current.rotation.z += delta * 0.2;
    }

    if (wireRef.current) {
      wireRef.current.rotation.y += delta * 0.15;
      wireRef.current.rotation.z -= delta * 0.1;
    }

    // Orbiting telemetry rings with distinct tilt angles
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.3;
      ring1Ref.current.rotation.x = Math.PI / 3 + Math.sin(time * 0.5) * 0.1;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y += delta * 0.25;
      ring2Ref.current.rotation.z = Math.PI / 6 + Math.cos(time * 0.4) * 0.1;
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.x -= delta * 0.35;
      ring3Ref.current.rotation.y = Math.PI / 4;
    }
  });

  return (
    <group>
      {/* Outer Satin Translucent Core Sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshPhysicalMaterial
          color={isDark ? "#064e3b" : "#a7f3d0"}
          emissive={isDark ? "#047857" : "#34d399"}
          emissiveIntensity={isDark ? 0.35 : 0.15}
          roughness={0.25}
          metalness={0.1}
          transmission={0.85}
          thickness={1.2}
          transparent={true}
          opacity={0.88}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
        />
      </mesh>

      {/* Wireframe Geometric Inner Matrix */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.7, 2]} />
        <meshStandardMaterial
          color={accentColor}
          wireframe={true}
          transparent={true}
          opacity={isDark ? 0.25 : 0.2}
        />
      </mesh>

      {/* Inner Glowing Bio-Core */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.9, 2]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={isDark ? 0.8 : 0.4}
          roughness={0.1}
          wireframe={false}
        />
      </mesh>

      {/* Orbiting Telemetry Rings */}
      <group ref={ring1Ref}>
        <mesh>
          <torusGeometry args={[2.2, 0.012, 16, 100]} />
          <meshBasicMaterial color={accentColor} transparent opacity={isDark ? 0.6 : 0.4} />
        </mesh>
      </group>

      <group ref={ring2Ref}>
        <mesh>
          <torusGeometry args={[2.55, 0.009, 16, 100]} />
          <meshBasicMaterial color={isDark ? "#34d399" : "#059669"} transparent opacity={isDark ? 0.45 : 0.35} />
        </mesh>
      </group>

      <group ref={ring3Ref}>
        <mesh>
          <torusGeometry args={[2.9, 0.007, 16, 100]} />
          <meshBasicMaterial color={isDark ? "#6ee7b7" : "#10b981"} transparent opacity={isDark ? 0.3 : 0.2} />
        </mesh>
      </group>

      {/* Point lights for ambient subsurface glow */}
      <pointLight position={[0, 0, 0]} color={accentColor} intensity={isDark ? 2.5 : 1.2} distance={6} />
      <pointLight position={[3, 3, 3]} color="#ffffff" intensity={isDark ? 0.8 : 1.2} />
      <pointLight position={[-3, -2, -2]} color="#059669" intensity={isDark ? 1.2 : 0.6} />
    </group>
  );
}
