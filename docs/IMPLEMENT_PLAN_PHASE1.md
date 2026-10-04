# KẾ HOẠCH IMPLEMENT — Tokyo City Phase 1: Base Map Tròn
**Version:** 1.0 | **Ngày:** 2026-10-04 | **Mục tiêu:** Desktop

---

## 1. TỔNG QUAN

### 1.1 Mục tiêu
Xây dựng base game khám phá thành phố Tokyo 3D trên nền web (Three.js):
- Map hình tròn 1km đường kính, tháp Tokyo ở trung tâm
- Mạng lưới đường chằng chịt: 5 vành đai + 12 xuyên tâm
- 5 khu vực phân vành: văn phòng, thương mại, dân cư, công viên, ven đô
- Xe cộ chạy tự động trên đường
- Chạy mượt trên máy tính (target 60fps)

### 1.2 Phạm vi Phase 1
**Làm:** Layout map, đường sá, đặt nhà/cây/xe cơ bản, tháp trung tâm, menu camera.
**Không làm:** Vạch kẻ đường chi tiết, model siêu thị/trường học/hồ nước (phase 2), nâng cấp model (phase 3).

### 1.3 Tiêu chí đạt (Definition of Done)
- [ ] Map tròn hiện đúng: 5 vành đai đồng tâm + 12 xuyên tâm tỏa đều
- [ ] Tháp Tokyo đứng thẳng ở (0,0), màu đỏ-cam, không bị đường đâm xuyên
- [ ] Nhà/cây đặt trong block, không nằm trên đường, không xuyên nhau
- [ ] Xe chạy đúng hướng (đầu xe theo hướng di chuyển), không chạy ngang
- [ ] Không nhấp nháy, không vệt trắng khi di chuyển camera
- [ ] Load xong trong <30s trên desktop
- [ ] HUD hiển thị đúng version

---

## 2. KIẾN TRÚC

### 2.1 Cấu trúc thư mục
```
tokyo-city/
├── index.html          # HTML shell, HUD, importmap, version
├── css/style.css       # Giao diện HUD, menu, loading
├── lib/
│   ├── three.module.js
│   └── addons/
│       ├── controls/OrbitControls.js
│       ├── loaders/GLTFLoader.js
│       └── utils/BufferGeometryUtils.js
├── models/             # GLB (giữ nguyên từ lần trước)
│   ├── tokyo_tower.glb     # 1.5MB, Z-up (xoay ở code)
│   ├── office_a.glb        # 15.7k tris
│   ├── office_b.glb        # 10.4k tris
│   ├── office_c.glb        # 10.2k tris
│   ├── jp_house.glb        # 49k tris
│   ├── jp_car.glb / _red / _blue / _yellow  # 33k tris mỗi
│   ├── sakura.glb          # 83k tris (dùng tiết chế)
│   └── streetlight.glb     # 6.2k tris
└── js/
    ├── config.js       # Hằng số toàn cục
    ├── scene.js        # Renderer, camera, đèn, đất, fog
    ├── loaders.js      # Hàm loadGLB dùng chung
    ├── streets.js      # Đường + tính toán block
    ├── tokyo_tower.js  # Đặt tháp
    ├── buildings.js    # Văn phòng
    ├── houses.js       # Nhà dân
    ├── nature.js       # Cây xanh
    ├── cars.js         # Xe chạy
    └── main.js         # Khởi tạo, menu, vòng lặp
```

### 2.2 Luồng khởi tạo (main.js)
```
1. createScene() → { scene, camera, renderer, controls }
2. buildTokyoTower(scene)     → tháp ở trung tâm
3. buildStreets(scene)         → đường sá
4. buildBuildings(scene)       → văn phòng (dùng getBlockCenters)
5. buildHouses(scene)          → nhà dân
6. buildNature(scene)          → cây
7. buildCars(scene)            → xe
8. Ẩn loading, bắt đầu animate()
```

---

## 3. CHI TIẾT TỪNG MODULE

### 3.1 config.js
```js
// Hằng số dùng chung
export const VERSION = 'v1';
export const COLORS = { ... }; // palette màu
```

### 3.2 scene.js
**Trách nhiệm:** Renderer, camera, ánh sáng, mặt đất, bầu trời.

