# [cite_start]DỰ ÁN: HÀNH TRÌNH VỊ GIÁC VIỆT (THE VIETNAM FLAVOR ODYSSEY) [cite: 1]

## [cite_start]1. LUỒNG TRẢI NGHIỆM NGƯỜI DÙNG (USER FLOW) [cite: 2]

[cite_start]Thay vì chỉ tải ảnh lên và hiện tên món, hệ thống chuyển đổi trải nghiệm thành một quy trình khám phá văn hóa[cite: 3]:

1.  [cite_start]**Check-in:** Người dùng chụp ảnh món ăn bằng ứng dụng[cite: 4].
2.  [cite_start]**Hội đồng AI thẩm định:** Hệ thống chạy đồng thời 5 mô hình để phân tích và đưa ra kết quả, thể hiện tính chuyên sâu về kỹ thuật[cite: 5].
3.  [cite_start]**Mở khóa tri thức:** Sau khi xác nhận món ăn, tính năng "Người kể chuyện" sẽ xuất hiện, cung cấp thông tin về nguồn gốc và văn hóa[cite: 6].
4.  [cite_start]**Đóng dấu lãnh thổ:** Món ăn được lưu vào "Hộ chiếu ẩm thực", bản đồ Việt Nam sẽ sáng lên tại vùng miền tương ứng với món ăn đó[cite: 7].

---

## [cite_start]2. CHI TIẾT CÁC TÍNH NĂNG ĐỘT PHÁ [cite: 8]

### [cite_start]A. Tính năng kỹ thuật: "Hội đồng Giám khảo AI" (The AI Council) [cite: 9]

[cite_start]Đây là tính năng nhằm hiển thị nỗ lực huấn luyện 5 mô hình khác nhau của nhóm dự án[cite: 10].

- [cite_start]**Cách hiển thị:** Khi tải ảnh lên, giao diện mô phỏng cuộc hội ý giữa các mô hình[cite: 12]:
  > [cite_start]\* Model 1 (ResNet): "Tôi nghĩ là Phở Bò (95%)" [cite: 13] > [cite_start]\* Model 2 (VGG16): "Tôi cũng nghĩ là Phở Bò (92%)" [cite: 14] > [cite_start]\* Model 3 (Custom CNN): "Tôi phân vân giữa Phở và Hủ Tiếu" [cite: 15]
- [cite_start]**Kết luận:** Hệ thống đưa ra kết quả cuối cùng dựa trên cơ chế bỏ phiếu đồng thuận (Voting mechanism)[cite: 16].
- [cite_start]**Giá trị:** Giúp giảng viên và người dùng thấy rõ độ phức tạp, minh bạch và độ tin cậy của hệ thống[cite: 17].

### [cite_start]B. Tính năng nội dung: "Thẻ bài Văn hóa" (GenAI Integrated) [cite: 18]

[cite_start]Sau khi nhận diện thành công, ứng dụng hiển thị một "Thẻ bài" (Card) được thiết kế thẩm mỹ thay vì văn bản thuần túy[cite: 19]:

- [cite_start]**Câu chuyện (Storytelling):** Sử dụng API (Gemini/OpenAI) để sinh nội dung kể chuyện[cite: 20].
  - [cite_start]_Ví dụ:_ "Bánh Xèo miền Tây được đặt tên theo tiếng 'xèo xèo' khi đổ bột vào chảo gang nóng hổi. Bạn có biết lớp rìa giòn tan mới là phần 'linh hồn' của món này không?"[cite: 21].
- [cite_start]**Thử thách phát âm (Interactive):** Nút bấm để nghe phát âm chuẩn giọng địa phương[cite: 22]. [cite_start]Người nước ngoài có thể bật micro đọc thử, hệ thống sử dụng Web Speech API để chấm điểm[cite: 23].
- [cite_start]**Hướng dẫn cách ăn (How to eat):** Cung cấp văn hóa ăn uống chuẩn bản địa[cite: 24].
  - [cite_start]_Ví dụ:_ "Món này không dùng đũa\! Hãy dùng tay cuốn bánh với lá cải xanh và chấm ngập vào nước mắm tỏi ớt."[cite: 25].

