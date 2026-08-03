import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface SciFiEnvironment3DProps {
  themeColor?: string;
}

export const SciFiEnvironment3D: React.FC<SciFiEnvironment3DProps> = ({ themeColor = '#00f0ff' }) => {
  const outerRingRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);
  const lightsGroupRef = useRef<THREE.Group>(null);

  // Smooth continuous rotation of 3D tech rings and subtle light pulsing
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.y += delta * 0.2;
      outerRingRef.current.rotation.z = Math.sin(time * 0.4) * 0.08;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.y -= delta * 0.35;
      innerRingRef.current.rotation.x = Math.cos(time * 0.5) * 0.06;
    }

    if (lightsGroupRef.current) {
      lightsGroupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Ambient & Directional Lighting setup */}
      <ambientLight intensity={0.25} />
      
      {/* Key central projector light source */}
      <pointLight 
        position={[0, -1.8, 0]} 
        intensity={4.5} 
        distance={12} 
        color={themeColor} 
        decay={2} 
      />

      {/* Top rim accent spotlight */}
      <spotLight
        position={[0, 8, -4]}
        target-position={[0, 0, 0]}
        intensity={2.5}
        angle={0.6}
        penumbra={0.8}
        color={themeColor}
      />

      {/* Rotating Accent Point Lights */}
      <group ref={lightsGroupRef}>
        <pointLight position={[4, 2, -3]} intensity={1.5} color="#d946ef" distance={10} />
        <pointLight position={[-4, -1, -3]} intensity={1.5} color={themeColor} distance={10} />
      </group>

      {/* 3D Grid Floor */}
      <gridHelper 
        args={[30, 40, themeColor, '#0a1d37']} 
        position={[0, -2.5, 0]} 
      />

      {/* Floor Glow Plane */}
      <mesh position={[0, -2.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial 
          color="#040814" 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Outer Rotating Concentric Tech Ring */}
      <group ref={outerRingRef} position={[0, -2.2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.2, 0.02, 16, 64]} />
          <meshBasicMaterial color={themeColor} wireframe transparent opacity={0.45} />
        </mesh>
        
        {/* Index ticks on ring */}
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh key={i} position={[Math.cos(rad) * 3.2, 0, Math.sin(rad) * 3.2]}>
              <boxGeometry args={[0.15, 0.08, 0.15]} />
              <meshBasicMaterial color={themeColor} />
            </mesh>
          );
        })}
      </group>

      {/* Inner Fast Rotating Tech Ring */}
      <group ref={innerRingRef} position={[0, -2.1, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.015, 16, 48]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Rear Server Rack Pillars */}
      {[-6, -3, 3, 6].map((x, idx) => (
        <group key={idx} position={[x, 0, -8]}>
          <mesh>
            <boxGeometry args={[1.2, 10, 1.2]} />
            <meshStandardMaterial color="#080c16" roughness={0.7} metalness={0.8} />
          </mesh>

          {/* LED Strip indicators */}
          {[-3, -1, 1, 3].map((y, i) => (
            <mesh key={i} position={[0, y, 0.61]}>
              <planeGeometry args={[0.8, 0.08]} />
              <meshBasicMaterial color={i % 2 === 0 ? themeColor : '#ffb000'} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Floating 3D Sparkle Particle Dust */}
      <Sparkles 
        count={100} 
        scale={10} 
        size={2.5} 
        speed={0.4} 
        opacity={0.65} 
        color={themeColor} 
        position={[0, 0, -2]} 
      />
    </group>
  );
};

export default SciFiEnvironment3D;
