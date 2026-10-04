// tokyo_tower.js
import { loadGLB } from './loaders.js';

export async function buildTokyoTower(scene) {
  const tower = await loadGLB('models/tokyo_tower.glb');
  // Model export Z-up → xoay ở group level để thành Y-up (giữ nguyên node hierarchy bên trong)
  tower.rotation.x = Math.PI / 2;
  tower.position.set(28, 0, 28); // dời khỏi ngã tư, có sân riêng
  scene.add(tower);
  return tower;
}
