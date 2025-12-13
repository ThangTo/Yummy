[cite_start]Đây là schema hoàn chỉnh cho ứng dụng **"Hành trình vị giác Việt"** (The Vietnam Flavor Odyssey), được thiết kế tối ưu hóa cho MongoDB (NoSQL) và đáp ứng đầy đủ các tính năng đột phá bạn đã đề ra (Gamification, AI Council, GenAI Storytelling)[cite: 8].

Schema này tập trung vào việc lưu trữ **Metadata cố định** (thông tin cần thiết cho logic app) và **Dữ liệu động của người dùng** (tiến trình khám phá ẩm thực).

---

## 💾 Thiết kế Schema MongoDB Hoàn chỉnh

Chúng ta sẽ sử dụng 3 Collection chính: `foods`, `users`, và `ai_logs`.

### 1. 🍽️ Collection: `foods` (Metadata Món ăn)

Collection này lưu trữ các thông tin cố định và quan trọng (Metadata) của món ăn mà 5 mô hình AI đã được huấn luyện để nhận diện. Mục đích chính là cung cấp dữ liệu cho tính năng **Bản đồ Sương mù** và **Thẻ bài Văn hóa**.

| Trường (Field)      | Kiểu dữ liệu (Type) | Bắt buộc (Required) | Mục đích                                                                                                 |
| :------------------ | :------------------ | :------------------ | :------------------------------------------------------------------------------------------------------- |
| `_id`               | ObjectId            | ✅                  | ID mặc định của MongoDB.                                                                                 |
| `name_key`          | String              | ✅                  | **Key nội bộ** (Phải trùng khớp với kết quả dự đoán của AI) (ví dụ: `Pho_Bo`).                           |
| `name_vi`           | String              | ✅                  | Tên tiếng Việt hiển thị trên App.                                                                        |
| `province_name`     | String              | ✅                  | Tên tỉnh/thành phố (ví dụ: `Hà Nội`, `Thành phố Hồ Chí Minh`). [cite_start]**Cần thiết cho Bản đồ sương mù**[cite: 7]. |
| `location_coords`   | Object              |                     | [cite_start]Tọa độ đại diện của khu vực (dùng cho `react-native-maps`)[cite: 50].                        |
| `how_to_eat`        | String              |                     | [cite_start]Hướng dẫn cách ăn chuẩn bản địa[cite: 24, 25].                                               |
| `genai_prompt_seed` | String              |                     | [cite_start]Prompt cơ bản (gợi ý văn phong, chủ đề) để gửi đến Gemini sinh nội dung kể chuyện[cite: 20]. |

### 2. 🧑‍ Collection: `users` (Thông tin Người dùng & Tiến trình)

Collection này lưu trữ dữ liệu cá nhân và tiến trình **Gamification** của người dùng.

| Trường (Field)           | Kiểu dữ liệu (Type) | Bắt buộc (Required) | Mục đích                                                                          |
| :----------------------- | :------------------ | :------------------ | :-------------------------------------------------------------------------------- |
| `_id`                    | ObjectId            | ✅                  | ID người dùng.                                                                    |
| `email`                  | String              | ✅                  | Email/ID đăng nhập.                                                               |
| `current_rank`           | String              | ✅                  | [cite_start]Cấp bậc hiện tại (ví dụ: "Khách vãng lai")[cite: 29, 30].             |
| `food_passport`          | Array of Objects    |                     | [cite_start]**"Hộ chiếu ẩm thực"**[cite: 7]. Danh sách các món đã check-in.       |
| &nbsp; `-> food_id`      | ObjectId            | ✅                  | Tham chiếu đến ID món ăn trong Collection `foods`.                                |
| &nbsp; `-> checkin_date` | Date                | ✅                  | Ngày và giờ người dùng check-in.                                                  |
| &nbsp; `-> image_url`    | String              |                     | Link ảnh gốc đã chụp (để xem lại lịch sử).                                        |
| `unlocked_provinces`     | Array of Strings    |                     | [cite_start]Danh sách các `province_name` đã được mở khóa trên Bản đồ[cite: 27, 28]. |

### 3. 🤖 Collection: `ai_logs` (Lịch sử Xử lý AI)

[cite_start]Collection này lưu trữ chi tiết mọi giao dịch xử lý ảnh, rất quan trọng cho việc minh bạch, gỡ lỗi (Debugging), và theo dõi hiệu suất của **Hội đồng Giám khảo AI**[cite: 17].

| Trường (Field)         | Kiểu dữ liệu (Type) | Bắt buộc (Required) | Mục đích                                                                                |
| :--------------------- | :------------------ | :------------------ | :-------------------------------------------------------------------------------------- |
| `_id`                  | ObjectId            | ✅                  | ID bản ghi log.                                                                         |
| `user_id`              | ObjectId            |                     | Tham chiếu đến người dùng đã thực hiện scan.                                            |
| `upload_timestamp`     | Date                | ✅                  | [cite_start]Thời điểm ảnh được tải lên[cite: 65].                                       |
| `final_prediction`     | String              | ✅                  | [cite_start]Tên món ăn thắng cuộc sau cơ chế Voting[cite: 16, 69].                      |
| `confidence`           | Number              |                     | Độ tin cậy của kết quả cuối cùng.                                                       |
| `model_details`        | Object              |                     | [cite_start]Kết quả dự đoán chi tiết của 5 models[cite: 13, 14, 15, 10].                |
| &nbsp; `-> resnet`     | String              |                     | [cite_start]Dự đoán của Model ResNet[cite: 13].                                         |
| &nbsp; `-> vgg16`      | String              |                     | [cite_start]Dự đoán của Model VGG16[cite: 14].                                          |
| &nbsp; `-> custom_cnn` | String              |                     | [cite_start]Dự đoán của Custom CNN[cite: 15].                                           |
| `genai_response`       | String              |                     | [cite_start]Nội dung câu chuyện/nội dung sáng tạo được sinh ra từ Gemini[cite: 20, 70]. |

--
