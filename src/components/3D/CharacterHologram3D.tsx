import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterHologram3DProps {
  speaker?: 'aurelia' | 'hesper' | 'kaelen' | 'byte' | 'operator' | 'valkyrie' | 'cyra' | 'lyra' | 'solene' | 'vance';
  expression?: string;
  isTyping?: boolean;
}

// GLSL Custom Hologram Shader Definition
const HologramShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00f0ff') },
    uGlitch: { value: 0.0 },
    uFresnelPower: { value: 2.2 },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uGlitch;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;

    // Pseudo-random noise function for glitch displacements
    float rand(vec2 co) {
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec3 pos = position;

      if (uGlitch > 0.01) {
        float noise = rand(vec2(pos.y, uTime));
        if (noise > 0.6) {
          pos.x += (rand(vec2(uTime, pos.x)) - 0.5) * 0.25 * uGlitch;
          pos.z += (rand(vec2(pos.z, uTime)) - 0.5) * 0.25 * uGlitch;
        }
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vPosition = pos;
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uGlitch;
    uniform float uFresnelPower;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel Rim Light calculation
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);

      // Dual-tone color blend matching reference: Front cyan (#00f0ff), Rim magenta (#d946ef)
      vec3 rimColor = vec3(0.85, 0.27, 0.94);
      vec3 baseColor = mix(uColor, rimColor, fresnel * 0.75);

      // Scanline effect moving along Y axis
      float scanline = sin(vPosition.y * 36.0 - uTime * 6.0) * 0.5 + 0.5;
      scanline = pow(scanline, 1.2);

      // Combine base color with scanlines and fresnel edge brightness
      vec3 finalColor = baseColor + vec3(fresnel * 0.6);
      float alpha = (fresnel * 0.85 + scanline * 0.25 + 0.22);

      if (uGlitch > 0.1) {
        alpha *= (0.7 + sin(uTime * 30.0) * 0.3);
      }

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

export const CharacterHologram3D: React.FC<CharacterHologram3DProps> = ({
  speaker = 'aurelia',
  expression = 'neutral',
  isTyping = false,
}) => {
  const headGroupRef = useRef<THREE.Group>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const coneMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const [blink, setBlink] = useState(false);

  // Dynamic color configuration based on character speaker identity
  const themeColor = useMemo(() => {
    switch (speaker) {
      case 'hesper':
        return '#ffb000'; // Amber (Aether Commander)
      case 'kaelen':
        return '#d946ef'; // Magenta (Void Intercept)
      case 'byte':
        return '#ef4444'; // Red (Core Gateway Sentinel)
      case 'valkyrie':
        return '#ff0033'; // Crimson Red (Female Villain - Syndicate High Infiltrator)
      case 'cyra':
        return '#e0115f'; // Neon Violet (Female Villain - Rogue AI Strategist)
      case 'lyra':
        return '#00ff88'; // Emerald Green (Female Ally - Intelligence Analyst)
      case 'solene':
        return '#ffb700'; // Warm Gold (Female Ally - Resistance Liaison)
      case 'vance':
        return '#0066ff'; // Steel Cobalt (Male Ally - Field Security Lead)
      case 'aurelia':
      default:
        return '#00f0ff'; // Cyan (Tactical Daemon)
    }
  }, [speaker]);

  // Periodic Blink Timer
  useEffect(() => {
    const triggerBlink = () => {
      if (expression === 'panic') return;
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
      const nextDelay = 3000 + Math.random() * 4000;
      blinkTimeout = setTimeout(triggerBlink, nextDelay);
    };

    let blinkTimeout = setTimeout(triggerBlink, 3500);
    return () => clearTimeout(blinkTimeout);
  }, [expression]);

  // Build Low-Poly Head Geometry with morphable vertex coordinates
  const headGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();

    // 3D low poly vertex positions [x, y, z]
    const baseVertices = new Float32Array([
      // Forehead & Temple
      0.0, 1.2, 0.2,   // 0: forehead center
      -0.6, 1.0, 0.0,  // 1: forehead left
      0.6, 1.0, 0.0,   // 2: forehead right
      -0.9, 0.6, -0.4, // 3: temple left
      0.9, 0.6, -0.4,  // 4: temple right

      // Eyes & Brow
      -0.45, 0.5, 0.45, // 5: eye left
      0.45, 0.5, 0.45,  // 6: eye right
      -0.45, 0.75, 0.35, // 7: eyebrow left
      0.45, 0.75, 0.35,  // 8: eyebrow right

      // Nose bridge & Tip
      0.0, 0.55, 0.6,   // 9: nose bridge
      0.0, 0.05, 0.85,  // 10: nose tip
      -0.25, 0.0, 0.65, // 11: nose left
      0.25, 0.0, 0.65,  // 12: nose right

      // Cheeks
      -0.95, -0.05, 0.0, // 13: cheek outer left
      0.95, -0.05, 0.0,  // 14: cheek outer right
      -0.45, -0.1, 0.55, // 15: cheek inner left
      0.45, -0.1, 0.55,  // 16: cheek inner right

      // Mouth & Lips
      0.0, -0.4, 0.75,   // 17: mouth center
      -0.3, -0.42, 0.6,  // 18: mouth left
      0.3, -0.42, 0.6,   // 19: mouth right

      // Chin & Jaw
      0.0, -0.65, 0.65,  // 20: chin upper
      0.0, -1.05, 0.45,  // 21: chin tip
      -0.65, -0.8, -0.1, // 22: jaw left
      0.65, -0.8, -0.1,  // 23: jaw right
    ]);

    // Face indices mapping triangles
    const indices = [
      // Forehead
      0, 1, 7,  0, 7, 9,  0, 9, 8,  0, 8, 2,
      1, 3, 13, 1, 13, 7, 2, 8, 14, 2, 14, 4,

      // Eyes & Brow
      7, 5, 9,  8, 9, 6,
      5, 13, 15, 6, 16, 14,
      5, 15, 10, 5, 10, 9,
      6, 9, 10, 6, 10, 16,

      // Nose
      9, 11, 10, 9, 10, 12,
      15, 13, 22, 15, 22, 11,
      16, 12, 23, 16, 23, 14,

      // Mouth
      10, 18, 17, 10, 17, 19,
      18, 15, 22, 19, 23, 16,

      // Chin & Jaw
      17, 18, 22, 17, 22, 20,
      17, 20, 23, 17, 23, 19,
      20, 22, 21, 20, 21, 23,
    ];

    geom.setAttribute('position', new THREE.BufferAttribute(baseVertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return geom;
  }, []);

  // Cloned geometry instance for runtime morphing
  const dynamicGeometry = useMemo(() => headGeometry.clone(), [headGeometry]);

  // Animate Shader uniforms, morph targets, head tracking & float oscillations
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Update Shader uniforms
    if (shaderMaterialRef.current) {
      shaderMaterialRef.current.uniforms.uTime.value = time;
      shaderMaterialRef.current.uniforms.uColor.value.set(themeColor);
      shaderMaterialRef.current.uniforms.uGlitch.value = 
        expression === 'glitch' ? 0.75 : (Math.random() < 0.03 ? 0.4 : 0.0);
    }

    // Update Projector cone color
    if (coneMaterialRef.current) {
      coneMaterialRef.current.color.set(themeColor);
    }

    // 3D Head Tracking: Follow pointer coordinates smoothly
    if (headGroupRef.current) {
      const targetRotY = state.pointer.x * 0.45;
      const targetRotX = -state.pointer.y * 0.3;
      
      headGroupRef.current.rotation.y = THREE.MathUtils.lerp(headGroupRef.current.rotation.y, targetRotY, delta * 4.5);
      headGroupRef.current.rotation.x = THREE.MathUtils.lerp(headGroupRef.current.rotation.x, targetRotX, delta * 4.5);

      // Subtle float oscillation
      headGroupRef.current.position.y = Math.sin(time * 1.6) * 0.08;
    }

    // Dynamic Morph Target Updates (Blink, Talk, Expressions)
    const posAttr = dynamicGeometry.attributes.position as THREE.BufferAttribute;
    const basePos = headGeometry.attributes.position.array as Float32Array;
    const currentPos = posAttr.array as Float32Array;

    const isTalking = isTyping || expression === 'talking';
    const talkOffset = isTalking ? Math.sin(time * 14) * 0.08 : 0;

    for (let i = 0; i < basePos.length / 3; i++) {
      let dx = 0;
      let dy = 0;
      let dz = 0;

      // Mouth & Jaw indices (17: mouthCenter, 20: chinUpper, 21: chinTip)
      if (i === 17 || i === 20 || i === 21) {
        dy += talkOffset;
      }

      // Blink indices (5: eyeL, 6: eyeR)
      if (blink && (i === 5 || i === 6)) {
        dy -= 0.12;
      }

      // Smile morph (18: mouthL, 19: mouthR)
      if (expression === 'smile' && (i === 18 || i === 19)) {
        dy += 0.12;
        dz += 0.04;
      }

      // Angry eyebrow morph (7: eyebrowL, 8: eyebrowR)
      if (expression === 'angry' && (i === 7 || i === 8)) {
        dy -= 0.1;
      }

      // Panic jaw drop morph (20, 21)
      if (expression === 'panic' && (i === 20 || i === 21 || i === 17)) {
        dy -= 0.25;
      }

      currentPos[i * 3] = basePos[i * 3] + dx;
      currentPos[i * 3 + 1] = basePos[i * 3 + 1] + dy;
      currentPos[i * 3 + 2] = basePos[i * 3 + 2] + dz;
    }

    posAttr.needsUpdate = true;
    dynamicGeometry.computeVertexNormals();
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Floating Holographic Head Group */}
      <group ref={headGroupRef} position={[0, 0, 0]}>
        {/* Low-Poly Solid Hologram Mesh */}
        <mesh geometry={dynamicGeometry}>
          <shaderMaterial
            ref={shaderMaterialRef}
            args={[HologramShader]}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Wireframe Outline Overlay */}
        <mesh geometry={dynamicGeometry}>
          <meshBasicMaterial 
            color={themeColor} 
            wireframe 
            transparent 
            opacity={0.3} 
          />
        </mesh>

        {/* Commander Hesper Tactical Visor Bar */}
        {speaker === 'hesper' && (
          <mesh position={[0, 0.5, 0.4]}>
            <boxGeometry args={[1.3, 0.18, 0.2]} />
            <meshBasicMaterial color={themeColor} transparent opacity={0.8} />
          </mesh>
        )}

        {/* Valkyrie: Syndicate High Infiltrator Crimson Crown Visor (Female Villain) */}
        {speaker === 'valkyrie' && (
          <group position={[0, 0.85, 0.35]}>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.5, 0.5, 0.15]} />
              <meshBasicMaterial color="#ff0033" transparent opacity={0.9} />
            </mesh>
            <mesh position={[-0.6, 0.2, -0.1]} rotation={[0, 0, -0.4]}>
              <coneGeometry args={[0.08, 0.6, 4]} />
              <meshBasicMaterial color="#ff0033" />
            </mesh>
            <mesh position={[0.6, 0.2, -0.1]} rotation={[0, 0, 0.4]}>
              <coneGeometry args={[0.08, 0.6, 4]} />
              <meshBasicMaterial color="#ff0033" />
            </mesh>
          </group>
        )}

        {/* Cyra: Rogue AI Strategist Dual Optic Ring (Female Villain) */}
        {speaker === 'cyra' && (
          <group position={[0, 0.5, 0.45]}>
            <mesh position={[-0.45, 0, 0]}>
              <torusGeometry args={[0.18, 0.03, 16, 32]} />
              <meshBasicMaterial color="#e0115f" />
            </mesh>
            <mesh position={[0.45, 0, 0]}>
              <torusGeometry args={[0.18, 0.03, 16, 32]} />
              <meshBasicMaterial color="#e0115f" />
            </mesh>
          </group>
        )}

        {/* Lyra: Intelligence Analyst Comms Antenna Headset (Female Ally) */}
        {speaker === 'lyra' && (
          <group position={[0, 0.4, 0]}>
            <mesh position={[-0.95, 0, -0.1]}>
              <cylinderGeometry args={[0.12, 0.12, 0.4, 16]} />
              <meshBasicMaterial color="#00ff88" />
            </mesh>
            <mesh position={[-1.0, 0.3, -0.1]}>
              <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.95, 0, -0.1]}>
              <cylinderGeometry args={[0.12, 0.12, 0.4, 16]} />
              <meshBasicMaterial color="#00ff88" />
            </mesh>
          </group>
        )}

        {/* Solene: Resistance Liaison Halo Lattice Ring (Female Ally) */}
        {speaker === 'solene' && (
          <group position={[0, 1.25, 0]} rotation={[Math.PI / 6, 0, 0]}>
            <mesh>
              <torusGeometry args={[0.9, 0.025, 16, 48]} />
              <meshBasicMaterial color="#ffb700" transparent opacity={0.75} />
            </mesh>
          </group>
        )}

        {/* Vance: Field Security Lead Heavy Jaw & Tactical Brow (Male Ally) */}
        {speaker === 'vance' && (
          <group position={[0, 0, 0]}>
            <mesh position={[0, 0.55, 0.42]}>
              <boxGeometry args={[1.4, 0.14, 0.18]} />
              <meshBasicMaterial color="#0066ff" transparent opacity={0.85} />
            </mesh>
            <mesh position={[0, -0.7, 0.4]}>
              <boxGeometry args={[1.1, 0.22, 0.25]} />
              <meshStandardMaterial color="#0a192f" roughness={0.4} metalness={0.8} />
            </mesh>
          </group>
        )}
      </group>

      {/* 3D Emitter Base Ring Component */}
      <group position={[0, -2.1, 0]}>
        <mesh>
          <cylinderGeometry args={[1.4, 1.6, 0.15, 32]} />
          <meshStandardMaterial color="#0b1329" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Inner Projector Lens */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[1.1, 1.1, 0.02, 32]} />
          <meshBasicMaterial color={themeColor} />
        </mesh>

        {/* Volumetric Gradient Light Beam Cone */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.9, 1.3, 2.4, 32, 1, true]} />
          <meshBasicMaterial
            ref={coneMaterialRef}
            color={themeColor}
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
};

export default CharacterHologram3D;
