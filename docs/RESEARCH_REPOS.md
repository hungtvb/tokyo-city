# BÁO CÁO RESEARCH — 3 Repo Three.js City
**Ngày:** 2026-10-04 | **Phase:** RESEARCH (chỉ đọc, không code)
**Mục đích:** Rút kỹ thuật áp dụng cho Tokyo City (map tròn 1km, tháp trung tâm, 5 vành đai + 12 xuyên tâm, xe tự chạy, target desktop)

---

## 1. mauriciopoppe/Three.js-City — City 3D + xe lái được

**Repo:** https://github.com/mauriciopoppe/Three.js-City (235 sao, từ 2013, Three.js r68 — cũ nhưng ý tưởng còn giá trị)

### 1.1 Cấu trúc code
```
T3/js/
├── Application.js, T3.js, AssetLoader.js, ObjectManager.js
├── controller/
│   ├── World.js      # dựng toàn bộ thế giới (đường, nhà, xe, camera, post-processing)
│   └── Keyboard.js   # điều khiển xe
├── model/
│   ├── Car.js        # xe lái được: tốc độ, lái, âm thanh động cơ
│   ├── Building.js, Camera.js, Tree.js, Wheel.js, ...
│   └── building/
│       ├── Block.js       # tòa nhà = chồng 3 box ngẫu nhiên
│       ├── RoundBlock.js  # tòa nhà = chồng cylinder
│       ├── Classic.js, Park.js
│       └── primitive/Box.js, Cylinder.js
├── obj/              # part xe (body, exhaust, interior, lights, rim, tire, windows)
└── lib/              # OBJLoader, MTLLoader
```

### 1.2 Kỹ thuật Three.js
- **Material:** `MeshPhongMaterial` + `map`/`bumpMap`/`specularMap`, `anisotropy = 16` cho texture đường nhìn xa không mờ.
- **Chia material theo mặt:** 6 mặt của box dùng mảng material — mặt trên/dưới dùng `MeshBasicMaterial` rẻ tiền, mặt bên dùng Phong (Block.js). → Tiết kiệm shader cost cho mặt không ai nhìn.
- **Static mesh:** `mesh.matrixAutoUpdate = false; mesh.updateMatrix()` cho vật tĩnh (đường, nhà) — bỏ qua cập nhật matrix mỗi frame.
- **Skybox:** cube images 6 mặt (dawn/ice/powerlines themes).
- **Post:** EffectComposer (RenderPass, FXAA...).

### 1.3 Đường sá & nhà cửa
- City dạng **grid vuông** (gridSize = 5). Đường = `CubeGeometry` dài, texture road với `RepeatWrapping`, repeat theo chiều dài.
- Nhà: mỗi block = **3 box chồng lên nhau**, width/height/depth random trong khoảng → skyline đa dạng mà không cần model. Chân block có vỉa hè (sidewalk box mỏng, texture repeat 5×5).
- Đèn đường: mỗi block cắm 2 cột đèn ở góc đối xứng (Box cao 7 + thanh ngang chữ X).

### 1.4 Xe cộ
- Xe **người lái được** (WASD): `maxSpeed`, `minSpeed` (lùi), `acceleration`, `steeringRadiusRatio`, `tiltAmount` (nghiêng khi cua).
- Xe ráp từ nhiều part OBJ: body, bánh (tire+rim), đèn trước/sau, kính, nội thất, ống xả. Part riêng → animate được (bánh quay, đèn sáng).
- Va chạm: thư viện Ape physics (ContactResolver).

### 1.5 Điểm hay áp dụng được
- ✅ Nhà procedural bằng box chồng random → ý tưởng cho Phase 1 placeholder nhà (nhanh, rẻ, không cần GLB).
- ✅ `matrixAutoUpdate = false` cho vật tĩnh.
- ⚠️ Repo quá cũ (r68, API đã đổi nhiều) — chỉ học ý tưởng, không copy code.

---

