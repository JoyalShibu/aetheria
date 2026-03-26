'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, ContactShadows, Environment, Stars } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { Profile, useProfile, MOCK_PROFILES } from './ProfileProvider';

function ProfileSphere({ profile, position, index }: { profile: Profile; position: [number, number, number], index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { activeProfile, setActiveProfile } = useProfile();
  
  const isActive = activeProfile?.id === profile.id;

  useFrame((state) => {
    if (!meshRef.current) return;
    // Slow orbit rotation
    meshRef.current.rotation.y += 0.01;
    meshRef.current.rotation.x += 0.005;
    
    // Slight bobbing based on index to make them organic
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index * 2) * 0.2;
  });

  const handleClick = () => {
    setActiveProfile(profile);
  };

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={handleClick}
          scale={hovered || isActive ? 1.2 : 1}
        >
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial 
            color={profile.color} 
            emissive={profile.color}
            emissiveIntensity={hovered || isActive ? 2 : 0.8}
            roughness={0.2}
            metalness={0.8}
            wireframe={hovered || isActive}
          />
        </mesh>
      </Float>

      <Html position={[0, -1.8, 0]} center transform style={{ transition: 'all 0.3s', opacity: hovered || isActive ? 1 : 0.7, transform: 'scale(' + (hovered || isActive ? 1.2 : 1) + ')' }}>
        <div className="flex flex-col items-center pointer-events-none">
          <h2 className="text-xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_10px_currentColor]" style={{ color: profile.color }}>
            {profile.name}
          </h2>
        </div>
      </Html>
    </group>
  );
}

export default function AvatarOrbit() {
  return (
    <div className="w-full h-[60vh] md:h-[70vh] cursor-crosshair">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#00e5ff" />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="night" />

        <group position={[0, 0.5, 0]}>
          {MOCK_PROFILES.map((profile, i) => {
            // Distribute them evenly in an arc
            const spacing = 3;
            const offset = (MOCK_PROFILES.length - 1) * spacing / 2;
            const x = (i * spacing) - offset;
            // Arc curve: middle is higher/forward
            const z = Math.abs(x) * 0.5;
            
            return (
              <ProfileSphere 
                key={profile.id} 
                profile={profile} 
                index={i}
                position={[x, 0, z]} 
              />
            );
          })}
        </group>

        {/* Adds a nice ground reflection pseudo-shadow */}
        <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={20} blur={2.5} far={4} color="#00e5ff" />
      </Canvas>
    </div>
  );
}
