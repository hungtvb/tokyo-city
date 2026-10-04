# TASK BREAKDOWN — Phase 1: Base Map Tròn
**Trạng thái:** Chờ duyệt | **Ngày tạo:** 2026-10-04

> Quy tắc: Task chỉ chuyển sang IMPLEMENT khi Tony duyệt. Không code trước.

---

## Nhóm 1: Khung sườn

### 1.1 Viết `index.html`
- **Output:** `index.html`
- **Nội dung:** HTML shell, HUD hiển thị "TOKYO 3D v1", importmap three.js, `<script src="js/main.js?v=1">`
- **Tiêu chí đạt:** Mở trang load được module, HUD hiện v1

### 1.2 Viết `css/style.css`
- **Output:** `css/style.css`
- **Nội dung:** Style cho loader, topbar, menu panel, nút bấm
- **Tiêu chí đạt:** Menu, loading, topbar hiển thị đúng, không vỡ layout

### 1.3 Copy `lib/` three.js
- **Output:** 4 file (`three.module.js`, `OrbitControls.js`, `GLTFLoader.js`, `BufferGeometryUtils.js`)
- **Tiêu chí đạt:** Import `three` thành công, không lỗi 404

### 1.4 Viết `js/config.js` + `js/loaders.js`
- **Output:** 2 file
- **Nội dung:** Hằng số chung + hàm `loadGLB(path)` dùng GLTFLoader
- **Tiêu chí đạt:** Load được 1 file GLB test, xử lý lỗi rõ ràng

---

## Nhóm 2: Scene nền

### 2.1 Viết `js/scene.js`
- **Output:** `js/scene.js`, export `createScene()`
- **Thông số:**
  - Renderer: antialias=true, pixelRatio=min(dpr,2), shadow PCFSoft
  - Camera: near=2, far=1500, pos (250,180,250)
  - Fog: `new THREE.Fog(0x87CEEB, 300, 900)`
  - Đất: `CircleGeometry(560, 48)`, màu `0x7a9a6a`
  - Mặt trời: DirectionalLight (50,80,30), shadow camera ±550, bias -0.0002
- **Tiêu chí đạt:** Đất xanh, trời xanh, bóng đổ mềm, không lỗi

### 2.2 Verify scene trắng
- **Output:** Screenshot
- **Tiêu chí đạt:** Chỉ có đất + trời, không lỗi console

---

## Nhóm 3: Đường sá

### 3.1 Viết `js/streets.js` (đường)
- **Output:** `js/streets.js`, export `buildStreets()`, hằng số `MAP`
- **Thông số MAP:**
  - radius=500, plazaR=15, roundaboutOuter=25
  - rings=[80,160,240,320,400], ringWidth=12
  - radials=12, radialWidth=10, roadY=0.1
- **Cao độ:** đất 0 → vành đai/bùng binh 0.10 → xuyên tâm 0.14
- **Kỹ thuật:** Xuyên tâm dùng `geometry.rotateX(-π/2)` bake phẳng + `rotation.y` (KHÔNG dùng rotation.x+z)
- **Vạch kẻ:** TẠM BỎ phase 1
- **Tiêu chí đạt:** Sân tròn, bùng binh, 5 vành, 12 xuyên tâm đúng vị trí

### 3.2 Viết `getBlockCenters()`
- **Output:** Hàm trong streets.js, trả về 60 block `{x, z, angle, type}`
- **5 vành:** office (32–70) / commercial (90–150) / residential (170–230) / park (250–310) / garden (330–390)
- **Tiêu chí đạt:** Đủ 60 block, tọa độ đúng, type đúng

### 3.3 Verify đường
- **Output:** Screenshot top-down
- **Tiêu chí đạt:** Vành tròn đều, xuyên tâm thẳng, không vệt trắng, không nhấp nháy

---

## Nhóm 4: Công trình

### 4.1 Upload models GLB
- **Output:** 11 file trong `models/`
- **Danh sách:** tokyo_tower, office_a/b/c, jp_house, jp_car×4, sakura, streetlight
- **Tiêu chí đạt:** Đủ file, dung lượng đúng

### 4.2 Viết `js/tokyo_tower.js`
- **Output:** Tháp ở (0, 0.1, 0)
- **Kỹ thuật:** Giữ file Z-up, xoay ở group level (`rotation.x = π/2`)
- **Tiêu chí đạt:** Tháp đứng thẳng, cao ~15m, màu đỏ-cam, lattice đều

### 4.3 Viết `js/buildings.js`
- **Output:** 24 tòa văn phòng
- **Vành 1 (office):** 12 tòa full size | **Vành 2 (commercial):** 12 tòa scale 0.7
- **Vị trí:** y=0.05, xoay mặt về tâm
- **Tiêu chí đạt:** Không nằm trên đường, không xuyên nhau

### 4.4 Viết `js/houses.js`
- **Output:** 24 nhà Nhật
- **Vành 3 (residential):** 12 nhà | **Vành 5 (garden):** 12 nhà scale 0.85
- **Tiêu chí đạt:** y=0.05, không xuyên nhau

### 4.5 Viết `js/nature.js`
- **Output:** 12 cây sakura ở vành 4 (park)
- **Tiêu chí đạt:** y=0.05, phân bố đều

### 4.6 Verify công trình
- **Output:** Screenshot
- **Tiêu chí đạt:** Tháp đúng dáng, nhà không trên đường

---

## Nhóm 5: Xe cộ

### 5.1 Viết `js/cars.js`
- **Output:** 16 xe (12 vành đai + 4 xuyên tâm)
- **Xe vành đai:** chuyển động tròn, `rotation.y = atan2(-cos·dir, -sin·dir)`
- **Xe xuyên tâm:** đi thẳng, `rotation.y = -angle` (đi ra) hoặc `-angle+π` (đi vào)
- **Kỹ thuật:** Đầu xe +X (đã xác minh bằng trụ A)
- **Tiêu chí đạt:** Xe ở y=0.20, đúng làn

### 5.2 Verify hướng xe
- **Output:** Quan sát 30s
- **Tiêu chí đạt:** Đầu xe theo hướng chạy, không chạy ngang, không xuyên tường

---

## Nhóm 6: Hoàn thiện

### 6.1 Viết `js/main.js`
- **Output:** Khởi tạo, loading progress, menu (Tháp/Toàn cảnh/Tự do), toggle xe
- **Tiêu chí đạt:** Menu hoạt động, không lỗi

### 6.2 `node --check` toàn bộ
- **Tiêu chí đạt:** 10 file pass, không lỗi syntax

### 6.3 Push + version v1
- **Output:** 27 file trên repo, HUD v1, mọi import có `?v=1`
- **Tiêu chí đạt:** Đủ file, version đồng bộ

### 6.4 Verify live (desktop)
- [ ] HUD hiện v1
- [ ] Toàn cảnh: map tròn, 5 vành, 12 xuyên tâm
- [ ] Tháp đứng giữa, màu đỏ-cam
- [ ] Xe chạy đúng hướng 30s
- [ ] Di camera: không nhấp nháy, không vệt trắng
- [ ] Console không lỗi đỏ

---

**Tổng: 19 task | Trạng thái: CHỜ DUYỆT**
