// utils/geojsonLoader.ts

// Định nghĩa kiểu dữ liệu cho Tỉnh
export interface ProvinceFeature {
  name: string;
  center?: {
    latitude: number;
    longitude: number;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  }[][]; // Mảng 2 chiều vì 1 tỉnh có thể có nhiều vùng (MultiPolygon)
}

// Hàm chuẩn hóa tên để so sánh (bỏ dấu, thường hóa)
export const normalizeProvinceName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s*(tinh|thanh pho|tp\.?)\s*/gi, '') // Bỏ các tiền tố hành chính (đã bỏ dấu rồi)
    .trim();
};

export const loadProvincesGeoJSON = async (): Promise<ProvinceFeature[]> => {
  try {
    // Cách 1: Nếu file nhỏ, import trực tiếp (Khuyên dùng cho app đơn giản)
    // return require('../assets/data/vietnam_provinces.json');

    // Cách 2: Nếu file lớn, load async
    // Giả sử bạn import file json như một module hoặc dùng Asset
    const jsonModule = require('../assets/data/vietnam_provinces.json');
    return jsonModule as ProvinceFeature[];
  } catch (error) {
    console.error('Lỗi khi load dữ liệu tỉnh:', error);
    return [];
  }
};
