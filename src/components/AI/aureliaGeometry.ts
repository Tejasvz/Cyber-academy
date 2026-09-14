import * as THREE from 'three';

/** Reduce broad facial planes without discarding the facial rig.
 * Positions and every relative morph delta use the SAME vertex clusters.
 * Getters decode normalized GLTF attributes before conversion to floats.
 */
export function createFacetedFaceGeometry(source: THREE.BufferGeometry, matrix: THREE.Matrix4) {
  const position = source.getAttribute('position');
  const world = new THREE.Vector3();
  const bounds = new THREE.Box3();
  for (let i = 0; i < position.count; i++) bounds.expandByPoint(world.fromBufferAttribute(position, i).applyMatrix4(matrix));
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const clusters: number[][] = [];
  const lookup = new Map<string, number>();
  const remap: number[] = [];
  for (let i = 0; i < position.count; i++) {
    world.fromBufferAttribute(position, i).applyMatrix4(matrix).sub(center).divide(size);
    // Protect eyelid/lip contours from welding. Cheeks, temples and forehead
    // become broad facets while facial expressions retain fine topology.
    const feature = world.z > .12 && Math.abs(world.x) < .38 && world.y > -.32 && world.y < .16;
    const key = feature ? `feature-${i}` : [world.x, world.y, world.z].map(v => Math.round(v / .065)).join(':');
    let cluster = lookup.get(key);
    if (cluster === undefined) { cluster = clusters.length; lookup.set(key, cluster); clusters.push([]); }
    clusters[cluster].push(i);
    remap.push(cluster);
  }
  const average = (attribute: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) => {
    const output = new Float32Array(clusters.length * attribute.itemSize);
    clusters.forEach((members, i) => {
      for (let c = 0; c < attribute.itemSize; c++) {
        output[i * attribute.itemSize + c] = members.reduce((sum, vertex) => sum + attribute.getComponent(vertex, c), 0) / members.length;
      }
    });
    return new THREE.Float32BufferAttribute(output, attribute.itemSize);
  };
  const reduced = new THREE.BufferGeometry();
  for (const [name, attribute] of Object.entries(source.attributes)) reduced.setAttribute(name, average(attribute));
  for (const [name, attributes] of Object.entries(source.morphAttributes)) {
    reduced.morphAttributes[name as keyof typeof reduced.morphAttributes] = attributes!.map(average);
  }
  reduced.morphTargetsRelative = source.morphTargetsRelative;
  const indices: number[] = [];
  const sourceIndex = source.getIndex();
  for (let i = 0; i < (sourceIndex?.count ?? position.count); i += 3) {
    const [a, b, c] = [0, 1, 2].map(offset => remap[sourceIndex ? sourceIndex.getX(i + offset) : i + offset]);
    if (a !== b && b !== c && a !== c) indices.push(a, b, c);
  }
  reduced.setIndex(indices);
  const geometry = reduced.toNonIndexed();
  reduced.dispose();
  const palette = ['#348dce', '#63c7ef', '#2475be', '#98def5', '#426bcd', '#368cdb', '#6653be'];
  const colors: number[] = [];
  for (let i = 0; i < geometry.getAttribute('position').count; i += 3) {
    const color = new THREE.Color(palette[(Math.imul(i + 13, 2654435761) >>> 0) % palette.length]);
    for (let corner = 0; corner < 3; corner++) colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/** Real projection rays and peripheral fragments, not a plane with a portrait. */
export function createAureliaProjection() {
  const projection = new THREE.Group();
  const rays: THREE.Vector3[] = [];
  for (let i = 0; i < 44; i++) {
    const angle = i / 44 * Math.PI * 2;
    rays.push(new THREE.Vector3(Math.cos(angle) * .13, -1.48, Math.sin(angle) * .13));
    rays.push(new THREE.Vector3(Math.cos(angle) * .53, -.84, Math.sin(angle) * .34 - .08));
  }
  projection.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(rays), new THREE.LineBasicMaterial({
    color: 0x167dff, transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false,
  })));
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.24 + i * .12, .006, 4, 72), new THREE.MeshBasicMaterial({
      color: i === 0 ? 0x88ffff : 0x147cff, transparent: true, opacity: 1 - i * .25,
    }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.48;
    projection.add(ring);
  }
  const shards = new THREE.Group();
  shards.name = 'signal-fragments';
  for (let i = 0; i < 32; i++) {
    const angle = i * 2.39996;
    const radius = .76 + (i % 5) * .045;
    const geometry = new THREE.BufferGeometry();
    const width = .02 + (i % 4) * .013;
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, width, 0, -width, -width, 0, width * 1.4, 0, .012], 3));
    const shard = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? 0x992bff : 0x1383dd, side: THREE.DoubleSide,
      transparent: true, opacity: .28 + (i % 4) * .12,
    }));
    shard.position.set(Math.cos(angle) * radius, -.75 + (i / 31) * 2, Math.sin(angle) * .38);
    shard.rotation.set(i * .7, angle, i);
    shards.add(shard);
  }
  projection.add(shards);
  return projection;
}

export const normalizedMorphName = (name: string) => name.replace(/^.*\./, '')
  .replace(/_L$/i, 'Left').replace(/_R$/i, 'Right').toLowerCase();