## 2. catsjuice/random-city — Procedural City Generator

**Repo:** https://github.com/catsjuice/random-city (Vite + React 19 + Three.js hiện đại, có test + Playwright)

### 2.1 Cấu trúc code
```
src/city/
├── world.js        # data model: nodes/edges (graph đường), buildings, trees, lamps; constants GROUND, ROAD_WIDTH...
├── world.worker.js # generate world trong Web Worker
├── streets.js      # buildStreets(): dựng geometry đường từ graph
├── routes.js       # A* pathfinding (trails, boat routes), CatmullRomCurve3
├── geometry.js     # ⭐ class Batch: gom geometry theo màu → merge thành 1 mesh
├── assets.js       # ⭐ load GLB 1 lần, bake texture→vertex color, merge, dispose gốc
├── renderer.js     # createCity(): scene, instanced traffic, weather, HUD drawCalls
├── lighting.js     # ⭐ night lighting KHÔNG dùng đèn thật: billboard glow + irradiance texture
├── vegetation.js, water.js, grass.js, landscape.js, substrate.js, details.js
public/models/      # Kenney CC0 GLB: cars/, commercial/, suburban/, nature/
```

### 2.2 Kỹ thuật Three.js cốt lõi

**a) Batch — gom geometry theo màu (geometry.js)**
```js
class Batch {
  add(geometry, color)     // gom vào Map<color, geometries[]>
  box / cylinder / sphere / tube(...)  // helper tạo nhanh
  finish(parent) {         // mergeGeometries(parts) → 1 Mesh / 1 màu
    material = MeshStandardMaterial({ color, roughness: 0.86 })
  }
}
```
- Toàn bộ đường, vỉa hè, vạch kẻ, cột đèn, cầu → **mỗi màu chỉ 1 draw call**.
- Xóa `uv`/`tangent` trước khi merge (giảm memory).

**b) ribbon() — dải tam giác dọc polyline**
- Tự build BufferGeometry: mỗi điểm 2 vertex (trái/phải theo pháp tuyến), index strip, `computeVertexNormals`, tự sửa winding nếu normal úp xuống.
- Dùng cho: mặt đường, vỉa hè, vạch kẻ đứt, lối đi bộ.

**c) Đường theo lớp cao độ (streets.js)**
| Lớp | Cao độ | Màu |
|-----|--------|-----|
| Curb (vỉa/lề) | y − 0.02 | `#dddcc6` |
| Asphalt | y + 0.014 | `#626e6b` |
| Vạch biên | y + 0.03 | `#edebd9` |
| Vạch đứt giữa | y + 0.035 | `#e7deb1` |
- Giao lộ: vẽ box curb + box asphalt đè lên, vạch dừng cho từng nhánh.
- Cầu: tube lan can + trụ, ExtrudeGeometry vòm đá có lỗ (shape.holes).

**d) Assets — bake GLB thành vertex color (assets.js)**
- `loadModel()`: load 1 lần → clone geometry × matrixWorld → **sample texture từng vertex** (đọc pixel qua canvas) → `deleteAttribute('uv')`, set `color` + `windowMask` → `mergeGeometries` → center + đặt đáy y=0 → dispose texture/material gốc.
- Cache `Map` theo tên model. `paintedGeometry()`: tint màu tường/mái theo palette.
- Material chung `MeshStandardMaterial({ vertexColors: true })` + `onBeforeCompile`: cửa sổ phát sáng ban đêm (windowMask), tuyết phủ mặt trên (snow × normal.y).

**e) Night lighting KHÔNG dùng PointLight (lighting.js)**
- Đèn đường: **1 InstancedMesh billboard** (shader additive glow) + **1 InstancedMesh pool sáng** dưới đất — hàng trăm bóng = 2 draw call.
- Chiếu sáng mặt đường/nhà: **bake irradiance texture** (DataTexture 512/1024, vẽ quầng sáng từng đèn) → patch mọi MeshStandardMaterial qua `onBeforeCompile` (cộng vào `totalEmissiveRadiance` theo khoảng cách + độ cao).
- Comment gốc: *"without a light loop per lamp, shadow maps per pole, or an extra full-screen bloom pass."*
- Đèn xe: instanced billboard trước (trắng) / sau (đỏ) + chùm sáng, update theo pose xe.

