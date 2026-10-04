# TASK BREAKDOWN — Phase 2: Các Khu Chức Năng
**Trạng thái:** Chờ duyệt | **Ngày tạo:** 2026-10-04

> Quy tắc: Task chỉ chuyển sang IMPLEMENT khi Tony duyệt. Không code trước.
> Version tiếp theo: v2

---

## Nhóm 1: Công viên + Hồ nước (vành 4, r 250–310)

### 1.1 Copy model cây + đá + thuyền từ island-loop
- **Output:** `models/jabami_tree.glb`, `models/rock.glb`, `models/boat.glb` trong tokyo-city
- **Nguồn:** `~/workspace/island-loop/models/jabami/jabami_anime_tree_v3.glb` (1.3k tris), `stylized_rock.glb`, `p2/boat/wooden_fishing_boat.glb`
- **Tiêu chí đạt:** 3 file copy xong, `node --check` không cần (file binary), dung lượng hợp lý

### 1.2 Viết `js/park.js` — hồ nước
- **Output:** Hồ tròn ở 1 block vành 4 (chọn block đầu tiên, angle=15°)
- **Kỹ thuật:** `CircleGeometry(r=25)` + `MeshStandardMaterial` màu xanh nước (0x4a90d9, roughness 0.1, metalness 0.1), y = 0.02. Viền đá: 8 cục rock xếp quanh.
- **Tiêu chí đạt:** Hồ tròn, nước bóng nhẹ, đá không chìm

### 1.3 Viết `js/park.js` — đường dạo + cây
- **Output:** Đường dạo quanh hồ + cây xanh
- **Kỹ thuật:** `Batch.ribbon()` vẽ đường dạo quanh hồ (màu plaza). Trồng 12 cây jabami quanh hồ + 12 cây ở các block park còn lại.
- **Tiêu chí đạt:** Đường dạo khép vòng, cây không nằm trên đường

### 1.4 Thuyền trên hồ
- **Output:** 2 thuyền đậu trên hồ
- **Tiêu chí đạt:** Thuyền nổi trên mặt nước (y = 0.1), không chìm

### 1.5 Verify công viên
- **Output:** Screenshot
- **Tiêu chí đạt:** Nhìn thấy hồ xanh, đường dạo, cây, thuyền

---

## Nhóm 2: Siêu thị (vành 2, r 90–150)

### 2.1 Viết `js/supermarket.js` — tòa nhà
- **Output:** Siêu thị ở 2 block vành 2 (angle=15°, 45°)
- **Kỹ thuật procedural:** Box chính (40×12×25m) + mái phẳng + mặt tiền kính (box mỏng màu xanh trong) + biển hiệu (box mỏng trên nóc, màu đỏ)
- **Màu:** tường trắng 0xf5f5f5, kính 0x88ccff, biển 0xdd3333
- **Tiêu chí đạt:** Nhìn ra siêu thị, không phải hộp thô (có cửa kính, biển hiệu phân biệt)

### 2.2 Bãi đậu xe siêu thị
- **Output:** Sân + vạch đậu xe trước siêu thị
- **Kỹ thuật:** `Batch.disc()` sân + `Batch.ribbon()` vạch trắng (paint layer)
- **Tiêu chí đạt:** Vạch thẳng hàng, không z-fighting

### 2.3 Verify siêu thị
- **Output:** Screenshot gần
- **Tiêu chí đạt:** Nhận ra siêu thị, có xe đậu (dùng xe tĩnh từ jp_car)

---

## Nhóm 3: Trường học (vành 3, r 170–230)

### 3.1 Viết `js/school.js` — tòa nhà
- **Output:** Trường học ở 2 block vành 3
- **Kỹ thuật procedural:** Tòa nhà chữ U (3 box) + cửa sổ đều (box nhỏ màu xanh lặp lại) + sân trường (Batch.disc màu đất nện)
- **Màu:** tường vàng nhạt 0xf5e6a3 (kiểu trường Nhật), mái xám
- **Tiêu chí đạt:** Nhìn ra trường học, có sân rộng

### 3.2 Cột cờ + sân chơi
- **Output:** Cột cờ giữa sân + vạch sân bóng
- **Kỹ thuật:** Cylinder cao 8m + box cờ. Vạch sân: Batch.ribbon trắng
- **Tiêu chí đạt:** Cờ đứng thẳng, vạch sân đều

### 3.3 Verify trường học
- **Output:** Screenshot
- **Tiêu chí đạt:** Nhận ra trường học Nhật Bản

---

## Nhóm 4: Khu vui chơi (vành 5, r 330–390)

### 4.1 Viết `js/playground.js` — cầu trượt
- **Output:** Cầu trượt ở 1 block vành 5
- **Kỹ thuật procedural:** Thang (box nghiêng) + máng trượt (box cong dùng CylinderGeometry cắt nửa) + trụ
- **Màu:** sặc sỡ (đỏ, vàng, xanh)
- **Tiêu chí đạt:** Nhìn ra cầu trượt, không phải hộp

### 4.2 Xích đu + bập bênh
- **Output:** Khung xích đu (2 trụ + thanh ngang + 2 dây + ghế), bập bênh (thanh dài + điểm tựa)
- **Tiêu chí đạt:** Đủ 3 món đồ chơi, đặt cách nhau ≥5m

### 4.3 Sân cát
- **Output:** Nền cát dưới khu vui chơi
- **Kỹ thuật:** Batch.disc màu cát 0xe8d8a0
- **Tiêu chí đạt:** Đồ chơi nằm trên cát

### 4.4 Verify khu vui chơi
- **Output:** Screenshot
- **Tiêu chí đạt:** Nhìn ra khu vui chơi trẻ em, màu sắc tươi

---

## Nhóm 5: Hoàn thiện

### 5.1 Cập nhật `js/main.js` — import module mới
- **Output:** main.js import park, supermarket, school, playground
- **Tiêu chí đạt:** Không lỗi import

### 5.2 Bump version v1 → v2
- **Output:** HUD v2, mọi import `?v=2`
- **Tiêu chí đạt:** Version đồng bộ

### 5.3 `node --check` toàn bộ
- **Tiêu chí đạt:** Pass hết

### 5.4 Push + verify live
- **Tiêu chí đạt:** Đủ file trên repo, site hiện v2

---

**Tổng: 16 task | Trạng thái: CHỜ DUYỆT**
