# Hướng dẫn Push Code lên GitHub

## Các bước thực hiện:

### 1. Kiểm tra trạng thái Git
```bash
git status
```

### 2. Thêm tất cả files vào staging
```bash
git add .
```

### 3. Commit code
```bash
git commit -m "Initial commit: Yummy App - Client and Server"
```

### 4. Thêm remote repository (thay YOUR_USERNAME và YOUR_REPO_NAME)
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Hoặc nếu dùng SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 5. Kiểm tra remote đã thêm
```bash
git remote -v
```

### 6. Push code lên GitHub
```bash
git branch -M main
git push -u origin main
```

## Lưu ý:

- **Nếu repo đã có README hoặc files khác trên GitHub**, bạn cần pull trước:
  ```bash
  git pull origin main --allow-unrelated-histories
  git push -u origin main
  ```

- **Nếu gặp lỗi authentication**, bạn cần:
  - Tạo Personal Access Token (Settings > Developer settings > Personal access tokens)
  - Dùng token thay vì password khi push

- **File `.env` đã được ignore**, nhớ tạo file `.env.example` để hướng dẫn:
  ```bash
  # server/.env.example
  MONGO_URI=mongodb://localhost:27017/yummy
  PORT=4000
  ```