**f) Traffic trên graph (world.js)**
- Agent = `{ edge, t, direction, speed, variant }`. Lane offset = `ROAD_WIDTH * 0.24` (phải đường theo chiều).
- `advanceTraffic()`: t += dir·speed·dt/edge.length; hết edge → chọn edge kế ở node (trừ edge vừa đi).
- Đèn giao thông: `green = (floor(seconds/8) % 2 === 0) === (edge.axis === 'x')` — không cần object đèn thật.
- Car-following: check xe cùng edge cùng chiều trong 1.65m → `waiting = true`.
- Pathfinding A* (thư viện `pathfinding`) cho trail leo núi, boat route; làm mượt bằng `CatmullRomCurve3.getSpacedPoints()`.

**g) Render xe = InstancedMesh theo variant (renderer.js)**
- 5 loại xe → 5 InstancedMesh, `DynamicDrawUsage`, update matrix mỗi frame.
- Pose smoothing: `lerp` vị trí + nội suy yaw có wrap góc (`atan2(sin, cos)`).
- Pitch theo dốc đường: lấy edgeHeight trước/sau → `-atan(slope)`.
- Người đi bộ: instanced body/head/4 limbs, swing tay chân bằng sin.
- HUD hiện `renderer.info.render.calls` để giám sát draw calls.

**h) Web Worker**
- `world.worker.js`: generate toàn bộ world (graph, building, cây) trong worker → `postMessage` về, main thread chỉ build geometry. Render loop không bao giờ stall khi generate.
- `await renderer.compileAsync(scene, camera)` trước khi ẩn loading.

### 2.3 Điểm hay áp dụng được
- ✅✅ **Batch + mergeGeometries theo màu** — giải pháp cho 2500 vạch kẻ đường Tokyo: gom hết thành 1 draw call.
- ✅ **ribbon()** — pattern chuẩn để vẽ đường vành đai/xuyên tâm + vạch kẻ.
- ✅ **Lớp cao độ đường** (curb/asphalt/paint cách nhau 0.01–0.05) — chống z-fighting có hệ thống.
- ✅ **Bake GLB → vertex color + merge** — giảm draw call & memory khi dùng lại model.
- ✅ **Night lighting không PointLight** — khi nào làm đêm thì dùng.
- ✅ **Traffic graph + đèn theo thời gian + car-following** — nâng cấp cho xe Tokyo phase sau.
- ✅ **InstancedMesh per variant + DynamicDrawUsage** — xe Tokyo hiện tại mỗi xe 1 Group; chuyển sang instanced khi tăng số xe.

---

## 3. gorgekara/gridburg — City Builder với Web Worker + IDM Traffic

**Repo:** https://github.com/gorgekara/gridburg (TypeScript + Vite, dev active 09/2026, docs thiết kế rất kỹ trong `docs/superpowers/`)

### 3.1 Cấu trúc code
```
src/
├── sim/
│   ├── worker.ts       # toàn bộ simulation chạy trong Worker (203KB)
│   ├── driver.ts       # ⭐ Intelligent Driver Model (IDM): tăng tốc/phanh mượt
│   ├── trafficSpace.ts # pose xe, overlap, VEHICLE_SCALE
│   └── priority.ts, transit.ts, economy.ts, ...
├── render/
│   ├── scene.ts        # renderer/camera/lights/fog/controls
│   ├── meshBuilder.ts  # ⭐ gom tam giác phẳng vertex-colored: ribbon/band/disc/ring/fan/arrow
│   ├── buildingGeo.ts  # ⭐ class Builder: part màu → merge; dropUnderside()
│   ├── roads.ts        # đường từ segment + lane layout + junction marks (80KB)
│   ├── cars.ts         # InstancedMesh xe
│   ├── carShell.ts     # ⭐ xe procedural từ SIDE PROFILE — "rounded, raked and arched rather than boxed"
│   └── buildings.ts, streetlights.ts, pedestrians.ts, ...
├── roads/
│   ├── network.ts, lanes.ts, signals.ts, crossings.ts, ...
└── docs/superpowers/
    ├── plans/  # freeform-roads, lanes, signals, driver-model...
    └── specs/  # design doc chi tiết từng tính năng
```

