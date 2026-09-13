import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import './AureliaHologram3D.css';

export type AureliaExpression = 'neutral' | 'thinking' | 'speaking' | 'alert' | 'pleased';

interface AureliaHologram3DProps {
  expression: AureliaExpression;
  isSpeaking: boolean;
  onInteract: () => void;
}

type MorphMesh = THREE.Mesh & {
  morphTargetDictionary?: Record<string, number>;
  morphTargetInfluences?: number[];
};

const isMorphMesh = (object: THREE.Object3D): object is MorphMesh => {
  const mesh = object as MorphMesh;
  return Boolean(mesh.isMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences);
};

const normalizedMorphName = (name: string) => name.replace(/^.*\./, '').toLowerCase();

export const AureliaHologram3D: React.FC<AureliaHologram3DProps> = ({ expression, isSpeaking, onInteract }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const expressionRef = useRef(expression);
  const speakingRef = useRef(isSpeaking);
  const targetLookRef = useRef({ x: 0, y: 0 });
  const lookRef = useRef({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => { expressionRef.current = expression; }, [expression]);
  useEffect(() => { speakingRef.current = isSpeaking; }, [isSpeaking]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(29, 1, .01, 100);
    camera.position.set(0, .03, 4.1);
    scene.add(new THREE.HemisphereLight(0x67eaff, 0x461278, 2.6));
    const keyLight = new THREE.PointLight(0x18dfff, 18, 9);
    keyLight.position.set(-2, 2.4, 3.4);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xc042ff, 24, 9);
    rimLight.position.set(2.2, .4, 1.3);
    scene.add(rimLight);
    const presenceRig = new THREE.Group();
    scene.add(presenceRig);

    let model: THREE.Object3D | null = null;
    const morphMeshes: MorphMesh[] = [];
    const timer = new THREE.Timer();
    timer.connect(document);
    let animationFrame = 0;
    let disposed = false;

    const ktx2 = new KTX2Loader().setTranscoderPath('/assets/basis/').detectSupport(renderer);
    new GLTFLoader()
      .setKTX2Loader(ktx2)
      .setMeshoptDecoder(MeshoptDecoder)
      .load('/assets/models/facecap.glb', (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.y -= size.y * .01;
        const normalizedScale = 2.52 / Math.max(size.x, size.y);
        model.scale.set(normalizedScale * .91, normalizedScale, normalizedScale);

        const wireSources: MorphMesh[] = [];
        model.traverse((object) => {
          if (!(object as THREE.Mesh).isMesh) return;
          const mesh = object as MorphMesh;
          if (isMorphMesh(mesh)) morphMeshes.push(mesh);
          const original = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          const originalName = original?.name?.toLowerCase() ?? '';
          const isEye = /eye|cornea|pupil/.test(`${mesh.name} ${originalName}`.toLowerCase());
          const hologramMaterial = original?.clone() ?? new THREE.MeshStandardMaterial();
          hologramMaterial.transparent = true;
          hologramMaterial.opacity = isEye ? .82 : .72;
          hologramMaterial.depthWrite = true;
          hologramMaterial.blending = THREE.NormalBlending;
          if (hologramMaterial instanceof THREE.MeshStandardMaterial) {
            hologramMaterial.color.lerp(new THREE.Color(isEye ? 0x7deaff : 0x169ed0), isEye ? .16 : .48);
            hologramMaterial.emissive.set(isEye ? 0x062d42 : 0x031d3d);
            hologramMaterial.emissiveIntensity = isEye ? .35 : .7;
            hologramMaterial.roughness = .48;
            hologramMaterial.metalness = .12;
          }
          mesh.material = hologramMaterial;

          if (!isEye) wireSources.push(mesh);
        });

        wireSources.forEach((mesh) => {
          const wire = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({
              color: 0x47e8ff,
              wireframe: true,
              transparent: true,
              opacity: .075,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
          }));
          wire.morphTargetDictionary = mesh.morphTargetDictionary;
          wire.morphTargetInfluences = mesh.morphTargetInfluences;
          wire.userData.aureliaOverlay = true;
          mesh.add(wire);
        });
        const hoodMaterial = new THREE.MeshBasicMaterial({ color: 0x3156c8, wireframe: true, transparent: true, opacity: .20, blending: THREE.AdditiveBlending, depthWrite: false });
        const hood = new THREE.Mesh(new THREE.TorusGeometry(1.01, .10, 7, 56), hoodMaterial);
        hood.scale.y = 1.24;
        hood.position.set(0, .02, -.42);
        hood.rotation.z = -.02;
        const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(.42, 1.22, 1.18, 22, 2, true), hoodMaterial.clone());
        shoulders.position.set(0, -1.60, -.24);
        presenceRig.add(hood, shoulders, model);
        setReady(true);
      }, undefined, (error) => {
        console.error('Aurelia morph rig failed to load', error);
        setReady(false);
      });

    const setMorph = (mesh: MorphMesh, name: string, target: number, ease = .18) => {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      const entry = Object.entries(mesh.morphTargetDictionary).find(([key]) => normalizedMorphName(key) === name.toLowerCase());
      if (!entry) return;
      const index = entry[1];
      mesh.morphTargetInfluences[index] += (target - mesh.morphTargetInfluences[index]) * ease;
    };

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const render = () => {
      animationFrame = window.requestAnimationFrame(render);
      resize();
      timer.update();
      const time = timer.getElapsed();
      const mood = expressionRef.current;
      const speaking = speakingRef.current;
      lookRef.current.x += (targetLookRef.current.x - lookRef.current.x) * .06;
      lookRef.current.y += (targetLookRef.current.y - lookRef.current.y) * .06;
      const blink = Math.pow(Math.max(0, Math.sin(time * 1.64)), 42);
      const jaw = speaking ? .14 + Math.abs(Math.sin(time * 8.2) * .46 + Math.sin(time * 12.7) * .14) : .018;
      const smile = mood === 'pleased' ? .62 : speaking ? .09 : .015;
      const alert = mood === 'alert' ? .62 : 0;
      const thinking = mood === 'thinking' ? .46 : 0;
      const saccadeX = Math.sin(time * .83) * .055 + lookRef.current.x * .42;
      const saccadeY = Math.sin(time * .59) * .025 - lookRef.current.y * .30;

      morphMeshes.forEach((mesh) => {
        setMorph(mesh, 'eyeBlinkLeft', blink, .42);
        setMorph(mesh, 'eyeBlinkRight', blink * .96, .42);
        setMorph(mesh, 'jawOpen', jaw, .34);
        setMorph(mesh, 'mouthFunnel', speaking ? jaw * .18 : 0);
        setMorph(mesh, 'mouthSmileLeft', smile);
        setMorph(mesh, 'mouthSmileRight', smile * .94);
        setMorph(mesh, 'cheekSquintLeft', smile * .28);
        setMorph(mesh, 'cheekSquintRight', smile * .28);
        setMorph(mesh, 'browDownLeft', alert);
        setMorph(mesh, 'browDownRight', alert * .92);
        setMorph(mesh, 'eyeWideLeft', alert * .32);
        setMorph(mesh, 'eyeWideRight', alert * .32);
        setMorph(mesh, 'browOuterUpRight', thinking);
        setMorph(mesh, 'browInnerUp', thinking * .3);
        setMorph(mesh, 'mouthPucker', thinking * .16);
        setMorph(mesh, 'eyeLookInLeft', Math.max(0, saccadeX));
        setMorph(mesh, 'eyeLookOutRight', Math.max(0, saccadeX));
        setMorph(mesh, 'eyeLookOutLeft', Math.max(0, -saccadeX));
        setMorph(mesh, 'eyeLookInRight', Math.max(0, -saccadeX));
        setMorph(mesh, 'eyeLookUpLeft', Math.max(0, saccadeY));
        setMorph(mesh, 'eyeLookUpRight', Math.max(0, saccadeY));
        setMorph(mesh, 'eyeLookDownLeft', Math.max(0, -saccadeY));
        setMorph(mesh, 'eyeLookDownRight', Math.max(0, -saccadeY));
      });

      if (model) {
        presenceRig.rotation.y = lookRef.current.x * .17 + Math.sin(time * .28) * .026 + (thinking ? .10 : 0);
        presenceRig.rotation.x = lookRef.current.y * .07 + Math.sin(time * .37) * .008;
        presenceRig.rotation.z = Math.sin(time * .22) * .008;
        presenceRig.position.y += (Math.sin(time * .72) * .014 - presenceRig.position.y) * .028;
      }
      renderer.render(scene, camera);
    };
    render();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      timer.disconnect();
      ktx2.dispose();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => material?.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const trackPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    targetLookRef.current = {
      x: ((event.clientX - box.left) / box.width - .5) * 2,
      y: ((event.clientY - box.top) / box.height - .5) * 2,
    };
  };

  return (
    <button className={`aurelia-3d is-${expression} ${ready ? 'is-ready' : 'is-loading'}`} onPointerMove={trackPointer} onPointerLeave={() => { targetLookRef.current = { x: 0, y: 0 }; }} onClick={onInteract} aria-label={`Talk to Aurelia. Current expression: ${expression}`}>
      <div className="aurelia-3d-canvas" ref={mountRef} />
      <div className="aurelia-3d-particles" /><div className="aurelia-3d-scan" />
      <div className="aurelia-3d-status"><i /> AURELIA // {ready ? 'MORPH RIG LIVE' : 'INITIALIZING'} <span>{expression.toUpperCase()}</span></div>
      <div className="aurelia-3d-emitter"><i /><i /><i /></div>
    </button>
  );
};
