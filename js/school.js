// school.js - Trường học Nhật Bản (vành 3, residential)
import * as THREE from 'three';
import { Batch } from './batch.js?v=2';
import { LAYER_Y, COLORS } from './config.js?v=2';
import { getBlockCenters } from './streets.js?v=2';

export async function buildSchool(scene) {
  const group = new THREE.Group();
  const blocks = getBlockCenters().filter(b => b.type === 'residential');
  const spots = [blocks[0], blocks[6]]; // 2 trường đối xứng

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5e6a3, roughness: 0.8 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.9 });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x88ccff, roughness: 0.2, metalness: 0.2,
  });

  for (const b of spots) {
    const g = new THREE.Group();

    // Tòa nhà chữ U: 3 khối
    // Khối chính (ngang)
    const main = new THREE.Mesh(new THREE.BoxGeometry(36, 10, 12), wallMat);
    main.position.set(0, 5, -8);
    main.castShadow = true; main.receiveShadow = true;
    g.add(main);

    // 2 cánh (dọc)
    for (const sx of [-15, 15]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(8, 10, 20), wallMat);
      wing.position.set(sx, 5, 4);
      wing.castShadow = true; wing.receiveShadow = true;
      g.add(wing);
      // Mái cánh
      const wRoof = new THREE.Mesh(new THREE.BoxGeometry(9, 1, 21), roofMat);
      wRoof.position.set(sx, 10.5, 4);
      g.add(wRoof);
    }

    // Mái khối chính
    const mRoof = new THREE.Mesh(new THREE.BoxGeometry(38, 1, 14), roofMat);
    mRoof.position.set(0, 10.5, -8);
    mRoof.castShadow = true;
    g.add(mRoof);

    // Cửa sổ đều (mặt trước khối chính)
    for (let i = -3; i <= 3; i++) {
      for (let f = 0; f < 2; f++) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.3), windowMat);
        win.position.set(i * 4.5, 3.5 + f * 4, -1.9);
        g.add(win);
      }
    }

    // Cột cờ giữa sân
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.5 })
    );
    pole.position.set(0, 5, 10);
    pole.castShadow = true;
    g.add(pole);

    // Lá cờ Nhật (trắng + mặt trời đỏ)
    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    flag.position.set(1.6, 8.5, 10);
    g.add(flag);
    const sun = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 16),
      new THREE.MeshBasicMaterial({ color: 0xcc0000 })
    );
    sun.position.set(1.6, 8.5, 10.06);
    g.add(sun);

    g.position.set(b.x, LAYER_Y.building, b.z);
    g.rotation.y = -b.angle + Math.PI / 2;
    group.add(g);

    // Sân trường (đất nện) + vạch sân bóng
    const batch = new Batch();
    batch.disc(b.x, b.z, 30, LAYER_Y.curb, 0xc4a882); // sân đất
    // Vòng tròn giữa sân
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      pts.push({ x: b.x + Math.cos(a) * 8, z: b.z + Math.sin(a) * 8 });
    }
    batch.ribbon(pts, 0.2, LAYER_Y.paint, COLORS.paint);
    group.add(batch.build());
  }

  scene.add(group);
  return group;
}
