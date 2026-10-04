// cars.js - Xe chạy trên vành đai tròn và đường xuyên tâm
import * as THREE from 'three';
import { loadGLB } from './loaders.js?v=1';
import { MAP } from './streets.js?v=1';

const COLORS = ['red', 'blue', 'yellow'];
let movingCars = [];
let carsEnabled = true;

export async function buildCars(scene) {
  const models = {};
  for (const c of COLORS) {
    models[c] = await loadGLB(`models/jp_car_${c}.glb`);
  }
  const group = new THREE.Group();

  // Xe chạy trên các vành đai (mỗi vành 2 xe ngược chiều)
  const ringRadii = [...MAP.rings, (MAP.plazaR + MAP.roundaboutOuter) / 2];
  let ci = 0;
  for (const r of ringRadii) {
    for (const dir of [1, -1]) {
      const car = models[COLORS[ci++ % 3]].clone();
      car.userData = {
        kind: 'ring', radius: r, dir,
        angle: Math.random() * Math.PI * 2,
        speed: (0.02 + Math.random() * 0.015) * dir, // rad/frame
      };
      group.add(car);
      movingCars.push(car);
    }
  }

  // Xe chạy trên 4 đường xuyên tâm (mỗi đường 1 xe)
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / MAP.radials;
    const car = models[COLORS[ci++ % 3]].clone();
    const dir = i % 2 === 0 ? 1 : -1;
    car.userData = {
      kind: 'radial', angle: ang, dir,
      t: MAP.roundaboutOuter + Math.random() * (MAP.radius - MAP.roundaboutOuter - 20),
      speed: (0.6 + Math.random() * 0.4) * dir, // m/frame
    };
    group.add(car);
    movingCars.push(car);
  }

  scene.add(group);
  return group;
}

export function updateCars() {
  if (!carsEnabled) return;
  for (const car of movingCars) {
    const u = car.userData;
    if (u.kind === 'ring') {
      u.angle += u.speed * 0.01;
      const x = Math.cos(u.angle) * u.radius;
      const z = Math.sin(u.angle) * u.radius;
      car.position.set(x, 0.2, z);
      // Hướng tiếp tuyến: forward +X → tiếp tuyến vòng tròn
      car.rotation.y = Math.atan2(-Math.cos(u.angle) * u.dir, -Math.sin(u.angle) * u.dir);
    } else {
      u.t += u.speed;
      if (u.t > MAP.radius - 10) u.t = MAP.roundaboutOuter + 5;
      if (u.t < MAP.roundaboutOuter + 5) u.t = MAP.radius - 10;
      const x = Math.cos(u.angle) * u.t;
      const z = Math.sin(u.angle) * u.t;
      car.position.set(x, 0.2, z);
      // Hướng dọc theo xuyên tâm (đầu xe +X)
      car.rotation.y = u.dir > 0 ? -u.angle : -u.angle + Math.PI;
    }
  }
}

export function toggleCars() {
  carsEnabled = !carsEnabled;
  return carsEnabled;
}
