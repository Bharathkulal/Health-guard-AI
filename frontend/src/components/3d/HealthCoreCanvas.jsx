import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { HealthCoreMesh } from './HealthCoreMesh';
import { DataParticles } from './DataParticles';
import { useTheme } from '../../context/ThemeContext';
import * as THREE from 'three';

function ParallaxGroup({ children }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    // Smooth lerp following normalized mouse coordinates
    const targetX = state.pointer.x * 0.4;
    const targetY = state.pointer.y * 0.3;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.05);
  });

  return <group ref={groupRef}>{children}</group>;
}

export function HealthCoreCanvas({ className = "w-full h-full", pulseSpeed = 1, accentColor = "#10b981" }) {
  const { isDark } = useTheme();

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={isDark ? 0.7 : 1.1} />
        <directionalLight position={[5, 8, 5]} intensity={isDark ? 1.5 : 2.0} color="#ffffff" />
        <directionalLight position={[-5, -5, -3]} intensity={isDark ? 0.8 : 0.4} color="#10b981" />
        
        <Suspense fallback={null}>
          <ParallaxGroup>
            <HealthCoreMesh isDark={isDark} pulseSpeed={pulseSpeed} accentColor={accentColor} />
            <DataParticles count={100} isDark={isDark} accentColor={accentColor} />
          </ParallaxGroup>
        </Suspense>
      </Canvas>
    </div>
  );
}