### [cite_start]C. Tính năng Gamification: "Bản đồ sương mù" (Fog of War) [cite: 26]

- [cite_start]**Cơ chế:** Mặc định bản đồ Việt Nam trên ứng dụng sẽ bị phủ mờ (màu xám)[cite: 27].
- [cite_start]**Mở khóa:** Khi người dùng quét món "Bún Chả", khu vực Hà Nội trên bản đồ sẽ sáng lên và hiện biểu tượng món ăn[cite: 28].
- [cite_start]**Hệ thống cấp bậc (Rank):** [cite: 29]
  - [cite_start]Ăn 1 món: Khách vãng lai[cite: 30].
  - [cite_start]Ăn 5 món Bắc Bộ: Thổ địa Hà Thành[cite: 31].
  - [cite_start]Ăn đủ 3 miền: Vua Ẩm Thực Việt[cite: 32].

---

## [cite_start]3. KIẾN TRÚC CÔNG NGHỆ ĐỀ XUẤT (TECH STACK SUGGESTION) [cite: 33]

[cite_start]Để giải quyết bài toán tích hợp 5 mô hình Deep Learning nặng vào ứng dụng di động mà vẫn đảm bảo độ trễ thấp (Low Latency), nhóm đề xuất sử dụng kiến trúc Microservices, phân tách giữa tầng Dịch vụ (Business Logic) và tầng Tính toán (Computation)[cite: 34].

### [cite_start]A. Sơ đồ Kiến trúc Tổng quan [cite: 35]

[cite_start]Hệ thống hoạt động theo luồng dữ liệu khép kín[cite: 36]:

1.  [cite_start]**Client (Mobile):** Gửi ảnh món ăn[cite: 37].
2.  [cite_start]**Orchestrator (Node.js):** Nhận ảnh, điều phối tác vụ[cite: 38].
3.  [cite_start]**AI Engine (Python):** Nhận lệnh, chạy 5 models song song, trả về dự đoán[cite: 39].
4.  [cite_start]**Generative AI (Gemini):** Nhận tên món ăn, sinh nội dung sáng tạo (thơ, truyện, dinh dưỡng)[cite: 40].
5.  [cite_start]**Client (Mobile):** Hiển thị kết quả tổng hợp[cite: 41].

### [cite_start]B. Chi tiết từng thành phần [cite: 42]

**1. [cite_start]Frontend: Mobile App (Tầng Trải nghiệm)** [cite: 43]

- [cite_start]**Công nghệ:** React Native (Expo)[cite: 44].
- [cite_start]**Vai trò:** Giao diện người dùng, Camera AR, Bản đồ số[cite: 46].
- [cite_start]**Thư viện chính:** [cite: 47]
  - [cite_start]`expo-camera`: Xử lý chụp và tiền xử lý ảnh (resize/crop) để tối ưu băng thông[cite: 48].
  - [cite_start]`axios`: Giao tiếp với Backend[cite: 49].
  - [cite_start]`react-native-maps`: Hiển thị "Bản đồ ẩm thực"[cite: 50].
  - [cite_start]`lottie-react-native`: Hiệu ứng animation chờ AI xử lý[cite: 51].

**2. [cite_start]Main Backend: Node.js Orchestrator (Tầng Điều phối)** [cite: 52]

- [cite_start]**Công nghệ:** Node.js (Express Framework)[cite: 53].
- [cite_start]**Vai trò:** [cite: 54]
  - [cite_start]API Gateway duy nhất cho Mobile App[cite: 55].
  - [cite_start]Quản lý logic nghiệp vụ (User, Database)[cite: 56].
  - [cite_start]Tích hợp GenAI (Google Gemini API)[cite: 57].
  - [cite_start]Giao tiếp bất đồng bộ với AI Service để tránh treo hệ thống[cite: 58].

**3. [cite_start]AI Microservice: The Engine (Tầng Tính toán)** [cite: 59]

