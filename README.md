# TradeView Dashboard

Platform dashboard trading dan portofolio saham berbasis web. Dibangun dengan arsitektur monorepo yang mencakup aplikasi web (React + TypeScript), REST API backend (Laravel), dan aplikasi mobile.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

---

## Tentang Proyek

TradeView Dashboard dirancang untuk membantu investor dan trader memvisualisasikan data pasar, memantau portofolio, dan menganalisis pergerakan harga. Proyek ini memisahkan tanggung jawab secara jelas antara lapisan frontend, backend API, dan mobile dalam satu repository.

---

## Tech Stack

**Frontend** — TypeScript, React, Tailwind CSS, Recharts, Axios

**Backend** — PHP 8.2+, Laravel 12, Laravel Sanctum, MySQL

**Mobile** — React Native (mengonsumsi API yang sama dengan frontend web)

**Infrastructure** — Nginx, Vite (dev server & build tool)

---

## Struktur Repository

```
tradeview-dashboard/
├── frontend/          # Aplikasi web React + TypeScript
├── backend/           # REST API & server-side Laravel
├── mobile/            # Aplikasi mobile React Native
└── .github/           # CI/CD workflows & git hooks
```

Setiap direktori berdiri sendiri dan memiliki `package.json` atau `composer.json` masing-masing.

---

## Prasyarat

- PHP 8.2+
- Composer 2.x
- Node.js 18+
- MySQL 8.x

---

## Instalasi

### 1. Clone

```bash
git clone https://github.com/ramirezzServer/tradeview-dashboard.git
cd tradeview-dashboard
```

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Sesuaikan konfigurasi database di `.env`:

```env
DB_DATABASE=tradeview_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

```bash
php artisan migrate --seed
php artisan serve
```

Backend berjalan di `http://localhost:8000`.

### 3. Frontend

Buka terminal baru dari root repository:

```bash
cd frontend
npm install
cp .env.example .env.local
```

Isi `VITE_API_BASE_URL` di `.env.local` dengan URL backend:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

```bash
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

### 4. Mobile

```bash
cd mobile
npm install
npm run android   # atau npm run ios
```

---

## Environment Variables

### `backend/.env`

| Key | Keterangan |
|---|---|
| `APP_KEY` | Laravel application key (auto-generated) |
| `DB_DATABASE` | Nama database MySQL |
| `DB_USERNAME` | Username database |
| `DB_PASSWORD` | Password database |
| `SANCTUM_STATEFUL_DOMAINS` | Domain frontend, misal `localhost:5173` |

### `frontend/.env.local`

| Key | Keterangan |
|---|---|
| `VITE_API_BASE_URL` | Base URL backend API |

---

## API Reference

Base URL: `/api` — semua endpoint memerlukan header `Authorization: Bearer {token}` kecuali rute auth.

### Autentikasi

```
POST   /auth/register      Registrasi akun baru
POST   /auth/login         Login, mengembalikan Bearer Token
POST   /auth/logout        Logout & invalidasi token
GET    /auth/me            Data user yang sedang login
```

### Saham

```
GET    /stocks                      Daftar saham tersedia
GET    /stocks/{symbol}             Detail satu saham
GET    /stocks/{symbol}/history     Riwayat harga
GET    /stocks/search?q={keyword}   Pencarian saham
```

### Portofolio

```
GET    /portfolio           Semua aset milik user
POST   /portfolio           Tambah aset
PUT    /portfolio/{id}      Update aset
DELETE /portfolio/{id}      Hapus aset
GET    /portfolio/summary   Ringkasan nilai & gain/loss
```

### Watchlist

```
GET    /watchlist           Daftar watchlist user
POST   /watchlist           Tambah saham ke watchlist
DELETE /watchlist/{id}      Hapus dari watchlist
```

> Postman Collection tersedia di `docs/postman_collection.json` (segera hadir).

---

## Fitur

- Autentikasi berbasis token (Laravel Sanctum)
- Dashboard ringkasan portofolio
- Grafik harga saham interaktif
- CRUD portofolio & watchlist
- Tampilan responsif (web & mobile)
- Role-based access (admin & user biasa)

---

## Deployment

Build frontend untuk production:

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

Optimasi backend:

```bash
cd backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Untuk deployment cloud, frontend cocok di-host di **Vercel**, backend di **Railway** atau VPS dengan Nginx.

---

## Kontribusi

Pull request terbuka. Untuk perubahan besar, buka issue terlebih dahulu untuk mendiskusikan apa yang ingin kamu ubah.

Gunakan format commit yang konsisten:

```
feat: tambah fitur price alert
fix: perbaiki kalkulasi gain/loss portofolio
docs: update instruksi instalasi backend
```

---

## Lisensi

[MIT](LICENSE) © 2025 Faris Yahya Ayyash Alfatih