### 3.2 Kỹ thuật Three.js cốt lõi

**a) MeshBuilder — 1 geometry cho mọi thứ phẳng (meshBuilder.ts)**
- Gom vertex (pos + color) + index, normal mặc định (0,1,0) vì toàn mặt phẳng ngang.
- Có sẵn: `ribbon()` (dải dọc polyline, half-width thay đổi được từng điểm), `band()` (2 biên độc lập — đường loe/thắt), `disc()`, **`ring(x, z, r0, r1, y, color)`** (vành khuyên — đúng cái Tokyo cần!), `fan()`, `arrow()` (mũi tên).
- `build()` → 1 BufferGeometry → 1 draw call cho toàn bộ mặt đường/vạch kẻ/mũi tên.

**b) Builder — nhà/xe từ part màu (buildingGeo.ts, carShell.ts)**
- `b.box/b.roundBox/b.cyl(...)` với màu từng part → `mergeGeometries` → 1 vertex-colored geometry.
- **`dropUnderside()`**: xóa tam giác mặt đáy không bao giờ nhìn thấy → giảm tris miễn phí.
- **carShell**: xe nặn từ **side profile** (spec: cabin, rake, roof, sill, belt, deck...) → thân xe cong, vát, vòm — *"rounded, raked and arched rather than boxed"*. Có taxi (biển nóc + sọc caro), police (light bar), racer (sọc + cánh gió).
- → Đây đúng là câu trả lời cho yêu cầu "đừng hình hộp" của Tony.

**c) Scene setup (scene.ts)**
- `antialias: true, powerPreference: 'high-performance'`, pixelRatio ≤ 2.
- `PCFShadowMap`, `ACESFilmicToneMapping` (exposure 1.05) — màu điện ảnh.
- `Fog(0xc6e4f5, 120, 280)` — fog cùng màu nền trời.
- ⭐ **`sun.shadow.autoUpdate = false; sun.shadow.needsUpdate = true`** — scene tĩnh thì shadow chỉ render 1 lần. Comment gốc: *"refreshing the shadow map every frame is wasted work."*
- Shadow camera **ôm sát map** (±58 thay vì ±550) → shadow sắc nét với cùng 2048 map.
- `shadow.bias = -0.0008, normalBias = 0.02`.
- Camera: fov 42, near 0.5, far 400; controls giới hạn min/max distance, maxPolarAngle.

**d) Traffic — Intelligent Driver Model (docs/superpowers/specs/2026-09-26-driver-model-design.md)**
- Gia tốc IDM: `a = aMax·(1 − (v/v0)⁴ − (s*/s)²)` — tăng tốc/phanh mượt như xe thật, không giật cục.
- **Tốc độ vào cua: `v = √(aLat · Rmin)`** — Rmin lấy từ Bézier của segment. → Áp dụng trực tiếp: xe vành đai Tokyo chạy chậm lại ở vành nhỏ, nhanh ở vành lớn.
- **Roundabout: nhường đường theo gap thời gian**, không phải khoảng cách.
- Ưu tiên ngã tư theo cấp đường (major/minor arms).
- Tích phân ballistic `p += v·dt + ½a·dt²`, clamp [0, v0].
- Đèn tín hiệu: xe dừng nếu phanh kịp (`v²/2b ≤ khoảng cách`), không thì vượt.
- Worker chạy sim ở `SIM_HZ` cố định → post frame gọn (`Float32Array` poses) → main thread chỉ update InstancedMesh.

