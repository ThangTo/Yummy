# Server Architecture

## Cấu trúc thư mục

```
server/src/
├── config/          # Cấu hình (database, etc.)
├── models/          # Mongoose models (schema definitions)
├── services/        # Business logic layer
├── controllers/     # Request/Response handling layer
├── routes/          # Route definitions (chỉ định nghĩa endpoints)
└── index.ts         # Entry point
```

## Kiến trúc: Routes → Controllers → Services

### 1. **Routes** (`routes/`)
- Chỉ định nghĩa endpoints và HTTP methods
- Gọi controllers tương ứng
- Không chứa business logic

**Ví dụ:**
```typescript
router.get('/', (req, res) => foodController.getFoods(req, res));
```

### 2. **Controllers** (`controllers/`)
- Xử lý HTTP request/response
- Validate input
- Gọi services để thực hiện business logic
- Trả về response phù hợp

**Ví dụ:**
```typescript
async getFoods(req: Request, res: Response): Promise<void> {
  const { province_name } = req.query;
  const foods = await foodService.getFoods(province_name);
  res.json(foods);
}
```

### 3. **Services** (`services/`)
- Chứa toàn bộ business logic
- Tương tác với database/models
- Có thể gọi các services khác
- Không biết gì về HTTP/Express

**Ví dụ:**
```typescript
async getFoods(provinceName?: string): Promise<IFood[]> {
  const filter = provinceName ? { province_name: provinceName } : {};
  return Food.find(filter).lean();
}
```

## Luồng xử lý request

```
Client Request
    ↓
Routes (định nghĩa endpoint)
    ↓
Controllers (xử lý request/response)
    ↓
Services (business logic)
    ↓
Models (database operations)
    ↓
Response
```

## Lợi ích

1. **Separation of Concerns**: Mỗi layer có trách nhiệm rõ ràng
2. **Testability**: Dễ test từng layer riêng biệt
3. **Maintainability**: Dễ bảo trì và mở rộng
4. **Reusability**: Services có thể được dùng lại ở nhiều controllers

## Ví dụ đầy đủ

### Route
```typescript
// routes/foods.ts
router.get('/', (req, res) => foodController.getFoods(req, res));
```

### Controller
```typescript
// controllers/foodController.ts
async getFoods(req: Request, res: Response): Promise<void> {
  const { province_name } = req.query;
  const foods = await foodService.getFoods(province_name);
  res.json(foods);
}
```

### Service
```typescript
// services/foodService.ts
async getFoods(provinceName?: string): Promise<IFood[]> {
  const filter = provinceName ? { province_name: provinceName } : {};
  return Food.find(filter).lean();
}
```

