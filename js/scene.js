// scene.js - Renderer, camera, lights, sky
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene() {
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false }); // tắt antialias test vệt trắng
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = false; // TẮT shadow để test nhấp nháy

  const scene = new THREE.Scene();
  // Trời xanh ban ngày Tokyo
  scene.background = new THREE.Color(0x87CEEB);
  // Bỏ fog theo yêu cầu (gây vệt trắng trên iPhone)

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 2, 1500);
  camera.position.set(250, 180, 250);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 10, 0);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;

  // Ánh sáng ban ngày
  const sun = new THREE.DirectionalLight(0xffffff, 2.5);
  sun.position.set(50, 80, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -550; sun.shadow.camera.right = 550;
  sun.shadow.camera.top = 550; sun.shadow.camera.bottom = -550;
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.6;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xbfe3ff, 0x8a7f70, 0.8));

  // Đất nền hình tròn (vừa đủ map 500m + lề nhỏ để giảm lỗi precision)
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(560, 48),
    new THREE.MeshStandardMaterial({ color: 0x7a9a6a, roughness: 1 })
  );
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  scene.add(ground);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, controls };
}