- [cite_start]**Công nghệ:** Python (FastAPI)[cite: 60].
- [cite_start]**Vai trò:** Load model và thực hiện dự đoán (Predict)[cite: 61].
- [cite_start]**Cơ chế tối ưu:** Sử dụng sự kiện startup để load toàn bộ 5 models vào RAM ngay khi khởi động[cite: 62]. [cite_start]Model luôn ở trạng thái "Warm" (nóng), loại bỏ hoàn toàn độ trễ khởi động (Cold Start)[cite: 63].

### [cite_start]C. Luồng xử lý dữ liệu chi tiết (Sequence Flow) [cite: 64]

1.  [cite_start]**Upload:** Mobile App gửi ảnh (multipart/form-data) đến Node.js (POST `/api/scan`)[cite: 65].
2.  [cite_start]**Proxy:** Node.js stream trực tiếp file ảnh sang Python Service (POST `localhost:8000/predict`)[cite: 66].
3.  **Parallel Inference:** Python Service dùng `ThreadPoolExecutor` chạy 5 models cùng lúc. [cite_start]Thời gian xử lý chỉ bằng thời gian của model chậm nhất[cite: 67, 68].
4.  [cite_start]**Voting:** Python Service chạy thuật toán bầu chọn và trả về kết quả thắng cuộc (ví dụ: "Pho") cho Node.js[cite: 69].
5.  [cite_start]**Enrichment:** Node.js nhận kết quả, gửi prompt sang Google Gemini để lấy câu chuyện văn hóa và thông tin dinh dưỡng[cite: 70].
6.  [cite_start]**Response:** Node.js đóng gói JSON tổng hợp trả về Mobile App[cite: 71].

### [cite_start]D. Demo Code triển khai AI Service (Python FastAPI) [cite: 72]

[cite_start]Đoạn mã lõi minh họa kỹ thuật tối ưu hóa việc load model[cite: 73]:

```python
# [cite_start]ai_service.py [cite: 74]
[cite_start]from fastapi import FastAPI, UploadFile, File [cite: 75]
[cite_start]from PIL import Image [cite: 76]
[cite_start]import io [cite: 77]
[cite_start]import torch [cite: 78]
# [cite_start]import các kiến trúc model của nhóm [cite: 79]

[cite_start]app = FastAPI() [cite: 80]
# [cite_start]Biến toàn cục để lưu model trên RAM [cite: 81]
[cite_start]models = {} [cite: 82]

[cite_start]@app.on_event("startup") [cite: 83]
[cite_start]async def load_models(): [cite: 84]
    """
    [cite_start]Load model 1 lần duy nhất khi server khởi động. [cite: 85]
    [cite_start]Đây là kỹ thuật tối ưu Performance quan trọng nhất. [cite: 86]
    """
    [cite_start]print("System: Đang nạp 5 Models vào bộ nhớ...") [cite: 87]
    # [cite_start]Giả lập load model thực tế [cite: 88]
    [cite_start]models["resnet"] = torch.load("resnet_food.pth") [cite: 89]
    [cite_start]models["vgg"] = torch.load("vgg_food.pth") [cite: 90]
    # [cite_start]load các model còn lại [cite: 91]
    [cite_start]print("System: Sẵn sàng phục vụ!") [cite: 92]

[cite_start]@app.post("/predict") [cite: 93]
[cite_start]async def predict(file: UploadFile = File(...)): [cite: 94]
    # [cite_start]1. Đọc ảnh từ RAM (không ghi ra đĩa để tối ưu I/O) [cite: 95]
    [cite_start]image_bytes = await file.read() [cite: 96]
    [cite_start]image = Image.open(io.BytesIO(image_bytes)) [cite: 97]

    # [cite_start]2. Xử lý logic dự đoán (Có thể chạy ThreadPool ở đây nếu cần) [cite: 98]
    # [cite_start]results = chạy các model trong biến 'models' [cite: 99]

    [cite_start]return { [cite: 100]
        [cite_start]"best_match": "Pho", [cite: 101]
        [cite_start]"confidence": 0.98, [cite: 102]
        [cite_start]"details": {"resnet": "Pho", "vgg": "Pho"} [cite: 103]
    }
```
