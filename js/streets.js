// streets.js - Mạng lưới đường tròn dùng Batch (gom geometry)
// Nguồn: gridburg MeshBuilder.ring(), catsjuice ribbon()
import * as THREE from 'three';
import { Batch } from './batch.js?v=2';
import { MAP, LAYER_Y, COLORS } from './config.js?v=2';

export { MAP };

export function buildStreets(scene) {
  const batch = new Batch();

  // 1. Sân tháp trung tâm (vỉa hè tròn)
  batch.disc(0, 0, MAP.plazaR, LAYER_Y.curb, COLORS.plaza);

  // 2. Bùng binh quanh tháp
  batch.ring(0, 0, MAP.plazaR, MAP.roundaboutOuter, LAYER_Y.asphalt, COLORS.asphalt);

  // 3. 5 đường vành đai
  for (const r of MAP.rings) {
    batch.ring(0, 0, r - MAP.ringWidth / 2, r + MAP.ringWidth / 2,
      LAYER_Y.asphalt, COLORS.asphalt);
  }

  // 4. 12 đường xuyên tâm (ribbon, cao hơn vành đai 1 lớp)
  for (let i = 0; i < MAP.radials; i++) {
    const ang = (i / MAP.radials) * Math.PI * 2;
    const x0 = Math.cos(ang) * MAP.roundaboutOuter;
    const z0 = Math.sin(ang) * MAP.roundaboutOuter;
    const x1 = Math.cos(ang) * MAP.radius;
    const z1 = Math.sin(ang) * MAP.radius;
    batch.ribbon(
      [{ x: x0, z: z0 }, { x: x1, z: z1 }],
      MAP.radialWidth / 2,
      LAYER_Y.asphalt + 0.04, // cao hơn vành đai để không đánh nhau ở ngã tư
      COLORS.asphalt
    );
  }

  const group = batch.build();
  scene.add(group);
  return group;
}

// Trả về tâm các block (để đặt nhà) — mỗi block nằm giữa 2 vành đai và 2 xuyên tâm
export function getBlockCenters() {
  const blocks = [];
  const zones = [
    { r0: 32, r1: 70, type: 'office' },
    { r0: 90, r1: 150, type: 'commercial' },
    { r0: 170, r1: 230, type: 'residential' },
    { r0: 250, r1: 310, type: 'park' },
    { r0: 330, r1: 390, type: 'garden' },
  ];
  for (const z of zones) {
    const rMid = (z.r0 + z.r1) / 2;
    for (let i = 0; i < MAP.radials; i++) {
      const ang = ((i + 0.5) / MAP.radials) * Math.PI * 2;
      blocks.push({
        x: Math.cos(ang) * rMid,
        z: Math.sin(ang) * rMid,
        angle: ang,
        type: z.type,
      });
    }
  }
  return blocks;
}
