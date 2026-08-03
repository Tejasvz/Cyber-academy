import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { SciFiEnvironment3D } from './SciFiEnvironment3D';
import { CharacterHologram3D } from './CharacterHologram3D';

interface HologramCanvas3DProps {
  speaker?: 'aurelia' | 'hesper' | 'kaelen' | 'byte' | 'operator' | 'valkyrie' | 'cyra' | 'lyra' | 'solene' | 'vance';
  expression?: string;
  isTyping?: boolean;
}

export const HologramCanvas3D: React.FC<HologramCanvas3DProps> = ({
  speaker = 'aurelia',
  expression = 'neutral',
  isTyping = false,
}) => {
  const themeColor = useMemo(() => {
    switch (speaker) {
      case 'hesper':
        return '#ffb000';
      case 'kaelen':
        return '#d946ef';
      case 'byte':
        return '#ef4444';
      case 'valkyrie':
        return '#ff0033';
      case 'cyra':
        return '#e0115f';
      case 'lyra':
        return '#00ff88';
      case 'solene':
        return '#ffb700';
      case 'vance':
        return '#0066ff';
      case 'aurelia':
      default:
        return '#00f0ff';
    }
  }, [speaker]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#040509]">
      <Canvas
        camera={{ position: [0, 0.2, 5.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 3D Sci-Fi Environment Room */}
        <SciFiEnvironment3D themeColor={themeColor} />

        {/* Central 3D Holographic Character Companion */}
        <CharacterHologram3D 
          speaker={speaker} 
          expression={expression} 
          isTyping={isTyping} 
        />
      </Canvas>
    </div>
  );
};

export default HologramCanvas3D;
