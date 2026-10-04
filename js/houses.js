// houses.js - Nhà Nhật đặt theo block của map tròn
import * as THREE from 'three';
import { loadGLB } from './loaders.js';
import { getBlockCenters } from './streets.js';

export async function buildHouses(scene) {
  const model = await loadGLB('models/jp_house.glb');
  const group = new THREE.Group();

  const blocks = getBlockCenters();
  for (const b of blocks) {
    // Vành 3: dân cư; vành 5: ven đô (nhà vườn); vành 4 công viên để nature.js lo
    if (b.type !== 'residential' && b.type !== 'garden') continue;

    const h = model.clone();
    h.position.set(b.x, 0, b.z);
    h.rotation.y = -b.angle + Math.PI / 2;
    if (b.type === 'garden') h.scale.setScalar(0.85);
    group.add(h);
  }

  scene.add(group);
  return group;
}
