# 🚀 Hướng dẫn Deploy App Hoàn Chỉnh - Giống Vercel cho Mobile App

Hướng dẫn này sẽ giúp bạn deploy **toàn bộ ứng dụng** lên cloud để **người khác có thể tải về và sử dụng ngay**, giống như cách Vercel deploy web app.

## 📋 Tổng quan

Ứng dụng Yummy bao gồm:

- ✅ **Backend API** (Node.js) - Port 5000
- ✅ **AI Service** (Python/FastAPI) - Port 8000
- ✅ **Mobile App** (React Native/Expo) - Cần build thành APK/IPA
- ✅ **Database** - MongoDB Atlas (đã có sẵn)

## 🎯 Mục tiêu

Sau khi deploy xong:

- ✅ Backend chạy trên cloud, có URL công khai (ví dụ: `https://yummy-api.railway.app`)
- ✅ Mobile app được build thành APK/IPA
- ✅ Người khác tải APK về và cài đặt → App tự động kết nối backend trên cloud

---

## 📦 BƯỚC 1: Deploy Backend + AI Service lên Cloud (Miễn phí)

### Option 1: Railway (Khuyến nghị - Dễ nhất) ⭐

**Railway** là platform miễn phí, tự động deploy từ GitHub, rất giống Vercel.

#### 1.1. Đăng ký Railway

1. Truy cập: https://railway.app
2. Đăng nhập bằng GitHub
3. Chọn **"New Project"** → **"Deploy from GitHub repo"**

#### 1.2. Deploy Backend

1. **Chọn repository** `Yummy` của bạn
2. Railway sẽ tự detect và đề xuất deploy. Chọn **"Add Service"** → **"Empty Service"**
3. **Cấu hình service:**

   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Port**: `5000`

4. **Thêm Environment Variables:**
   - Click vào service → **Variables** tab
   - Thêm các biến sau:

```env
NODE_ENV=production
MONGO_URI=
JWT_SECRET=your-secret-key-change-this-in-production
AI_SERVICE_URL=https://yummy-ai-service.railway.app
PORT=5000
```

**Lưu ý:** `AI_SERVICE_URL` sẽ được cập nhật sau khi deploy AI service.

5. Railway sẽ tự động build và deploy. Đợi khoảng 2-3 phút.

6. **Lấy Public URL:**
   - Click vào service → **Settings** → **Generate Domain**
   - Copy URL (ví dụ: `https://yummy-backend.railway.app`)

#### 1.3. Deploy AI Service

1. Trong cùng project Railway, click **"New Service"** → **"Empty Service"**

2. **Cấu hình:**

   - **Root Directory**: `ai-service`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Railway tự động set PORT

3. **Thêm Environment Variables:**

```env
PYTHONUNBUFFERED=1
```

4. **Tăng Memory Limit:**

   - Click **Settings** → **Resources**
   - Set **Memory**: `4GB` (AI models cần nhiều RAM)

5. **Generate Domain** cho AI service (ví dụ: `https://yummy-ai-service.railway.app`)

6. **Cập nhật Backend:**
   - Quay lại Backend service → **Variables**
   - Update `AI_SERVICE_URL` = URL của AI service vừa tạo

#### 1.4. Kiểm tra

```powershell
# Test Backend
curl https://yummy-backend.railway.app/api/foods

# Test AI Service
curl https://yummy-ai-service.railway.app/docs
```

✅ **Kết quả:** Backend và AI Service đã chạy trên cloud, có URL công khai!

---

### Option 2: Render (Miễn phí, tương tự Railway)

#### 2.1. Deploy Backend

1. Đăng ký: https://render.com
2. **New** → **Web Service**
3. Connect GitHub repo
4. **Cấu hình:**

   - **Name**: `yummy-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
   - **Plan**: `Free`

5. **Environment Variables:**

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://tothang141020_db_user:minhthang@yummydb.prfwubc.mongodb.net/?appName=YummyDB
JWT_SECRET=your-secret-key
AI_SERVICE_URL=https://yummy-ai-service.onrender.com
PORT=5000
```

6. Click **Create Web Service**

#### 2.2. Deploy AI Service