**e) Render xe**
- Pool cố định `MAX_CARS`, geometry theo loại (sedan/van/bus/truck/taxi...), xe con/van sơn trắng rồi **tint per-instance** (instanceColor) → 1 geometry nhiều màu xe.
- Đèn pha/hậu là part của geometry (lamp/tail color), không phải mesh riêng.

### 3.3 Điểm hay áp dụng được
- ✅✅ **MeshBuilder.ring()** — vẽ 5 vành đai Tokyo = 5 lệnh gọi, 1 draw call.
- ✅ **Tách lớp render phẳng** (đường/vạch/mũi tên) khỏi vật 3D — 1 material vertexColors.
- ✅ **shadow.autoUpdate = false** cho scene tĩnh — tăng fps miễn phí.
- ✅ **Shadow camera ôm sát map** — Tokyo đang để ±550 (quá rộng → shadow mờ); thu lại vừa map.
- ✅ **Tốc độ cua √(aLat·R)** — xe vành đai Tokyo mượt mà, đúng vật lý.
- ✅ **Xe từ side profile** (carShell) — hướng nặn xe phase 3, hết "hình hộp".
- ✅ **dropUnderside()** — micro-opt khi tự build geometry.
- ✅ **ACES tone mapping** — màu đẹp hơn cho bản desktop.
- ✅ **Design docs trước khi code** (`docs/superpowers/specs/`) — đúng tinh thần ECC PLAN.

---

## 4. Bảng so sánh kỹ thuật

| Tiêu chí | poppe/Three.js-City (2013) | catsjuice/random-city | gorgekara/gridburg (2026) |
|---|---|---|---|
| Ngôn ngữ/build | JS thuần, three r68 | JS + React + Vite | TypeScript + Vite |
| Chiến lược draw call | Mesh riêng từng vật | **Batch: merge theo màu → 1 mesh/màu** | **MeshBuilder: 1 geometry phẳng** + Builder merge part |
| Đường | Box + texture repeat | **ribbon() custom geometry**, lớp cao độ | ribbon/band/ring + lane layout |
| Vạch kẻ | (texture) | ribbon nhỏ, cùng Batch | junctionMarks từ lane data |
| Nhà | Box/cylinder chồng random | Kenney GLB bake → vertex color | Builder procedural, dropUnderside |
| Xe | Ráp part OBJ, người lái | **InstancedMesh/variant**, pose lerp | InstancedMesh, **carShell từ side profile** |
| Traffic AI | Không (người lái) | Graph edge/t + đèn theo giờ + car-following | **IDM**, cua √(aLat·R), roundabout gap-time |
| Pathfinding | Không | A* (pathfinding lib) + CatmullRom | Network graph + signals |
| Hiệu năng | matrixAutoUpdate=false | **Web Worker** generate, compileAsync | **Sim trong Worker**, shadow 1 lần |
| Đêm | Không | **Irradiance texture + billboard**, 0 PointLight | Day/night cycle |
| Shadow | Cơ bản | PCF (không rõ) | PCF, autoUpdate=false, camera ôm map |
| Tone | Không | Không | **ACESFilmic** |
| Test | Không | Node test + Playwright | Node test (.mjs) |

---

## 5. Bài học áp dụng cho Tokyo City (ưu tiên)

### Bài học 1 — Gom geometry tĩnh: vạch kẻ 2500 mesh → 1 draw call ⭐⭐⭐
**Nguồn:** catsjuice `Batch`, gridburg `MeshBuilder`.
**Vấn đề Tokyo:** từng bỏ vạch kẻ vì 2500 mesh quá nặng.
**Áp dụng:** Viết `Batch` (hoặc `MeshBuilder`) cho Tokyo: đường, vạch kẻ, vỉa hè, mũi tên gom theo màu → `mergeGeometries` → mỗi màu 1 mesh. Phase 3 bật lại vạch kẻ mà không sợ nặng.

