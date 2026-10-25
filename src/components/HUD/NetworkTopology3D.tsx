import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, Play, ShieldAlert, Zap } from 'lucide-react';
import type { GameMission } from '../../game/gameData';

import { sound } from '../../utils/audioSynth';
import './NetworkTopology3D.css';

interface NetworkTopology3DProps {
  gameMissions: GameMission[];
  activeMissionId: string;
  completedMissionIds: Set<string>;
  onSelectMission: (mission: GameMission, deploy?: boolean) => void;
}

export const NetworkTopology3D: React.FC<NetworkTopology3DProps> = ({
  gameMissions,
  activeMissionId,
  completedMissionIds,
  onSelectMission,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GameMission>(
    () => gameMissions.find((m) => m.id === activeMissionId) ?? gameMissions[0]
  );
  const [hoveredMission, setHoveredMission] = useState<GameMission | null>(null);

  useEffect(() => {
    const target = gameMissions.find((m) => m.id === activeMissionId);
    if (target) setSelectedNode(target);
  }, [activeMissionId, gameMissions]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 700;
    const height = mount.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020711, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Create 3D Nodes in a double helix cyber constellation
    const nodeMeshes: THREE.Mesh[] = [];
    const radius = 4.8;

    gameMissions.forEach((mission, index) => {
      const angle = (index / gameMissions.length) * Math.PI * 4;
      const y = (index - gameMissions.length / 2) * 0.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const isCompleted = completedMissionIds.has(mission.id);
      const isActive = mission.id === activeMissionId;

      const geometry = new THREE.IcosahedronGeometry(isActive ? 0.42 : 0.28, 1);
      const material = new THREE.MeshBasicMaterial({
        color: isCompleted ? 0x18efad : isActive ? 0x20d6e9 : 0xb84bf5,
        wireframe: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = { mission, originalScale: mesh.scale.clone() };
      group.add(mesh);
      nodeMeshes.push(mesh);
    });

    // Connecting lines between nodes
    const points: THREE.Vector3[] = nodeMeshes.map((n) => n.position);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x20d6e9,
      transparent: true,
      opacity: 0.35,
    });
    const connectionLines = new THREE.Line(lineGeometry, lineMaterial);
    group.add(connectionLines);

    // Glowing Particle Data Packets flowing along connections
    const particleCount = 45;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const idx = i % points.length;
      particlePositions[i * 3] = points[idx].x;
      particlePositions[i * 3 + 1] = points[idx].y;
      particlePositions[i * 3 + 2] = points[idx].z;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x20d6e9,
      size: 0.18,
      transparent: true,
      opacity: 0.85,
    });
    const packetPoints = new THREE.Points(particleGeometry, particleMaterial);
    group.add(packetPoints);

    // Raycasting for mouse hover & click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        group.rotation.y += deltaX * 0.006;
        group.rotation.x += deltaY * 0.006;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const hitMission = hitMesh.userData.mission as GameMission;
        sound.playClick();
        setSelectedNode(hitMission);
        onSelectMission(hitMission, false);
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('click', onClick);

    // Animation Loop
    let animationId = 0;
    let t = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (!isDragging) {
        group.rotation.y += 0.0025;
      }

      t += 0.02;

      // Animate packet particles along node trajectory
      const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        const pointIdx = (i + Math.floor(t * 3)) % points.length;
        const nextIdx = (pointIdx + 1) % points.length;
        const alpha = (t * 2) % 1;
        const p1 = points[pointIdx];
        const p2 = points[nextIdx];
        posAttr.setXYZ(
          i,
          p1.x + (p2.x - p1.x) * alpha,
          p1.y + (p2.y - p1.y) * alpha,
          p1.z + (p2.z - p1.z) * alpha
        );
      }
      posAttr.needsUpdate = true;

      // Raycasting hover detection
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      nodeMeshes.forEach((mesh) => {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        mesh.scale.set(1, 1, 1);
      });

      if (intersects.length > 0) {
        const topMesh = intersects[0].object as THREE.Mesh;
        topMesh.scale.set(1.4, 1.4, 1.4);
        setHoveredMission(topMesh.userData.mission);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredMission(null);
        renderer.domElement.style.cursor = 'grab';
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('click', onClick);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [gameMissions, activeMissionId, completedMissionIds]);

  return (
    <div className="network-topology-3d">
      <div className="topology-viewport" ref={mountRef} />

      {hoveredMission && (
        <div className="topology-hover-tag">
          <b>{hoveredMission.id}</b> // {hoveredMission.title}
        </div>
      )}

      <aside className="topology-inspector glass-panel">
        <header className="inspector-head">
          <Compass size={16} className="phosphor-cyan" />
          <span>{selectedNode.id} // 3D CONSTELLATION NODE</span>
        </header>

        <div className="inspector-content">
          <h2>{selectedNode.title}</h2>
          <p className="topology-technique">{selectedNode.technique}</p>
          <hr className="inspector-rule" />

          <p className="topology-desc">{selectedNode.objective}</p>

          <div className="topology-metrics">
            <span>
              <ShieldAlert size={14} /> THREAT: <b>{selectedNode.threat}</b>
            </span>
            <span>
              <Zap size={14} /> REWARD: <b>+{selectedNode.rewardXP} XP</b>
            </span>
          </div>

          <div className="topology-status-pill">
            STATUS:{' '}
            <b className={completedMissionIds.has(selectedNode.id) ? 'verified' : selectedNode.id === activeMissionId ? 'active' : 'pending'}>
              {completedMissionIds.has(selectedNode.id)
                ? 'VERIFIED'
                : selectedNode.id === activeMissionId
                ? 'CURRENT TARGET'
                : 'AVAILABLE'}
            </b>
          </div>

          <button
            className="workspace-cta"
            onClick={() => onSelectMission(selectedNode, true)}
          >
            <Play size={14} style={{ display: 'inline', marginRight: '6px' }} />
            DEPLOY TO RANGE NOW →
          </button>
        </div>
      </aside>
    </div>
  );
};
