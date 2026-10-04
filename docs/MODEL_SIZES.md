# KÍCH THƯỚC MODEL (đo thật từ GLB)
**Ngày:** 2026-10-04

| Model | Rộng (X) | Cao (Y) | Sâu (Z) |
|-------|----------|---------|---------|
| boat | 197.0m | 80.3m | 148.0m |
| jp_car | 4.0m | 1.8m | 1.7m |
| jp_car_blue | 4.0m | 1.8m | 1.7m |
| jp_car_red | 4.0m | 1.8m | 1.7m |
| jp_car_yellow | 4.0m | 1.8m | 1.7m |
| jp_house | 46m | 22.7m | 43.1m |
| office_a | 120m | 2m | 120m |
| office_b | 120m | 2m | 120m |
| office_c | 120m | 15.7m | 120m |
| sakura | 5.3m | 5.2m | 5.1m |
| streetlight | 1.6m | 6.1m | 0.7m |
| tokyo_tower | 15.7m | 13.8m | 27.7m |

## SCALE ĐỀ XUẤT

Block khả dụng = (2πr/12) - 10m đường. Scale = (khả dụng × 0.7) / model_size

| Vành | rMid | Khả dụng | Model | Size | Scale | Kích thước sau scale |
|------|------|----------|-------|------|-------|----------------------|
| office | 51m | 16.7m | office_a | 120m | 0.097 | 11.6m |
| commercial | 120m | 52.8m | office_a | 120m | 0.308 | 37.0m |
| residential | 200m | 94.7m | jp_house | 46m | 1.441 | 66.3m |
| garden | 360m | 178.5m | jp_house | 46m | 2.716 | 124.9m |
