// playground.js - Khu vui chơi trẻ em (vành 5, garden)
import * as THREE from 'three';
import { Batch } from './batch.js?v=3';
import { LAYER_Y } from './config.js?v=3';
import { getBlockCenters } from './streets.js?v=3';

export async function buildPlayground(scene) {
  const group = new THREE.Group();
  const blocks = getBlockCenters().filter(b => b.type === 'garden');
  const b = blocks[0]; // 1 khu vui chơi

  const red = new THREE.MeshStandardMaterial({ color: 0xdd3333, roughness: 0.5 });
  const yellow = new THREE.MeshStandardMaterial({ color: 0xffcc33, roughness: 0.5 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x3388dd, roughness: 0.5 });
  const green = new THREE.MeshStandardMaterial({ color: 0x33aa55, roughness: 0.5 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.6, roughness: 0.4 });

  // 1. Sân cát
  const batch = new Batch();
  batch.disc(b.x, b.z, 22, LAYER_Y.curb, 0xe8d8a0);
  group.add(batch.build());

  // 2. Cầu trượt
  const slide = new THREE.Group();
  // Khung
  for (const [sx, sz] of [[-1.5, 0], [1.5, 0]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4, 8), metal);
    leg.position.set(sx, 2, sz);
    leg.castShadow = true;
    slide.add(leg);
  }
  // Sàn trên
  const platform = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 2), blue);
  platform.position.y = 4;
  platform.castShadow = true;
  slide.add(platform);
  // Thang
  const ladder = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4.5, 0.3), yellow);
  ladder.position.set(-2.5, 2, 0);
  ladder.rotation.z = 0.3;
  slide.add(ladder);
  // Máng trượt (nghiêng)
  const chute = new THREE.Mesh(new THREE.BoxGeometry(5, 0.3, 1.2), red);
  chute.position.set(3.5, 2, 0);
  chute.rotation.z = -0.5;
  chute.castShadow = true;
  slide.add(chute);
  slide.position.set(b.x - 8, LAYER_Y.curb, b.z);
  group.add(slide);

  // 3. Xích đu
  const swing = new THREE.Group();
  // Khung chữ A
  for (const sx of [-2, 2]) {
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.5, 8), metal);
      leg.position.set(sx, 2.2, sz);
      leg.rotation.x = sz > 0 ? 0.25 : -0.25;
      leg.castShadow = true;
      swing.add(leg);
    }
  }
  // Thanh ngang
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.5, 8), metal);
  bar.rotation.z = Math.PI / 2;
  bar.position.y = 4.2;
  swing.add(bar);
  // 2 ghế đu
  for (const sx of [-1, 1]) {
    for (const sz of [-0.15, 0.15]) {
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.5, 6), metal);
      rope.position.set(sx + sz, 2.9, 0);
      swing.add(rope);
    }
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.5), green);
    seat.position.set(sx, 1.6, 0);
    seat.castShadow = true;
    swing.add(seat);
  }
  swing.position.set(b.x + 8, LAYER_Y.curb, b.z - 5);
  group.add(swing);

  // 4. Bập bênh
  const seesaw = new THREE.Group();
  // Điểm tựa
  const fulcrum = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 1), blue);
  fulcrum.position.y = 0.75;
  fulcrum.castShadow = true;
  seesaw.add(fulcrum);
  // Thanh dài
  const beam = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 0.6), yellow);
  beam.position.y = 1.6;
  beam.rotation.z = 0.12;
  beam.castShadow = true;
  seesaw.add(beam);
  // 2 ghế
  for (const sx of [-2.5, 2.5]) {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.6), red);
    seat.position.set(sx, sx > 0 ? 1.95 : 1.25, 0);
    seesaw.add(seat);
  }
  seesaw.position.set(b.x + 5, LAYER_Y.curb, b.z + 8);
  group.add(seesaw);

  scene.add(group);
  return group;
}
