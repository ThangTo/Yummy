/**
 * Chuyển đổi GeoJSON (map_tool/vn.json) về dạng ProvinceFeature[] mà client đang dùng:
 * [
 *   {
 *     name: string,
 *     center?: { latitude, longitude },
 *     coordinates: { latitude, longitude }[][]
 *   }
 * ]
 *
 * Cách chạy:
 *   node map_tool/convert_to_client.js
 *
 * Input mặc định: map_tool/vn.json (FeatureCollection)
 * Output mặc định: client/assets/data/vn.json
 */

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, 'vn.json');
const OUTPUT = path.join(__dirname, '..', 'client', 'assets', 'data', 'vn.json');

const toLatLng = (coord) => ({
  longitude: coord[0],
  latitude: coord[1],
});

const geometryToPolygons = (geom) => {
  if (!geom || !geom.type || !geom.coordinates) return [];

  if (geom.type === 'Polygon') {
    return geom.coordinates.map((ring) => ring.map(toLatLng));
  }

  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.flatMap((poly) => poly.map((ring) => ring.map(toLatLng)));
  }

  return [];
};

const computeCenter = (ring) => {
  if (!ring || !ring.length) return undefined;
  const lat = ring.reduce((s, p) => s + p.latitude, 0) / ring.length;
  const lng = ring.reduce((s, p) => s + p.longitude, 0) / ring.length;
  return { latitude: lat, longitude: lng };
};

const main = () => {
  console.log('⏳ Đang đọc:', INPUT);
  const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

  const features = Array.isArray(raw.features) ? raw.features : [];
  if (!features.length) {
    console.error('❌ Không tìm thấy features trong vn.json');
    process.exit(1);
  }

  const provinces = features
    .map((f) => {
      const name =
        f?.properties?.ten_tinh || f?.properties?.name || f?.properties?.Name || 'Không tên';
      const coordinates = geometryToPolygons(f.geometry);
      if (!coordinates.length) return null;
      const center = computeCenter(coordinates[0]);
      return { name, center, coordinates };
    })
    .filter(Boolean);

  console.log(`✅ Đã chuyển đổi ${provinces.length} tỉnh/thành phố.`);

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(provinces));
  console.log('💾 Đã ghi file:', OUTPUT);
};

main();
