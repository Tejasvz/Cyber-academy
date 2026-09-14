import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { createFacetedFaceGeometry, createAureliaProjection, normalizedMorphName } from './aureliaGeometry.ts';

// Load the actual quantized model in Node. Remove only textures from an in-memory
// copy; production GLB, geometry, transforms and morph data remain untouched.
async function loadRig() {
  const bytes = await readFile(new URL('../../../public/assets/models/facecap.glb', import.meta.url));
  const jsonLength = bytes.readUInt32LE(12);
  const json = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
  json.materials = json.materials.map(() => ({}));
  json.images = [];
  json.textures = [];
  for (const key of ['extensionsUsed', 'extensionsRequired']) {
    json[key] = json[key]?.filter(name => name !== 'KHR_texture_basisu');
  }
  const text = JSON.stringify(json);
  const padded = Buffer.from(text.padEnd(Math.ceil(Buffer.byteLength(text) / 4) * 4, ' '));
  const binary = bytes.subarray(20 + jsonLength);
  const output = Buffer.alloc(20 + padded.length + binary.length);
  bytes.copy(output, 0, 0, 12);
  output.writeUInt32LE(output.length, 8);
  output.writeUInt32LE(padded.length, 12);
  output.writeUInt32LE(0x4e4f534a, 16);
  padded.copy(output, 20);
  binary.copy(output, 20 + padded.length);
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(output.buffer, '');
}

test('faceting keeps the actual rig finite, correctly scaled, and expressive', async () => {
  const gltf = await loadRig();
  gltf.scene.updateMatrixWorld(true);
  let checked = 0;
  gltf.scene.traverse(mesh => {
    if (!mesh.morphTargetDictionary) return;
    const source = mesh.geometry;
    const result = createFacetedFaceGeometry(source, mesh.matrixWorld);
    assert.equal(result.morphTargetsRelative, source.morphTargetsRelative);
    assert.equal(result.morphAttributes.position.length, source.morphAttributes.position.length);
    assert.ok(result.getAttribute('position').count < source.index.count);
    source.computeBoundingBox();
    result.computeBoundingBox();
    assert.ok(result.boundingBox.getSize(new THREE.Vector3()).distanceTo(source.boundingBox.getSize(new THREE.Vector3())) < source.boundingBox.getSize(new THREE.Vector3()).length() * .08);
    for (const attribute of [result.getAttribute('position'), ...result.morphAttributes.position]) {
      assert.equal(attribute.count, result.getAttribute('position').count);
      assert.ok(Array.from(attribute.array).every(Number.isFinite));
    }
    mesh.geometry = result;
    const names = Object.keys(mesh.morphTargetDictionary);
    for (const name of ['eyeBlinkLeft', 'jawOpen', 'mouthSmileLeft', 'browDownLeft']) {
      const key = names.find(key => normalizedMorphName(key) === name.toLowerCase());
      assert.ok(key, `missing expression ${name}`);
      const index = mesh.morphTargetDictionary[key];
      assert.ok(result.morphAttributes.position[index].array.some(value => Math.abs(value) > 0));
      mesh.morphTargetInfluences.fill(0);
      mesh.morphTargetInfluences[index] = 1;
      const point = new THREE.Vector3();
      for (let i = 0; i < result.getAttribute('position').count; i++) {
        mesh.getVertexPosition(i, point);
        assert.ok([point.x, point.y, point.z].every(Number.isFinite));
      }
    }
    checked++;
  });
  assert.ok(checked > 0);
});

test('projection has real rings, rays, and independent fragments', () => {
  const projection = createAureliaProjection();
  assert.equal(projection.getObjectByName('signal-fragments').children.length, 32);
  assert.equal(projection.children.filter(child => child.isMesh).length, 3);
  assert.ok(projection.children.some(child => child.isLineSegments));
});
