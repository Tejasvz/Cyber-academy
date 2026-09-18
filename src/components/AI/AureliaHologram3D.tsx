import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import './AureliaHologram3D.css';
import { createAureliaProjection, createFacetedFaceGeometry, normalizedMorphName } from './aureliaGeometry';
import { usePreferences } from '../../store/preferencesStore';

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

function disposeScene(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse(object => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh && !(object as THREE.Line).isLine) return;
    if (mesh.geometry) geometries.add(mesh.geometry);
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      if (!material) continue;
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());
  textures.forEach(texture => texture.dispose());
}

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
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(29, 1, .01, 100);
    camera.position.set(0, -.10, 6.7);
    camera.lookAt(0, -.10, 0);
    scene.add(new THREE.HemisphereLight(0x67caff, 0x060717, 1.8));
    const keyLight = new THREE.PointLight(0x91eaff, 45, 12);
    keyLight.position.set(2, 2.4, 3.4);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x952bff, 32, 12);
    rimLight.position.set(-2.2, .8, 1.1);
    scene.add(rimLight);
    const presenceRig = new THREE.Group();
    scene.add(presenceRig);
    const projection = createAureliaProjection();
    scene.add(projection);

    let model: THREE.Object3D | null = null;
    const eyePivots: THREE.Object3D[] = [];
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
        if (disposed) { disposeScene(gltf.scene); return; }
        model = gltf.scene;
        for (const name of ['grp_eyeLeft', 'grp_eyeRight']) {
          const eye = model.getObjectByName(name);
          if (eye) { eye.rotation.set(0, 0, 0); eyePivots.push(eye); }
        }
        model.traverse(object => { if (isMorphMesh(object)) object.morphTargetInfluences?.fill(0); });
        // Precise neutral bounds avoid including the extreme poses of all 52
        // morphs in the framing (which previously made the face look tiny).
        const bounds = new THREE.Box3().setFromObject(model, true);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const normalizedScale = 2.55 / size.y;
        model.scale.set(normalizedScale * .92, normalizedScale, normalizedScale * .9);
        model.position.set(-center.x * normalizedScale * .92, -center.y * normalizedScale + .17, -center.z * normalizedScale * .9);
        model.updateMatrixWorld(true);

        model.traverse((object) => {
          if (!(object as THREE.Mesh).isMesh) return;
          const mesh = object as MorphMesh;
          if (isMorphMesh(mesh)) {
            mesh.morphTargetInfluences?.fill(0);
            morphMeshes.push(mesh);
          }
          const original = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          const originalName = original?.name?.toLowerCase() ?? '';
          const isEye = /eye|cornea|pupil/.test(`${mesh.name} ${mesh.parent?.name} ${originalName}`.toLowerCase());
          const isSkin = isMorphMesh(mesh);
          const hologramMaterial = original?.clone() ?? new THREE.MeshStandardMaterial();
          hologramMaterial.transparent = true;
          hologramMaterial.opacity = 1;
          hologramMaterial.depthWrite = true;
          hologramMaterial.blending = THREE.NormalBlending;
          if (hologramMaterial instanceof THREE.MeshStandardMaterial) {
            hologramMaterial.color.lerp(new THREE.Color(isEye ? 0x7deaff : 0x258cb6), isEye ? .16 : .7);
            if (isEye) hologramMaterial.color.set(0x285779);
            if (isSkin) {
              const source = mesh.geometry;
              mesh.geometry = createFacetedFaceGeometry(source, mesh.matrixWorld);
              source.dispose();
              hologramMaterial.normalMap = null;
              hologramMaterial.flatShading = true;
              hologramMaterial.vertexColors = true;
              hologramMaterial.color.set(0xffffff);
              // Retain anatomical texture detail, without the scanned skin hue.
              hologramMaterial.onBeforeCompile = shader => {
                shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>',
                  THREE.ShaderChunk.map_fragment.replace('diffuseColor *= sampledDiffuseColor;',
                    'sampledDiffuseColor.rgb = vec3(dot(sampledDiffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722))); diffuseColor *= sampledDiffuseColor;'));
              };
              hologramMaterial.customProgramCacheKey = () => 'aurelia-faceted-skin-v1';
            }
            hologramMaterial.emissive.set(isEye ? 0x062d42 : 0x031d3d);
            hologramMaterial.emissiveIntensity = isEye ? .15 : .2;
            hologramMaterial.roughness = isEye ? .76 : .48;
            hologramMaterial.metalness = isEye ? 0 : .12;
          }
          mesh.material = hologramMaterial;
        });
        presenceRig.add(model);
        setReady(true);
      }, undefined, (error) => {
        if (disposed) return;
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

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let nextBlink = 2.2;
    let blinkStarted = -10;
    const render = () => {
      animationFrame = window.requestAnimationFrame(render);
      timer.update();
      const time = timer.getElapsed();
      const reducedMotion = motionPreference.matches || usePreferences.getState().reducedMotion;
      const mood = expressionRef.current;
      const speaking = speakingRef.current;
      lookRef.current.x += (targetLookRef.current.x - lookRef.current.x) * .06;
      lookRef.current.y += (targetLookRef.current.y - lookRef.current.y) * .06;
      if (time > nextBlink) { blinkStarted = time; nextBlink = time + 2.6 + Math.random() * 3.4; }
      const blinkPhase = (time - blinkStarted) / .19;
      const blink = blinkPhase < 1 ? Math.sin(Math.PI * blinkPhase) : 0;
      const jaw = speaking ? .14 + Math.abs(Math.sin(time * 8.2) * .46 + Math.sin(time * 12.7) * .14) : .018;
      const smile = mood === 'pleased' ? .62 : speaking ? .09 : .035;
      const alert = mood === 'alert' ? .62 : 0;
      const thinking = mood === 'thinking' ? .46 : 0;
      const saccadeX = Math.sin(time * .83) * .055 + lookRef.current.x * .42;
      const saccadeY = Math.sin(time * .59) * .025 - lookRef.current.y * .30;
      // Eyelid morphs alone cannot move the separate eyeballs. These pivots
      // use the asset's native Z-up frame, before its parent conversion.
      eyePivots.forEach(eye => {
        eye.rotation.x = saccadeY * .35;
        eye.rotation.z = -saccadeX * .45;
      });

      morphMeshes.forEach((mesh) => {
        setMorph(mesh, 'eyeBlinkLeft', .24 + blink * .76, .42);
        setMorph(mesh, 'eyeBlinkRight', .24 + blink * .76, .42);
        setMorph(mesh, 'jawOpen', jaw, .34);
        setMorph(mesh, 'mouthFunnel', speaking ? jaw * .18 : 0);
        setMorph(mesh, 'mouthSmileLeft', smile);
        setMorph(mesh, 'mouthSmileRight', smile * .94);
        setMorph(mesh, 'cheekSquintLeft', smile * .28);
        setMorph(mesh, 'cheekSquintRight', smile * .28);
        setMorph(mesh, 'browDownLeft', alert);
        setMorph(mesh, 'browDownRight', alert * .92);
        setMorph(mesh, 'eyeWideLeft', alert * .16);
        setMorph(mesh, 'eyeWideRight', alert * .16);
        setMorph(mesh, 'eyeSquintLeft', .28 + smile * .12);
        setMorph(mesh, 'eyeSquintRight', .28 + smile * .12);
        setMorph(mesh, 'browOuterUpRight', thinking);
        setMorph(mesh, 'browInnerUp', thinking * .3);
        setMorph(mesh, 'mouthPucker', thinking * .16);
        setMorph(mesh, 'eyeLookInLeft', Math.max(0, saccadeX));
        setMorph(mesh, 'eyeLookOutRight', Math.max(0, saccadeX));
        setMorph(mesh, 'eyeLookOutLeft', Math.max(0, -saccadeX));
        setMorph(mesh, 'eyeLookInRight', Math.max(0, -saccadeX));
        setMorph(mesh, 'eyeLookUpLeft', Math.max(0, saccadeY));
        setMorph(mesh, 'eyeLookUpRight', Math.max(0, saccadeY));
        setMorph(mesh, 'eyeLookDownLeft', .2 + Math.max(0, -saccadeY));
        setMorph(mesh, 'eyeLookDownRight', .2 + Math.max(0, -saccadeY));
      });

      if (model) {
        presenceRig.rotation.y = -.13 + lookRef.current.x * .24 + (reducedMotion ? 0 : Math.sin(time * .28) * .026) + (thinking ? .10 : 0);
        presenceRig.rotation.x = -.035 + lookRef.current.y * .07;
        presenceRig.rotation.z = reducedMotion ? 0 : Math.sin(time * .22) * .008;
        presenceRig.position.y = reducedMotion ? 0 : Math.sin(time * .72) * .014;
        const fragments = projection.getObjectByName('signal-fragments');
        if (fragments && !reducedMotion) {
          fragments.rotation.y = Math.sin(time * .15) * .10;
          fragments.children.forEach((shard, i) => { shard.rotation.y = i * 2.39996 + time * .12; });
        }
      }
      renderer.render(scene, camera);
    };
    render();

    return () => {
      disposed = true;
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
      timer.disconnect();
      ktx2.dispose();
      disposeScene(scene);
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
    <button className={`aurelia-3d is-${expression} ${isSpeaking ? 'is-speaking' : ''} ${ready ? 'is-ready' : 'is-loading'}`} onPointerMove={trackPointer} onPointerLeave={() => { targetLookRef.current = { x: 0, y: 0 }; }} onClick={onInteract} aria-label={`Talk to Aurelia. Current expression: ${expression}`}>
      <div className="aurelia-3d-canvas" ref={mountRef} />
      <div className="aurelia-pulse-ring ring-1" />
      <div className="aurelia-pulse-ring ring-2" />
      <div className="aurelia-pulse-ring ring-3" />
      <div className="aurelia-3d-particles" /><div className="aurelia-3d-scan" />
      <div className="aurelia-3d-status"><i /> AURELIA // {ready ? (isSpeaking ? 'TRANSMITTING' : 'NEURAL LINK ACTIVE') : 'INITIALIZING'} <span>{expression.toUpperCase()}</span></div>
    </button>
  );
};

