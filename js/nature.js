// nature.js - Cây xanh: công viên vành 4 + điểm xuyết các vành khác
import * as THREE from 'three';
import { loadGLB } from './loaders.js';
import { getBlockCenters, MAP } from './streets.js';

export async function buildNature(scene) {
  const model = await loadGLB('models/sakura.glb');
  const group = new THREE.Group();

  const blocks = getBlockCenters();
  let parkCount = 0;
  for (const b of blocks) {
    if (b.type === 'park') {
      // Công viên: trồng 3 cây mỗi block (giảm chi tiết để nhẹ máy)
      for (let k = 0; k < 3; k++) {
        const a = b.angle + (k - 1) * 0.35;
        const r = Math.hypot(b.x, b.z) + (k % 2 === 0 ? 8 : -8);
        const t = model.clone();
        t.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        t.rotation.y = Math.random() * Math.PI * 2;
        t.scale.setScalar(0.7 + Math.random() * 0.3);
        group.add(t);
        parkCount++;
      }
    } else if (b.type === 'residential' || b.type === 'garden') {
      // Điểm xuyết 1 cây mỗi block dân cư
      const t = model.clone();
      t.position.set(b.x * 1.15, 0, b.z * 1.15);
      t.rotation.y = Math.random() * Math.PI * 2;
      t.scale.setScalar(0.6 + Math.random() * 0.3);
      group.add(t);
    }
  }

  // Hàng cây dọc vành đai ngoài cùng
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const t = model.clone();
    t.position.set(Math.cos(a) * 440, 0, Math.sin(a) * 440);
    t.rotation.y = Math.random() * Math.PI * 2;
    t.scale.setScalar(0.8);
    group.add(t);
  }

  scene.add(group);
  return group;
}