1. **New** → **Web Service**
2. **Cấu hình:**

   - **Name**: `yummy-ai-service`
   - **Root Directory**: `ai-service`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: `Python 3`
   - **Plan**: `Free`

3. **Environment Variables:**

```env
PYTHONUNBUFFERED=1
```

4. **Lưu ý:** Render free tier có thể sleep sau 15 phút không dùng. Nếu cần, upgrade lên paid plan.

---

### Option 3: Fly.io (Miễn phí, tốt cho Docker)

Nếu bạn muốn dùng Docker Compose:

1. Đăng ký: https://fly.io
2. Cài CLI: `powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"`
3. Login: `fly auth login`
4. Deploy từng service:

```powershell
# Deploy Backend
cd server
fly launch --name yummy-backend
# Follow prompts, set env vars

# Deploy AI Service
cd ../ai-service
fly launch --name yummy-ai-service
# Set memory: 4GB
```

---

## 📱 BƯỚC 2: Build Mobile App với API URL mới

Sau khi backend đã chạy trên cloud, bạn cần build mobile app với API URL mới.

### 2.1. Cài đặt EAS CLI

```powershell
npm install -g eas-cli
eas login
```

Nếu chưa có tài khoản Expo: https://expo.dev/signup

### 2.2. Cấu hình API URL

#### Cách 1: Dùng EAS Secrets (Khuyến nghị)

```powershell
cd client

# Set API URL cho production
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://yummy-backend.railway.app/api" --type string --profile production

# Set cho preview/testing
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://yummy-backend.railway.app/api" --type string --profile preview
```

**Lưu ý:** Thay `https://yummy-backend.railway.app` bằng URL backend thật của bạn.

#### Cách 2: Sửa trực tiếp trong code (Nhanh nhưng không khuyến nghị)

Mở file `client/services/api.ts` và sửa:

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://yummy-backend.railway.app/api';
```

### 2.3. Cấu hình Google Maps API Key (nếu cần)

```powershell
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value "YOUR_GOOGLE_MAPS_API_KEY" --type string
```

Hoặc sửa trong `client/app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }
}
```

### 2.4. Build APK (Android)

```powershell
cd client

# Build APK cho testing/preview
eas build --platform android --profile preview

# Hoặc build production (AAB cho Google Play Store)
eas build --platform android --profile production
```

**Quá trình build:**

- Build sẽ chạy trên cloud của Expo (10-20 phút)
- Bạn sẽ nhận được link tải APK khi xong

### 2.5. Tải APK về

```powershell
# Xem danh sách builds
eas build:list

# Tải build mới nhất
eas build:download --platform android --latest
```

APK sẽ được tải về thư mục hiện tại.

---

## 🌐 BƯỚC 3: Phân phối App cho người khác

### Cách 1: Chia sẻ APK trực tiếp (Nhanh nhất) ⭐

1. **Upload APK lên Google Drive/Dropbox:**

   - Upload file `.apk` lên Google Drive
   - Click chuột phải → **Get link** → **Anyone with the link**

2. **Chia sẻ link:**

   - Gửi link cho người dùng
   - Họ tải về và cài đặt

3. **Hướng dẫn người dùng cài đặt:**
   - Tải APK về điện thoại Android
   - Vào **Settings** → **Security** → Bật **"Install from unknown sources"**
   - Mở file APK và cài đặt

### Cách 2: Firebase App Distribution (Chuyên nghiệp)

1. Tạo project Firebase: https://console.firebase.google.com
2. Vào **App Distribution**
3. Upload APK
4. Thêm testers (email)
5. Testers nhận email với link tải

### Cách 3: Google Play Store (Chính thức)

1. **Tạo tài khoản Google Play Developer:**

   - Đăng ký: https://play.google.com/console
   - Phí: $25 một lần (trọn đời)

2. **Build AAB (App Bundle):**

```powershell
eas build --platform android --profile production
```

3. **Submit lên Play Store:**

```powershell
eas submit --platform android
```

4. Điền thông tin app trong Google Play Console
5. Submit để review (1-3 ngày)

---

## ✅ Checklist Hoàn Chỉnh

### Backend & AI Service

- [ ] Backend đã deploy lên Railway/Render/Fly.io
- [ ] AI Service đã deploy và có URL công khai
- [ ] Backend đã kết nối đúng MongoDB Atlas
- [ ] Backend đã set đúng `AI_SERVICE_URL`
- [ ] Test API từ browser: `https://your-backend-url/api/foods`