| Tham số | Giá trị | Lý do |
|---------|---------|-------|
| Renderer antialias | `true` | Desktop cần mượt |
| Pixel ratio | `min(devicePixelRatio, 2)` | Cân bằng nét/hiệu năng |
| Shadow | `PCFSoftShadowMap`, 2048 | Bóng mềm đẹp |
| Camera near/far | `2` / `1500` | Tránh z-fighting (bài học 2026-10-04) |
| Camera pos | `(250, 180, 250)` | Nhìn toàn map 1km |
| Fog | `new THREE.Fog(0x87CEEB, 300, 900)` | Chiều sâu (desktop) |
| Đất | `CircleGeometry(560, 48)` | Vừa map 500m + lề |
| Màu đất | `0x7a9a6a` | Xanh cỏ |
| Mặt trời | DirectionalLight `(50,80,30)`, intensity 2.5 | Ban ngày |
| Shadow camera | ±550 | Phủ map |
| Shadow bias | `-0.0002`, normalBias `0.6` | Chống shadow acne |

### 3.3 loaders.js
```js
export async function loadGLB(path) {
  // Dùng GLTFLoader, trả về THREE.Group
  // Xử lý lỗi: log và throw để main.js báo
}
```

### 3.4 streets.js
**Trách nhiệm:** Vẽ đường, cung cấp tọa độ block.

**Hằng số MAP:**
```js
export const MAP = {
  radius: 500,
  plazaR: 15,              // sân tháp
  roundaboutOuter: 25,     // bùng binh ngoài
  rings: [80, 160, 240, 320, 400],
  ringWidth: 12,
  radials: 12,
  radialWidth: 10,
  roadY: 0.1,
};
```

**Cao độ (tránh z-fighting):**
| Đối tượng | Y |
|-----------|---|
| Đất | 0 |
| Sân tháp, bùng binh, vành đai | 0.10 |
| Đường xuyên tâm | 0.14 |
| Nhà, cây | 0.05 |
| Xe | 0.20 |

**Chi tiết implement:**
- Sân tháp: `CircleGeometry(15, 48)`, màu xám vỉa hè
- Bùng binh: `RingGeometry(15, 25, 64)`, màu nhựa đường
- Vành đai: `RingGeometry(r-6, r+6, 96)` cho mỗi r
- Xuyên tâm: `PlaneGeometry(10, 475)`, `geometry.rotateX(-π/2)` bake phẳng, rồi `mesh.rotation.y = -ang` (BÀI HỌC: không dùng rotation.x + rotation.z)
- Vạch kẻ: **TẠM BỎ** phase 1 (2500 mesh quá nặng). Phase 3 dùng InstancedMesh.

**getBlockCenters():**
```js
// Trả về [{x, z, angle, type}]
// 5 vành × 12 block = 60 block
zones = [
  { r0: 32,  r1: 70,  type: 'office' },      // 12 block
  { r0: 90,  r1: 150, type: 'commercial' },  // 12 block
  { r0: 170, r1: 230, type: 'residential' }, // 12 block
  { r0: 250, r1: 310, type: 'park' },        // 12 block
  { r0: 330, r1: 390, type: 'garden' },      // 12 block
];
// Mỗi block: rMid = (r0+r1)/2, angle = (i+0.5)/12 * 2π
```

### 3.5 tokyo_tower.js
```js
export async function buildTokyoTower(scene) {
  const tower = await loadGLB('models/tokyo_tower.glb');
  // Model Z-up → xoay ở group level (BÀI HỌC: không xoay vertex)
  tower.rotation.x = Math.PI / 2;
  tower.position.set(0, 0.1, 0);
  scene.add(tower);
}
```
**Verify:** Tháp cao ~15m, màu đỏ-cam, lattice đều, không có cột đen giữa.

### 3.6 buildings.js
- Load 3 model office_a/b/c
- Vành 1 (`office`): đặt 12 tòa, xoay mặt tiền về tâm (`rotation.y = -angle + π/2`)
- Vành 2 (`commercial`): đặt 12 tòa, `scale 0.7` (thấp hơn)
- Vị trí y = 0.05

### 3.7 houses.js
- Load jp_house.glb
- Vành 3 (`residential`): 12 nhà
- Vành 5 (`garden`): 12 nhà, `scale 0.85`
- Vị trí y = 0.05, xoay về tâm

### 3.8 nature.js
- Load sakura.glb (83k tris — dùng tiết chế)
- Vành 4 (`park`): 12 cây (1 cây/block)
- **Không** trồng hàng rào ngoài rìa phase 1 (quá nặng)
- Vị trí y = 0.05, scale ngẫu nhiên 0.7–1.0, xoay ngẫu nhiên

### 3.9 cars.js
**Xe vành đai (12 xe):**
```js
// Mỗi vành (5 vành + bùng binh) 2 xe ngược chiều
for (const r of [...MAP.rings, 20]) {
  for (const dir of [1, -1]) {
    userData = { kind: 'ring', radius: r, dir, angle: random, speed: 0.02–0.035 };
  }
}
// Update:
u.angle += u.speed * 0.01;
x = cos(angle) * radius; z = sin(angle) * radius;
car.rotation.y = Math.atan2(-cos(angle)*dir, -sin(angle)*dir);
```

