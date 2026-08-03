import React, { useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { SciFiEnvironment3D } from './SciFiEnvironment3D';
import { CharacterHologram3D } from './CharacterHologram3D';
import { useDialogueStore } from '../../store/dialogueStore';
import { useCinematicStore } from '../../store/cinematicStore';
import * as THREE from 'three';

interface HologramCanvas3DProps {
  speaker?: 'aurelia' | 'hesper' | 'kaelen' | 'byte' | 'operator' | 'valkyrie' | 'cyra' | 'lyra' | 'solene' | 'vance';
  expression?: string;
  isTyping?: boolean;
}

// 3D Camera Dolly Controller for Cinematic Sequences
const CameraController: React.FC = () => {
  const { camera } = useThree();
  const isSequencePlaying = useDialogueStore((s) => s.isSequencePlaying);
  const cameraFocus = useCinematicStore((s) => s.cameraFocus);

  useFrame((_, delta) => {
    const isFocused = isSequencePlaying || cameraFocus === 'hologram_close';

    const targetZ = isFocused ? 4.1 : 5.2;
    const targetY = isFocused ? 0.1 : 0.2;
    const targetFov = isFocused ? 38 : 45;

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 3.5);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 3.5);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 3.5);
      camera.updateProjectionMatrix();
    }
  });

  return null;
};

export const HologramCanvas3D: React.FC<HologramCanvas3DProps> = ({
  speaker = 'aurelia',
  expression = 'neutral',
  isTyping = false,
}) => {
  const cinematicLightingColor = useCinematicStore((s) => s.lightingColor);

  const themeColor = useMemo(() => {
    if (cinematicLightingColor && cinematicLightingColor !== '#00f0ff') {
      return cinematicLightingColor;
    }

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
  }, [speaker, cinematicLightingColor]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#040509]">
      <Canvas
        camera={{ position: [0, 0.2, 5.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <CameraController />

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
