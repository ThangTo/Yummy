# Yummy App - Hành trình Vị giác Việt

Full-stack application với Mobile Client (Expo) và Backend Server (Node.js + MongoDB).

## 📁 Cấu trúc Project

```
Yummy/
├── client/          # Mobile App (Expo/React Native)
│   ├── app/        # Expo Router screens
│   ├── components/ # React components
│   ├── assets/     # Images, fonts, etc.
│   └── ...
├── server/         # Backend API (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── models/    # Mongoose models
│   │   ├── routes/    # API routes
│   │   └── config/    # Database config
│   └── ...
└── package.json    # Root scripts
```

## 🚀 Cài đặt

### Cài đặt tất cả dependencies:
```bash
npm run install:all
```

Hoặc cài từng phần:
   ```bash
# Client
cd client
npm install

# Server
cd server
   npm install
   ```

## 💻 Chạy Development

### Client (Mobile App):
   ```bash
npm run client:start      # Expo dev server
npm run client:android    # Android
npm run client:ios        # iOS
npm run client:web        # Web
```

### Server (Backend API):
```bash
npm run server:dev        # Development mode với nodemon
npm run server:start      # Production mode
```

## ⚙️ Cấu hình

### Server Environment Variables
Tạo file `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/yummy
PORT=4000
```

## 📚 Tài liệu

- [ML App Specification](./ML_app.markdown)
- [Database Schema](./schema.markdown)
