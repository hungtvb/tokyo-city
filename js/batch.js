// batch.js - Gom geometry theo màu, merge thành 1 mesh/màu
// Nguồn: catsjuice/random-city geometry.js, gorgekara/gridburg meshBuilder.ts
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export class Batch {
  constructor() {
    this.parts = new Map(); // color (hex) -> geometry[]
  }

  add(geometry, colorHex) {
    const key = colorHex;
    if (!this.parts.has(key)) this.parts.set(key, []);
    // Xóa uv/tangent để giảm memory trước khi merge
    const g = geometry.clone();
    g.deleteAttribute('uv');
    g.deleteAttribute('tangent');
    // Đảm bảo có color attribute
    const count = g.attributes.position.count;
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color(colorHex);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.parts.get(key).push(g);
  }

  // Vành khuyên: đường vành đai
  ring(x, z, r0, r1, y, colorHex, segments = 96) {
    const geo = new THREE.RingGeometry(r0, r1, segments);
    geo.rotateX(-Math.PI / 2);
    geo.translate(x, y, z);
    this.add(geo, colorHex);
    geo.dispose();
  }

  // Dải dọc polyline: đường xuyên tâm, vạch kẻ
  ribbon(points, halfWidth, y, colorHex) {
    // points: [{x, z}, ...]
    const positions = [];
    const indices = [];
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const pPrev = points[Math.max(0, i - 1)];
      const pNext = points[Math.min(points.length - 1, i + 1)];
      // Pháp tuyến 2D
      let dx = pNext.x - pPrev.x, dz = pNext.z - pPrev.z;
      const len = Math.hypot(dx, dz) || 1;
      dx /= len; dz /= len;
      const nx = -dz, nz = dx; // pháp tuyến trái
      positions.push(
        p.x + nx * halfWidth, y, p.z + nz * halfWidth,
        p.x - nx * halfWidth, y, p.z - nz * halfWidth
      );
      if (i > 0) {
        const base = i * 2;
        indices.push(base - 2, base - 1, base, base - 1, base + 1, base);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    this.add(geo, colorHex);
    geo.dispose();
  }

  // Đĩa tròn: sân tháp
  disc(x, z, r, y, colorHex, segments = 48) {
    const geo = new THREE.CircleGeometry(r, segments);
    geo.rotateX(-Math.PI / 2);
    geo.translate(x, y, z);
    this.add(geo, colorHex);
    geo.dispose();
  }

  // Build: mỗi màu 1 mesh, trả về Group
  build(material = null) {
    const group = new THREE.Group();
    const mat = material || new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.9, metalness: 0
    });
    for (const [, geos] of this.parts) {
      const merged = mergeGeometries(geos, false);
      geos.forEach(g => g.dispose());
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, mat);
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    this.parts.clear();
    return group;
  }
}
