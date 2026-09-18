import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, ShieldAlert, Zap } from 'lucide-react';
import type { GameMission } from '../../game/gameData';
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
  const [selectedNode] = useState<GameMission>(
    () => gameMissions.find(m => m.id === activeMissionId) ?? gameMissions[0]
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020711, 0.04);

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Create 3D Nodes in a helix network graph
    const nodes: THREE.Mesh[] = [];
    const radius = 4.5;
    
    gameMissions.forEach((mission, index) => {
      const angle = (index / gameMissions.length) * Math.PI * 4;
      const y = (index - gameMissions.length / 2) * 0.45;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const isCompleted = completedMissionIds.has(mission.id);
      const isActive = mission.id === activeMissionId;

      const geometry = new THREE.IcosahedronGeometry(isActive ? 0.35 : 0.25, 1);
      const material = new THREE.MeshBasicMaterial({
        color: isCompleted ? 0x34d399 : isActive ? 0x40c9dc : 0x9875d4,
        wireframe: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = { mission };
      group.add(mesh);
      nodes.push(mesh);
    });

    // Draw connecting lines between network nodes
    const points: THREE.Vector3[] = nodes.map(n => n.position);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x40c9dc,
      transparent: true,
      opacity: 0.35,
    });
    const connectionLines = new THREE.Line(lineGeometry, lineMaterial);
    group.add(connectionLines);

    // Animation Loop
    let animationId = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      group.rotation.y += 0.003;
      nodes.forEach(n => {
        n.rotation.x += 0.01;
        n.rotation.y += 0.01;
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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
      <aside className="topology-inspector glass-panel">
        <span className="workspace-kicker">{selectedNode.id} // NODE TOPOLOGY</span>
        <h2>{selectedNode.title}</h2>
        <p>{selectedNode.objective}</p>
        <div className="topology-metrics">
          <span><ShieldAlert size={14} /> THREAT: <b>{selectedNode.threat}</b></span>
          <span><Zap size={14} /> REWARD: <b>+{selectedNode.rewardXP} XP</b></span>
        </div>
        <button
          className="workspace-cta"
          onClick={() => onSelectMission(selectedNode, true)}
        >
          <Play size={14} /> DEPLOY TO RANGE NOW →
        </button>
      </aside>
    </div>
  );
};