### Mobile App

- [ ] Đã cài EAS CLI và login
- [ ] Đã set `EXPO_PUBLIC_API_URL` với URL backend mới
- [ ] Đã build APK thành công
- [ ] Đã test APK trên điện thoại thật
- [ ] App kết nối được backend trên cloud

### Phân phối

- [ ] Đã upload APK lên Google Drive/Dropbox
- [ ] Đã chia sẻ link cho người dùng
- [ ] Đã hướng dẫn cách cài đặt

---

## 🔧 Troubleshooting

### Backend không accessible

**Kiểm tra:**

```powershell
curl https://your-backend-url/api/foods
```

**Nếu lỗi:**

- Kiểm tra logs trên Railway/Render dashboard
- Kiểm tra environment variables đã set đúng chưa
- Kiểm tra MongoDB Atlas IP whitelist (cho phép tất cả IP: `0.0.0.0/0`)

### Mobile app không kết nối được backend

**Nguyên nhân:**

- API URL sai trong app
- Backend chưa deploy xong
- CORS chưa được cấu hình

**Giải pháp:**

1. Kiểm tra `EXPO_PUBLIC_API_URL` trong EAS secrets
2. Test API từ browser trước
3. Kiểm tra CORS trong backend (đã có `cors` middleware chưa)

### Build APK bị lỗi

**Xem logs:**

```powershell
eas build:list
eas build:view [BUILD_ID]
```

**Lỗi thường gặp:**

- Thiếu Google Maps API key → Thêm vào `eas.json` hoặc secrets
- Thiếu environment variables → Set bằng `eas secret:create`

---

## 📊 So sánh các Platform

| Platform    | Free Tier                 | Dễ sử dụng | Tốt cho                             |
| ----------- | ------------------------- | ---------- | ----------------------------------- |
| **Railway** | ✅ Có ($5 credit/tháng)   | ⭐⭐⭐⭐⭐ | Backend + AI Service                |
| **Render**  | ✅ Có (sleep sau 15 phút) | ⭐⭐⭐⭐   | Backend + AI Service                |
| **Fly.io**  | ✅ Có (3 VMs miễn phí)    | ⭐⭐⭐     | Docker Compose                      |
| **Vercel**  | ✅ Có                     | ⭐⭐⭐⭐⭐ | Chỉ frontend/API (không tốt cho AI) |

**Khuyến nghị:** Railway cho người mới, Render nếu cần free tier tốt hơn.

---

## 🎉 Kết quả

Sau khi hoàn thành:

✅ **Backend chạy trên cloud:** `https://yummy-backend.railway.app`  
✅ **AI Service chạy trên cloud:** `https://yummy-ai-service.railway.app`  
✅ **Mobile app đã build thành APK**  
✅ **Người khác tải APK về và cài đặt** → App tự động kết nối backend trên cloud

**Giống như Vercel deploy web, nhưng cho mobile app!** 🚀

---

## 📝 Lưu ý quan trọng

1. **MongoDB Atlas:** Đảm bảo IP whitelist cho phép tất cả (`0.0.0.0/0`) để Railway/Render có thể kết nối
2. **Environment Variables:** Không commit secrets vào Git, dùng platform's env vars
3. **HTTPS:** Railway/Render tự động có HTTPS, không cần cấu hình thêm
4. **Free Tier Limits:**
   - Railway: $5 credit/tháng (đủ cho 1-2 services nhỏ)
   - Render: Sleep sau 15 phút không dùng (có thể upgrade)
   - Fly.io: 3 VMs miễn phí

---

## 🆘 Cần hỗ trợ?

Nếu gặp vấn đề:

1. Kiểm tra logs trên platform dashboard
2. Test API từ browser trước
3. Kiểm tra environment variables
4. Xem troubleshooting section ở trên

**Chúc bạn deploy thành công!** 🎊
