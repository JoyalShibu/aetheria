'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function NebulaStars() {
  const ref = useRef<THREE.Group>(null);
  
  // Slowly rotate the stars for an anti-gravity drifting feel
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 40;
      ref.current.rotation.y -= delta / 50;
    }
  });

  return (
    <group ref={ref}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

export default function CanvasBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <color attach="background" args={['#0a001a']} />
        <ambientLight intensity={0.5} />
        <NebulaStars />
      </Canvas>
    </div>
  );
}
