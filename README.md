# Tokyo 3D City

Game khám phá thành phố Tokyo 3D trên nền web (Three.js). Map hình tròn 1km, tháp Tokyo ở trung tâm, mạng lưới đường vành đai + xuyên tâm.

**Live:** https://hungtvb.github.io/tokyo-city/

## Docs

| File | Nội dung |
|------|----------|
| [IMPLEMENT_PLAN_PHASE1.md](docs/IMPLEMENT_PLAN_PHASE1.md) | Kế hoạch implement Phase 1: base map tròn |
| [CONCEPT.md](docs/CONCEPT.md) | Concept art và định hướng visual |

## Cấu trúc

```
├── index.html      # HTML shell, HUD
├── css/            # Giao diện
├── lib/            # Three.js
├── models/         # File GLB
├── js/             # Code game (mỗi phần 1 file)
└── docs/           # Tài liệu
```

## Quy tắc version

Mỗi lần push phải bump version trong HUD và `?v=N` cho mọi file JS để tránh cache.