### Bài học 2 — Vẽ vành đai bằng ring(), xuyên tâm bằng ribbon() ⭐⭐⭐
**Nguồn:** gridburg `MeshBuilder.ring(x, z, r0, r1, y, color)`, catsjuice `ribbon()`.
**Áp dụng:** 5 vành đai = 5 lệnh `ring()`; 12 xuyên tâm = 12 `ribbon()`; tất cả vào 1 geometry asphalt + 1 geometry paint. Thay thế 17 mesh riêng lẻ hiện tại. Giao lộ hết z-fighting nhờ lớp cao độ cố định (bài học 3).

### Bài học 3 — Lớp cao độ chuẩn cho đường ⭐⭐
**Nguồn:** catsjuice (curb −0.02 / asphalt +0.014 / paint +0.03~0.035).
**Áp dụng:** Chuẩn hóa Tokyo: đất 0 → curb 0.08 → asphalt 0.10 → paint 0.13 → xe 0.20. Mọi module đường/vạch tuân thủ, khỏi đoán mỗi lần.

### Bài học 4 — Xe: InstancedMesh + pose smoothing ⭐⭐
**Nguồn:** catsjuice (`DynamicDrawUsage`, lerp pose, yaw wrap `atan2(sin,cos)`), gridburg (pool MAX_CARS, tint per-instance).
**Áp dụng:** Phase 1 giữ Group/xe (16 xe ok). Khi tăng xe: chuyển sang InstancedMesh theo màu, update matrix mỗi frame, pose lerp cho mượt. Đèn xe làm part của geometry, không mesh riêng (tránh lặp lỗi "2 mặt trời").

### Bài học 5 — Traffic mượt: tốc độ cua √(aLat·R) + IDM-lite ⭐⭐
**Nguồn:** gridburg driver-model spec.
**Áp dụng:** Xe vành đai Tokyo: `v = min(vMax, √(aLat·R))` — vành trong (R=80) chạy chậm hơn vành ngoài (R=400), nhìn tự nhiên. Thêm car-following đơn giản (giữ khoảng cách xe trước) khi xe đông.

### Bài học 6 — Shadow tĩnh: render 1 lần ⭐
**Nguồn:** gridburg `sun.shadow.autoUpdate = false`.
**Áp dụng:** Nhà/cây/đường Tokyo đều tĩnh → shadow chỉ cần render 1 lần (hoặc khi thêm vật). Tiết kiệm GPU mỗi frame. Kèm theo: thu shadow camera vừa map (±560 hiện tại quá rộng → shadow mờ; cân nhắc ±520).

### Bài học 7 — Đêm không PointLight + xe từ side profile (phase 3) ⭐
**Nguồn:** catsjuice irradiance texture + instanced glow billboard; gridburg carShell.
**Áp dụng:** Khi làm chế độ đêm: bake quầng sáng đèn vào texture, cộng emissive qua `onBeforeCompile` — 0 PointLight, 0 bloom pass. Khi nặn xe mới: đi từ side profile (carShell pattern) để hết "hình hộp" theo đúng yêu cầu của Tony.

---

## 6. Nguồn đã đọc
- poppe: `T3/js/controller/World.js`, `T3/js/model/Car.js`, `T3/js/model/building/{Block,RoundBlock,Classic}.js`, `T3/js/ObjectManager.js`
- catsjuice: `src/city/{world,streets,routes,geometry,assets,renderer,lighting}.js`, `src/city/world.worker.js`
- gridburg: `PLAN.md`, `src/sim/{worker,driver→spec,trafficSpace}.ts`, `src/render/{scene,meshBuilder,roads,cars,carShell,buildingGeo}.ts`, `docs/superpowers/specs/2026-09-26-driver-model-design.md`

*Báo cáo RESEARCH — chưa có code, chờ PLAN duyệt.*
