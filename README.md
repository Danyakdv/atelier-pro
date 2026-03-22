# AtelierPro — Информационная система ателье

Стек: **Vue 3 + Vite + Pinia** (фронт) · **Node.js + Express + Mongoose** (бэк) · **MongoDB Atlas** (БД)
Хостинг: **Render** (бэкенд + фронт) · **MongoDB Atlas** (БД, бесплатно навсегда)

---

## Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Клиент | client@test.com | test123 |
| Мастер | master@test.com | test123 |
| Администратор | admin@test.com | test123 |

---

## Структура проекта

```
atelier/
├── frontend/        — Vue 3 приложение
│   └── src/
│       ├── views/   — страницы (auth, admin, master, client)
│       ├── stores/  — Pinia (auth)
│       ├── router/  — Vue Router
│       └── api/     — axios
├── backend/
│   ├── models/      — Mongoose модели (User, Order, Service)
│   └── src/
│       ├── routes/  — API маршруты
│       ├── middleware/ — JWT auth
│       └── seed.js  — тестовые данные
└── render.yaml      — конфиг деплоя
```

---

## Шаг 1 — Создать БД на MongoDB Atlas (бесплатно навсегда)

1. Зайди на https://www.mongodb.com/atlas → Try Free
2. Создай аккаунт
3. Создай кластер → выбери M0 Free (бесплатно навсегда)
4. Database Access → Add New Database User → задай логин и пароль
5. Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
6. Clusters → Connect → Drivers → скопируй строку подключения:
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/atelier?retryWrites=true&w=majority
   Замени password на свой пароль

---

## Шаг 2 — Локальный запуск

### Бэкенд

```bash
cd backend
cp .env.example .env
```

Заполни .env:
```
MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/atelier?retryWrites=true&w=majority"
JWT_SECRET="любой-секретный-ключ"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

```bash
npm install
node src/seed.js    # заполнить БД тестовыми данными
npm run dev         # запустить сервер
```

### Фронтенд

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api — уже стоит, не меняй

npm install
npm run dev
```

Открой: http://localhost:5173

---

## Шаг 3 — Деплой на Render (бесплатно)

### 1. Залей проект на GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/твой-ник/atelier-pro.git
git push -u origin main
```

### 2. Задеплой бэкенд

1. render.com → New → Web Service
2. Подключи GitHub репозиторий
3. Root Directory: backend
4. Build Command: npm install
5. Start Command: npm start
6. Environment Variables:
   - MONGODB_URI = строка от MongoDB Atlas
   - JWT_SECRET  = любой секретный ключ
   - FRONTEND_URL = (заполни после деплоя фронта)
7. Create Web Service
8. Скопируй URL, например: https://atelier-backend.onrender.com

### 3. Запусти seed (один раз)

Локально, с продакшн MONGODB_URI в .env:
```bash
cd backend
node src/seed.js
```

### 4. Задеплой фронтенд

1. render.com → New → Static Site
2. Тот же репозиторий
3. Root Directory: frontend
4. Build Command: npm install && npm run build
5. Publish Directory: dist
6. Environment Variables:
   - VITE_API_URL = https://atelier-backend.onrender.com/api
7. Redirects/Rewrites: /* → /index.html (Rewrite)
8. Create Static Site

### 5. Обнови FRONTEND_URL в бэкенде

В настройках бэкенда на Render добавь:
- FRONTEND_URL = https://твой-фронт.onrender.com

---

## API маршруты

```
POST   /api/auth/login                 — вход
POST   /api/auth/register              — регистрация
GET    /api/auth/me                    — текущий пользователь

GET    /api/orders                     — список заказов (по роли)
POST   /api/orders                     — создать заказ (client)
PUT    /api/orders/:id                 — обновить (admin/master)
DELETE /api/orders/:id                 — удалить (admin)

GET    /api/services                   — список услуг
POST   /api/services                   — создать (admin)
PUT    /api/services/:id               — обновить (admin)
DELETE /api/services/:id               — деактивировать (admin)

GET    /api/admin/stats                — статистика дашборда
GET    /api/admin/masters-load         — загруженность мастеров
GET    /api/admin/masters              — список мастеров
POST   /api/admin/masters              — создать мастера
PUT    /api/admin/masters/:id          — обновить мастера
DELETE /api/admin/masters/:id          — удалить мастера
GET    /api/admin/clients              — список клиентов

GET    /api/master/orders              — заказы мастера
GET    /api/master/schedule            — расписание
PUT    /api/master/orders/:id/status   — обновить статус

GET    /api/client/orders              — заказы клиента
PUT    /api/client/profile             — обновить профиль
```
