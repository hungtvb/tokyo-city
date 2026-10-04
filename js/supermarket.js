// supermarket.js - Siêu thị (vành 2, commercial)
import * as THREE from 'three';
import { Batch } from './batch.js?v=3';
import { LAYER_Y, COLORS } from './config.js?v=3';
import { getBlockCenters, MAP } from './streets.js?v=3';
import { loadGLB } from './loaders.js?v=3';

export async function buildSupermarket(scene) {
  const group = new THREE.Group();
  const blocks = getBlockCenters().filter(b => b.type === 'commercial');
  const spots = [blocks[0], blocks[1]]; // 2 siêu thị

  for (const b of spots) {
    const g = new THREE.Group();

    // Tòa nhà chính: 40 x 12 x 25m
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(40, 12, 25),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 })
    );
    body.position.y = 6;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    // Mái: box mỏng nhô ra
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(42, 1, 27),
      new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 })
    );
    roof.position.y = 12.5;
    roof.castShadow = true;
    g.add(roof);

    // Mặt tiền kính (hướng về tâm thành phố)
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(36, 5, 0.5),
      new THREE.MeshStandardMaterial({
        color: 0x88ccff, roughness: 0.1, metalness: 0.3,
      })
    );
    glass.position.set(0, 3.5, 12.8);
    g.add(glass);

    // Cửa vào
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(6, 4, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x336699, roughness: 0.3 })
    );
    door.position.set(0, 2, 12.9);
    g.add(door);

    // Biển hiệu trên nóc
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(20, 3, 1),
      new THREE.MeshStandardMaterial({ color: 0xdd3333, roughness: 0.6 })
    );
    sign.position.set(0, 14.5, 8);
    sign.castShadow = true;
    g.add(sign);

    // Cột biển hiệu
    for (const sx of [-8, 8]) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 2, 8),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
      );
      pole.position.set(sx, 13, 8);
      g.add(pole);
    }

    g.position.set(b.x, LAYER_Y.building, b.z);
    g.rotation.y = -b.angle + Math.PI / 2; // mặt tiền hướng tâm
    group.add(g);

    // Bãi đậu xe trước siêu thị
    const batch = new Batch();
    // Sân đậu xe (hình chữ nhật trước mặt tiền)
    const px = b.x + Math.cos(b.angle) * -20;
    const pz = b.z + Math.sin(b.angle) * -20;
    batch.disc(px, pz, 18, LAYER_Y.curb, 0x555555);
    // Vạch đậu xe (5 vạch song song)
    for (let i = -2; i <= 2; i++) {
      const ox = Math.cos(b.angle + Math.PI / 2) * i * 4;
      const oz = Math.sin(b.angle + Math.PI / 2) * i * 4;
      batch.ribbon(
        [
          { x: px + ox - Math.cos(b.angle) * 8, z: pz + oz - Math.sin(b.angle) * 8 },
          { x: px + ox + Math.cos(b.angle) * 8, z: pz + oz + Math.sin(b.angle) * 8 },
        ],
        0.15, LAYER_Y.paint, COLORS.paint
      );
    }
    group.add(batch.build());
  }

  // Xe đậu tĩnh trong bãi (dùng jp_car)
  const carModel = await loadGLB('models/jp_car.glb');
  for (const b of spots) {
    for (let i = 0; i < 3; i++) {
      const car = carModel.clone();
      const px = b.x + Math.cos(b.angle) * -20;
      const pz = b.z + Math.sin(b.angle) * -20;
      const ox = Math.cos(b.angle + Math.PI / 2) * (i - 1) * 4;
      const oz = Math.sin(b.angle + Math.PI / 2) * (i - 1) * 4;
      car.position.set(px + ox, LAYER_Y.curb + 0.1, pz + oz);
      car.rotation.y = -b.angle;
      car.castShadow = true;
      group.add(car);
    }
  }

  scene.add(group);
  return group;
}
