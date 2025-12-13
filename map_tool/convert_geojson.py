import json
from shapely.geometry import shape, MultiPolygon, Polygon

# Tên file đầu vào và đầu ra
INPUT_FILE = 'export.geojson'
OUTPUT_FILE = 'vietnam_provinces.json'

def parse_geometry(geom):
    """Chuyển đổi geometry thành danh sách các mảng tọa độ [{latitude, longitude}]"""
    polygons = []
    
    # Xử lý nếu là MultiPolygon (nhiều đảo/vùng rời rạc) hoặc Polygon đơn
    if geom.geom_type == 'Polygon':
        geoms = [geom]
    elif geom.geom_type == 'MultiPolygon':
        geoms = geom.geoms
    else:
        return []

    for poly in geoms:
        # Lấy đường viền ngoài (exterior ring)
        coords = list(poly.exterior.coords)
        # Chuyển đổi sang format object {latitude, longitude}
        formatted_coords = [{"latitude": lat, "longitude": lon} for lon, lat in coords]
        
        # Đơn giản hóa đa giác để giảm dung lượng file (tùy chọn, ở đây giữ nguyên hoặc simplify nhẹ)
        # poly_simplified = poly.simplify(0.001, preserve_topology=True) 
        
        polygons.append(formatted_coords)
        
    return polygons

def main():
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        features = data.get('features', [])
        provinces = []

        print(f"Đang xử lý {len(features)} đối tượng...")

        for feature in features:
            props = feature.get('properties', {})
            geom_data = feature.get('geometry')
            
            if not geom_data:
                continue

            # 1. Lấy tên tỉnh (thử các key phổ biến trong OSM)
            name = props.get('name') or props.get('name:en') or props.get('Name')
            if not name:
                continue

            # 2. Xử lý hình học bằng Shapely
            shapely_geom = shape(geom_data)
            
            # 3. Tính tâm (Centroid) để đặt Marker
            centroid = shapely_geom.centroid
            center = {
                "latitude": centroid.y,
                "longitude": centroid.x
            }

            # 4. Chuyển đổi tọa độ biên giới
            coords_list = parse_geometry(shapely_geom)

            province_data = {
                "name": name,
                "center": center,
                "coordinates": coords_list # Format: [[{lat, long}, ...], [{lat, long}, ...]]
            }
            provinces.append(province_data)

        # Lưu ra file JSON cuối cùng
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(provinces, f, ensure_ascii=False, indent=2)

        print(f"✅ Đã chuyển đổi thành công! File lưu tại: {OUTPUT_FILE}")
        print(f"Tổng số tỉnh thành/khu vực: {len(provinces)}")

    except Exception as e:
        print(f"❌ Có lỗi xảy ra: {str(e)}")

if __name__ == "__main__":
    # Cần cài đặt thư viện: pip install shapely
    main()
    