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
      // Công viên: 1 cây mỗi block (tạm low-poly, nâng cấp sau)
      const t = model.clone();
      t.position.set(b.x, 0, b.z);
      t.rotation.y = Math.random() * Math.PI * 2;
      t.scale.setScalar(0.7 + Math.random() * 0.3);
      group.add(t);
      parkCount++;
      if (parkCount >= 12) break;
    }
  }

  // Bỏ hàng cây ngoài rìa và cây điểm xuyết (quá nặng) — thêm lại khi có bản low-poly

  scene.add(group);
  return group;
}
