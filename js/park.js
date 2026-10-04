// park.js - Công viên + hồ nước (vành 4)
import * as THREE from 'three';
import { loadGLB } from './loaders.js?v=3';
import { Batch } from './batch.js?v=3';
import { LAYER_Y, COLORS } from './config.js?v=3';
import { getBlockCenters, MAP } from './streets.js?v=3';

export async function buildPark(scene) {
  const group = new THREE.Group();

  // Chọn block đầu tiên của vành park làm hồ nước
  const blocks = getBlockCenters().filter(b => b.type === 'park');
  const lakeBlock = blocks[0];
  const lakeR = 25;

  // 1. Hồ nước
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(lakeR, 48),
    new THREE.MeshStandardMaterial({
      color: 0x4a90d9, roughness: 0.15, metalness: 0.1,
    })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(lakeBlock.x, 0.02, lakeBlock.z);
  water.receiveShadow = true;
  group.add(water);

  // 2. Viền đá quanh hồ
  const rockModel = await loadGLB('models/rock.glb');
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const rock = rockModel.clone();
    const rr = lakeR + 2;
    rock.position.set(
      lakeBlock.x + Math.cos(a) * rr,
      LAYER_Y.building,
      lakeBlock.z + Math.sin(a) * rr
    );
    rock.scale.setScalar(0.5 + Math.random() * 0.3);
    rock.rotation.y = Math.random() * Math.PI * 2;
    rock.castShadow = true;
    group.add(rock);
  }

  // 3. Đường dạo quanh hồ (Batch ribbon khép vòng)
  const batch = new Batch();
  const pathPts = [];
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    pathPts.push({
      x: lakeBlock.x + Math.cos(a) * (lakeR + 6),
      z: lakeBlock.z + Math.sin(a) * (lakeR + 6),
    });
  }
  batch.ribbon(pathPts, 2, LAYER_Y.curb, COLORS.plaza);
  group.add(batch.build());

  // 4. Thuyền trên hồ
  const boatModel = await loadGLB('models/boat.glb');
  for (let i = 0; i < 2; i++) {
    const boat = boatModel.clone();
    boat.position.set(
      lakeBlock.x + (i === 0 ? -8 : 10),
      0.1,
      lakeBlock.z + (i === 0 ? 5 : -8)
    );
    boat.rotation.y = Math.random() * Math.PI * 2;
    boat.scale.setScalar(0.8);
    boat.castShadow = true;
    group.add(boat);
  }

  // 5. Cây xanh: quanh hồ + các block park còn lại
  const treeModel = await loadGLB('models/jabami_tree.glb');
  // Quanh hồ
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.26;
    const tree = treeModel.clone();
    const tr = lakeR + 12;
    tree.position.set(
      lakeBlock.x + Math.cos(a) * tr,
      LAYER_Y.building,
      lakeBlock.z + Math.sin(a) * tr
    );
    tree.scale.setScalar(0.8 + Math.random() * 0.4);
    tree.rotation.y = Math.random() * Math.PI * 2;
    tree.castShadow = true;
    group.add(tree);
  }
  // Các block park còn lại (mỗi block 3 cây)
  for (let bi = 1; bi < blocks.length; bi++) {
    const b = blocks[bi];
    for (let i = 0; i < 3; i++) {
      const tree = treeModel.clone();
      const a = Math.random() * Math.PI * 2;
      const rr = 5 + Math.random() * 12;
      tree.position.set(
        b.x + Math.cos(a) * rr,
        LAYER_Y.building,
        b.z + Math.sin(a) * rr
      );
      tree.scale.setScalar(0.7 + Math.random() * 0.5);
      tree.rotation.y = Math.random() * Math.PI * 2;
      tree.castShadow = true;
      group.add(tree);
    }
  }

  scene.add(group);
  return group;
}
