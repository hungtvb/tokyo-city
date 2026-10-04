// streets.js - Mạng lưới đường tròn: bùng binh trung tâm + 3 vành đai + 8 xuyên tâm
import * as THREE from 'three';

// Cấu hình map tròn
export const MAP = {
  radius: 500,           // bán kính map (1km đường kính)
  plazaR: 15,            // sân tháp trung tâm
  roundaboutOuter: 25,   // bùng binh: từ 15m đến 25m
  rings: [80, 160, 240, 320, 400], // bán kính tim 5 vành đai
  ringWidth: 12,         // rộng đường vành đai
  radials: 12,           // số đường xuyên tâm
  radialWidth: 10,       // rộng đường xuyên tâm
  roadY: 0.1,            // cao độ mặt đường
};

export function buildStreets(scene) {
  const group = new THREE.Group();
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.95 });
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xf5f5f5 });
  const plazaMat = new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 0.9 });

  const y = MAP.roadY;

  // 1. Sân tháp trung tâm (vỉa hè tròn)
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(MAP.plazaR, 48), plazaMat);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = y;
  plaza.receiveShadow = true;
  group.add(plaza);

  // 2. Bùng binh quanh tháp
  const roundabout = new THREE.Mesh(
    new THREE.RingGeometry(MAP.plazaR, MAP.roundaboutOuter, 64), roadMat);
  roundabout.rotation.x = -Math.PI / 2;
  roundabout.position.y = y;
  roundabout.receiveShadow = true;
  group.add(roundabout);

  // Vạch kẻ bùng binh (vòng tròn đứt)
  addDashedCircle(group, (MAP.plazaR + MAP.roundaboutOuter) / 2, y + 0.02, lineMat);

  // 3. 5 đường vành đai
  for (const r of MAP.rings) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(r - MAP.ringWidth / 2, r + MAP.ringWidth / 2, 96), roadMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = y;
    ring.receiveShadow = true;
    group.add(ring);

    // Vạch tim đường đứt
    addDashedCircle(group, r, y + 0.02, lineMat);
    // Vạch biên liền 2 mép
    for (const er of [r - MAP.ringWidth / 2 + 0.3, r + MAP.ringWidth / 2 - 0.3]) {
      const edge = new THREE.Mesh(new THREE.RingGeometry(er - 0.15, er + 0.15, 96),
        new THREE.MeshBasicMaterial({ color: 0xf5f5f5 }));
      edge.rotation.x = -Math.PI / 2;
      edge.position.y = y + 0.02;
      group.add(edge);
    }
  }

  // 4. 12 đường xuyên tâm (mặt phẳng, cao hơn vành đai để không đánh nhau ở ngã tư)
  const radialY = y + 0.04;
  for (let i = 0; i < MAP.radials; i++) {
    const ang = (i / MAP.radials) * Math.PI * 2;
    const len = MAP.radius - MAP.roundaboutOuter;
    const mid = MAP.roundaboutOuter + len / 2;

    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(MAP.radialWidth, len), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.rotation.z = ang;
    road.position.set(Math.cos(ang) * mid, radialY, Math.sin(ang) * mid);
    road.receiveShadow = true;
    group.add(road);

    // Vạch tim đứt (trên mặt đường xuyên tâm)
    const dashCount = Math.floor(len / 6);
    for (let d = 0; d < dashCount; d++) {
      const t = MAP.roundaboutOuter + 3 + d * 6;
      if (t > MAP.radius - 3) break;
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 2.5), lineMat);
      dash.position.set(Math.cos(ang) * t, radialY + 0.02, Math.sin(ang) * t);
      dash.rotation.y = -ang + Math.PI / 2;
      group.add(dash);
    }
  }

  scene.add(group);
  return group;
}

// Vòng tròn đứt nét (vạch kẻ đường cong)
function addDashedCircle(group, radius, y, mat) {
  const count = Math.floor((Math.PI * 2 * radius) / 6);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 2.5), mat);
    dash.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
    dash.rotation.y = -a + Math.PI / 2;
    group.add(dash);
  }
}

// Trả về tâm các block (để đặt nhà) — mỗi block nằm giữa 2 vành đai và 2 xuyên tâm
export function getBlockCenters() {
  const blocks = [];
  // 5 vành: văn phòng → thương mại → dân cư → công viên → ven đô
  const zones = [
    { r0: 32, r1: 70, type: 'office' },    // quanh tháp: cao ốc
    { r0: 90, r1: 150, type: 'commercial' }, // thương mại: siêu thị, cửa hàng
    { r0: 170, r1: 230, type: 'residential' }, // dân cư: nhà + trường học
    { r0: 250, r1: 310, type: 'park' },     // công viên + hồ nước
    { r0: 330, r1: 390, type: 'garden' },   // ven đô: nhà vườn + khu vui chơi
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
