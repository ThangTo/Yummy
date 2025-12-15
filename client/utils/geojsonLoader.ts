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

// Cache để tránh load lại file 32MB nhiều lần
let cachedProvinces: ProvinceFeature[] | null = null;
let isLoading = false;
let loadPromise: Promise<ProvinceFeature[]> | null = null;

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

/**
 * Load GeoJSON data với caching để tối ưu performance
 * File 32MB chỉ được load 1 lần và cache lại
 */
export const loadProvincesGeoJSON = async (): Promise<ProvinceFeature[]> => {
  // Nếu đã cache, trả về ngay
  if (cachedProvinces) {
    return cachedProvinces;
  }

  // Nếu đang load, đợi promise hiện tại
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Bắt đầu load
  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    try {
      // Load file trong background để không block UI
      // Sử dụng setTimeout để defer loading
      setTimeout(() => {
        try {
          console.log('🔄 Loading provinces GeoJSON (32MB)...');
          const jsonModule = require('../assets/data/vn.json');

          // Parse và cache
          cachedProvinces = jsonModule as ProvinceFeature[];
          isLoading = false;
          console.log('✅ Provinces loaded and cached');
          resolve(cachedProvinces);
        } catch (error) {
          isLoading = false;
          console.error('❌ Lỗi khi load dữ liệu tỉnh:', error);
          reject(error);
        }
      }, 0);
    } catch (error) {
      isLoading = false;
      console.error('❌ Lỗi khi load dữ liệu tỉnh:', error);
      reject(error);
    }
  });

  return loadPromise;
};

/**
 * Preload GeoJSON data ngay khi app khởi động
 * Tương tự như ai-service load models khi startup
 * Hàm này không block và chạy trong background
 */
export const preloadProvincesGeoJSON = (): void => {
  // Nếu đã cache hoặc đang load, không làm gì
  if (cachedProvinces || isLoading) {
    return;
  }

  // Bắt đầu preload trong background
  console.log('🚀 Preloading provinces GeoJSON data...');
  loadProvincesGeoJSON().catch((error) => {
    // Log error nhưng không throw để không crash app
    console.error('⚠️ Failed to preload provinces data:', error);
  });
};

/**
 * Clear cache (dùng khi cần reload)
 */
export const clearProvincesCache = (): void => {
  cachedProvinces = null;
  loadPromise = null;
  isLoading = false;
};
