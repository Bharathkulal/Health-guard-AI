import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { RiskOrbMesh } from './RiskOrbMesh';
import { useTheme } from '../../context/ThemeContext';

export function RiskOrbCanvas({ className = "w-full h-full", riskScore = 64 }) {
  const { isDark } = useTheme();

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={isDark ? 0.8 : 1.2} />
        <directionalLight position={[4, 6, 4]} intensity={isDark ? 1.5 : 2.0} color="#ffffff" />
        <directionalLight position={[-4, -3, -2]} intensity={isDark ? 1.0 : 0.5} color="#10b981" />
        
        <Suspense fallback={null}>
          <RiskOrbMesh isDark={isDark} riskScore={riskScore} />
        </Suspense>
      </Canvas>
    </div>
  );
}
