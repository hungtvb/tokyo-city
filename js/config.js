// config.js - Hằng số toàn cục Tokyo City Phase 1
export const VERSION = 'v1';

// Lớp cao độ chuẩn (nguồn: catsjuice streets.js)
// Mọi module đường/vạch/công trình PHẢI tuân thủ để tránh z-fighting
export const LAYER_Y = {
  ground: 0,       // mặt đất
  curb: 0.08,      // vỉa hè / lề đường
  asphalt: 0.10,   // mặt đường nhựa
  paint: 0.13,     // vạch kẻ, sơn đường
  building: 0.05,  // chân nhà, cây
  car: 0.20,       // gầm xe
};

// Thông số map
export const MAP = {
  radius: 500,
  plazaR: 15,              // sân tháp Tokyo
  roundaboutOuter: 25,     // bùng binh ngoài
  rings: [80, 160, 240, 320, 400],
  ringWidth: 12,
  radials: 12,
  radialWidth: 10,
};

// Màu sắc
export const COLORS = {
  asphalt: 0x3a3f44,
  curb: 0x9a9a98,
  paint: 0xf5f5f0,
  plaza: 0xb8b8b0,
  grass: 0x7a9a6a,
};
