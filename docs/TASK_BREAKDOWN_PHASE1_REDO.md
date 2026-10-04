# TASK BREAKDOWN — Phase 1 REDO: Base Map Tròn
**Trạng thái:** Chờ duyệt | **Ngày tạo:** 2026-10-04 (làm lại từ đầu)

> Bài học từ build cũ: scale sai, layout thưa, trung tâm trơ trụi, không test local.
> Rule mới: test local (logic + hình ảnh) trước khi push.

---

## Nhóm 0: Chuẩn bị & đo đạc

### 0.1 Đo kích thước thật của mọi model
- **Output:** Bảng kích thước trong `docs/MODEL_SIZES.md`
- **Cách làm:** Python đọc GLB bounds, ghi ra W×H×D mét
- **Tiêu chí đạt:** Có số đo của office_a/b/c, jp_house, jp_car, sakura, tokyo_tower, streetlight

### 0.2 Tính scale đúng cho từng vành
- **Output:** Bảng scale trong `docs/MODEL_SIZES.md`
- **Cách làm:** Block khả dụng = (2πr/12) - 10m đường. Scale = (block × 0.7) / model_size
- **Tiêu chí đạt:** Mọi model vừa block, không đè đường

### 0.3 Setup local test
- **Output:** `test/local-server.sh` + `test/screenshot.js` (Playwright)
- **Tiêu chí đạt:** Chạy 1 lệnh ra được screenshot localhost

---

## Nhóm 1: Trung tâm (làm trước, là điểm nhấn)

### 1.1 Quảng trường tháp Tokyo
- **Output:** `js/plaza.js`
- **Chi tiết:** Sân gạch r=15 (màu plaza), 8 bồn hoa (cylinder + cây nhỏ), 8 ghế đá (box), 4 lối đi bộ ra 4 hướng
- **Tiêu chí đạt:** Nhìn từ trên ra dáng quảng trường, không phải vòng tròn trơn

### 1.2 Vòng xoay + cây + đèn quanh quảng trường
- **Output:** Đường vành r=15-25, 12 cây, 8 đèn đường
- **Tiêu chí đạt:** Cây đều, đèn đứng thẳng

### 1.3 Test local trung tâm
- **Output:** Screenshot vs reference
- **Tiêu chí đạt:** Logic OK + hình ảnh đạt (không trơ trụi)

---

## Nhóm 2: Đường sá

### 2.1 Vẽ đường bằng Batch
- **Output:** `js/streets.js` (dùng Batch từ bản cũ)
- **Chi tiết:** 5 vành đai + 12 xuyên tâm, cao độ chuẩn
- **Tiêu chí đạt:** Đường đều, không z-fighting ở ngã tư

### 2.2 Vạch kẻ đường bằng Batch
- **Output:** Vạch tim đứt + vạch biên cho vành đai và xuyên tâm
- **Kỹ thuật:** Batch gom hết thành 1-2 draw call (bài học từ research)
- **Tiêu chí đạt:** Có vạch kẻ, không tăng draw call đáng kể

### 2.3 Test local đường
- **Output:** Screenshot top-down vs reference ảnh 1
- **Tiêu chí đạt:** Đường chằng chịt như reference

---

## Nhóm 3: Nhà cửa (mật độ cao)

### 3.1 Cụm văn phòng vành 1
- **Output:** Mỗi block 3-4 tòa sát nhau (dùng scale từ 0.2)
- **Tiêu chí đạt:** Nhìn từ trên thấy cụm nhà đầy đặn, không lọt thỏm

### 3.2 Nhà thương mại vành 2
- **Output:** Mỗi block 2-3 nhà
- **Tiêu chí đạt:** Mật độ cao hơn bản cũ

### 3.3 Nhà dân vành 3 + 5
- **Output:** Mỗi block 4-5 nhà Nhật
- **Tiêu chí đạt:** San sát như phố thật

### 3.4 Cây xanh vành 4
- **Output:** Công viên cây dày
- **Tiêu chí đạt:** Mảng xanh rõ rệt

### 3.5 Test local nhà cửa
- **Output:** Screenshot vs reference
- **Tiêu chí đạt:** Mật độ đạt 70%+ so với reference

---

## Nhóm 4: Chi tiết phố

### 4.1 Đèn đường
- **Output:** Đèn dọc vành đai (mỗi 30m 1 cột)
- **Tiêu chí đạt:** Đèn đứng đều, thẳng hàng

### 4.2 Xe cộ
- **Output:** 16 xe chạy (dùng code cũ đã đúng)
- **Tiêu chí đạt:** Chạy đúng hướng, tốc độ theo √(a·R)

### 4.3 Test local tổng thể
- **Output:** 3 screenshot (toàn cảnh, trung tâm, góc phố)
- **Tiêu chí đạt:** Logic OK + hình ảnh đối chiếu reference đạt 60%+

---

## Nhóm 5: Push

### 5.1 Bump version v1 (làm lại từ v1)
- **Tiêu chí đạt:** HUD v1, mọi import ?v=1

### 5.2 Push lên repo
- **Tiêu chí đạt:** Đủ file, test local đã pass

---

**Tổng: 16 task | Trạng thái: CHỜ DUYỆT**
**Điểm khác biệt so với lần trước:**
- Đo model TRƯỚC khi code (0.1, 0.2)
- Setup test local TRƯỚC khi code (0.3)
- Mỗi nhóm có test local riêng (1.3, 2.3, 3.5, 4.3)
- Mật độ nhà cao (cụm 3-5 nhà/block)
- Trung tâm làm điểm nhấn (quảng trường)
