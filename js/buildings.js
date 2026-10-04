// buildings.js - Tòa văn phòng đặt theo block của map tròn
import * as THREE from 'three';
import { loadGLB } from './loaders.js';
import { getBlockCenters } from './streets.js';

export async function buildBuildings(scene) {
  const models = {
    a: await loadGLB('models/office_a.glb'),
    b: await loadGLB('models/office_b.glb'),
    c: await loadGLB('models/office_c.glb'),
  };
  const group = new THREE.Group();
  const variants = ['a', 'b', 'c'];
  let vi = 0;

  const blocks = getBlockCenters();
  for (const b of blocks) {
    // Vành 1: văn phòng cao tầng; vành 2: thương mại (tạm dùng văn phòng low-poly)
    if (b.type !== 'office' && b.type !== 'commercial') continue;

    const v = variants[vi++ % 3];
    const m = models[v].clone();
    m.position.set(b.x, 0.05, b.z);
    m.rotation.y = -b.angle + Math.PI / 2;
    // Vành 2 thấp hơn vành 1
    if (b.type === 'commercial') m.scale.setScalar(0.7);
    group.add(m);
  }

  scene.add(group);
  return group;
}