**Xe xuyên tâm (4 xe):**
```js
// 4 đường, mỗi đường 1 xe
userData = { kind: 'radial', angle, dir, t: random, speed: 0.6–1.0 };
// Update:
u.t += u.speed; // đảo chiều ở biên
x = cos(angle) * t; z = sin(angle) * t;
car.rotation.y = dir > 0 ? -angle : -angle + Math.PI;
```

**BÀI HỌC:** Đầu xe ở +X (trụ A x=+0.58). Kiểm tra hướng trước khi gán rotation.

### 3.10 main.js
- Loading progress qua từng bước
- Menu: "Tháp Tokyo" → camera (60,35,60) target (0,20,0)
- Menu: "Toàn cảnh" → camera (350,280,350) target (0,0,0)
- Menu: "Tự do" → đóng menu
- Nút "Bật/tắt xe chạy"
- Vòng lặp: `updateCars()` + `controls.update()` + `render()`

---

## 4. VERSION & CACHE

- HUD: `TOKYO 3D <span>vN</span>` — tăng N mỗi lần push
- `index.html`: `<script src="js/main.js?v=N">`
- Mọi `import` trong js: `from './xxx.js?v=N'`
- Quy tắc: **không push mà không bump version**

---

## 5. BÀI HỌC KỸ THUẬT (từ lần trước)

| # | Lỗi | Nguyên nhân | Fix |
|---|-----|-------------|-----|
| 1 | Nhấp nháy toàn map | Camera near=0.1/far=3000 | near=2, far=1500 |
| 2 | Vệt trắng trên cỏ | Antialias + đất 1300m quá lớn | Tắt antialias test / đất 1120m |
| 3 | Đường xuyên tâm nghiêng | Dùng rotation.x + rotation.z | Bake rotateX vào geometry, chỉ dùng rotation.y |
| 4 | Vạch kẻ chôn trong đường | Box cao 0.2, vạch ở 0.15 | Dùng PlaneGeometry, vạch trên mặt |
| 5 | Tháp lattice lệch | Xoay vertex trực tiếp | Xoay ở group level |
| 6 | Xe chạy ngang | Đảo rotation x/z | Xác định đầu xe (+X) trước |
| 7 | 2500 vạch kẻ nặng máy | Mỗi vạch 1 mesh | Tạm bỏ, phase 3 dùng InstancedMesh |
| 8 | Cache mù mờ | JS cache riêng | `?v=N` cho mọi import |

---

## 6. QUY TRÌNH VERIFY

### 6.1 Trước khi push
- [ ] `node --check` tất cả file js
- [ ] Kiểm tra version đã bump chưa
- [ ] Kiểm tra `?v=N` đồng bộ

### 6.2 Sau khi push
- [ ] Đợi Pages rebuild (3–5 phút)
- [ ] Mở trên desktop, kiểm tra HUD version đúng
- [ ] Bấm "Toàn cảnh": map tròn, 5 vành, 12 xuyên tâm
- [ ] Bấm "Tháp Tokyo": tháp đứng, màu đỏ-cam, không đổ
- [ ] Quan sát xe 30s: chạy đúng hướng, không xuyên tường
- [ ] Di chuyển camera: không nhấp nháy, không vệt trắng
- [ ] Kiểm tra console: không lỗi đỏ

### 6.3 Tiêu chí fail
Nếu bất kỳ mục nào ở 6.2 fail → không làm tiếp, fix ngay.

---

## 7. RỦI RO

| Rủi ro | Giảm thiểu |
|--------|------------|
| Scene quá nặng | Đếm tris trước khi thêm model mới; target <2M tris |
| Cache gây nhầm | Version + `?v=N` bắt buộc |
| Model Z-up/Y-up | Kiểm tra bounding box trước khi dùng |
| Đường chồng nhau | Bảng cao độ ở mục 3.4 |

---

## 8. THỨ TỰ IMPLEMENT

1. `index.html` + `css/style.css` (HUD v1, ?v=1)
2. `lib/` (copy three.js)
3. `models/` (upload GLB hiện có)
4. `js/config.js` → `js/loaders.js`
5. `js/scene.js` (desktop: shadow, antialias, fog)
6. `js/streets.js` (đường + getBlockCenters)
7. `js/tokyo_tower.js`
8. `js/buildings.js` → `js/houses.js` → `js/nature.js`
9. `js/cars.js`
10. `js/main.js`
11. Verify theo mục 6
12. Push + bump version
