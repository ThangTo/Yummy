# Hướng dẫn Setup Authentication System

## 📋 Tổng quan

Hệ thống Authentication đã được implement với các tính năng bảo mật:

- **Backend**: JWT-based authentication với bcrypt password hashing
- **Frontend**: Secure token storage với expo-secure-store
- **Axios Interceptor**: Tự động chèn token vào mọi request

## 🔧 Cài đặt Dependencies

### Backend (server/)

```bash
cd server
npm install bcryptjs jsonwebtoken express-validator
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### Frontend (client/)

```bash
cd client
npx expo install expo-secure-store
npm install axios
```

## ⚙️ Cấu hình Environment Variables

### Backend (.env)

Thêm vào file `server/.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
```

**QUAN TRỌNG**: Đổi `JWT_SECRET` thành một chuỗi ngẫu nhiên dài ít nhất 32 ký tự trong production!

### Frontend (.env)

Đảm bảo file `client/.env` có:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

Hoặc URL của server production.

## 📁 Cấu trúc Files đã tạo

### Backend

```
server/src/
├── models/User.ts                    # ✅ Đã cập nhật (thêm username, password)
├── middleware/auth.middleware.ts     # ✅ Mới tạo (JWT verification)
├── controllers/auth.controller.ts    # ✅ Mới tạo (register, login, getCurrentUser)
└── routes/auth.routes.ts            # ✅ Mới tạo (API endpoints)
```

### Frontend

```
client/
├── utils/secureStorage.ts           # ✅ Mới tạo (secure token storage)
├── services/authApi.ts              # ✅ Mới tạo (Axios với interceptor)
├── context/AuthContext.tsx         # ✅ Đã cập nhật (tích hợp auth)
└── app/login.tsx                    # ✅ Đã cập nhật (UI login/register)
```

## 🚀 API Endpoints

### Public Routes (không cần auth)

#### POST `/api/auth/register`

Đăng ký tài khoản mới.

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đăng ký thành công!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "current_rank": "Khách vãng lai"
  }
}
```

#### POST `/api/auth/login`

Đăng nhập.

**Request Body:**

```json
{
  "emailOrUsername": "john@example.com",
  "password": "password123"
}
```

**Response:** (giống register)

### Protected Routes (cần auth)

#### GET `/api/auth/me`

Lấy thông tin user hiện tại.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "current_rank": "Khách vãng lai",
    "unlocked_provinces": [],
    "food_passport_count": 0
  }
}
```

## 🔒 Bảo mật

### Backend

1. **Password Hashing**: Sử dụng bcryptjs với salt rounds = 10
2. **JWT Token**:
   - Expiration: 7 ngày (có thể config)
   - Secret key: Lưu trong environment variable
3. **Input Validation**: Sử dụng express-validator
4. **Error Messages**: Không tiết lộ thông tin nhạy cảm

### Frontend

1. **Secure Storage**: Token được lưu trong expo-secure-store (Keychain/Keystore)
2. **Axios Interceptor**: Tự động chèn token vào header
3. **Auto Logout**: Tự động logout nếu token expired (401)

## 📱 Cách sử dụng trong Component

### Đăng nhập

```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        emailOrUsername: 'user@example.com',
        password: 'password123',
      });
      // AuthContext sẽ tự động redirect
    } catch (err) {
      console.error('Login failed:', err);
    }
  };
}
```

### Đăng ký

```typescript
const { register } = useAuth();

const handleRegister = async () => {
  try {
    await register({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
    });
  } catch (err) {
    console.error('Register failed:', err);
  }
};
```

### Kiểm tra trạng thái đăng nhập

```typescript
const { isLoggedIn, user, isLoading } = useAuth();

if (isLoading) {
  return <LoadingScreen />;
}

if (!isLoggedIn) {
  return <LoginScreen />;
}

return <Dashboard user={user} />;
```

### Đăng xuất

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // AuthContext sẽ tự động redirect về login
};
```

## 🧪 Testing

### Test Register

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "password123"
  }'
```

### Test Protected Route

```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## ⚠️ Lưu ý quan trọng

1. **JWT_SECRET**: Phải đổi trong production!
2. **Password**: Tối thiểu 6 ký tự (có thể tăng trong validation)
3. **Token Storage**: KHÔNG BAO GIỜ dùng AsyncStorage cho token
4. **HTTPS**: Bắt buộc trong production
5. **Token Expiration**: Mặc định 7 ngày, có thể config

## 🐛 Troubleshooting

### Lỗi "Cannot find module 'bcryptjs'"

```bash
cd server && npm install bcryptjs
```

### Lỗi "expo-secure-store not found"

```bash
cd client && npx expo install expo-secure-store
```

### Token không được gửi trong request

- Kiểm tra axios interceptor đã được setup đúng
- Kiểm tra token đã được lưu vào secure storage
- Kiểm tra Authorization header format: `Bearer <token>`

### 401 Unauthorized

- Token đã hết hạn → Cần đăng nhập lại
- Token không hợp lệ → Xóa token và đăng nhập lại
- Server không nhận được token → Kiểm tra interceptor

## ✅ Checklist

- [x] Backend: User model với username, email, password
- [x] Backend: Register endpoint với validation
- [x] Backend: Login endpoint với bcrypt
- [x] Backend: JWT middleware
- [x] Backend: Protected route example
- [x] Frontend: Secure storage helper
- [x] Frontend: Axios interceptor
- [x] Frontend: Auth context với auto-login
- [x] Frontend: Login/Register UI
- [ ] **TODO**: Thêm refresh token mechanism (optional)
- [ ] **TODO**: Thêm password reset (optional)
- [ ] **TODO**: Thêm email verification (optional)
