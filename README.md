# TradeView Dashboard

Aplikasi full-stack untuk simulasi dashboard trading, pemantauan portofolio, watchlist, data pasar, berita saham, analisis teknikal, dan akses multi-platform melalui web dan mobile.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=111111)](https://react.dev/)
[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

---

## Status Project

Project ini masih dalam tahap pengembangan dan pengujian. Beberapa fitur market data menggunakan fallback ketika provider eksternal tidak tersedia, terkena rate limit, atau gagal merespons.

Dokumentasi ini hanya menjelaskan setup dan struktur project. Tidak ada perubahan flow testing Katalon yang diperlukan dari sisi dokumentasi ini.

---

## Tentang Project

TradeView Dashboard adalah monorepo untuk dashboard trading dan portfolio management. Web frontend dan mobile app mengonsumsi API Laravel yang sama untuk autentikasi, portfolio, watchlist, settings, saved news, push subscription, dan market data.

Market data diambil melalui backend Laravel sebagai proxy ke provider eksternal seperti Finnhub, Alpha Vantage, dan CoinGecko. Data user disimpan di PostgreSQL online/cloud.

---

## Fitur Utama

- Auth register, login, logout dengan Laravel Sanctum
- Dashboard market overview
- Watchlist saham
- Portfolio management
- Chart OHLCV
- Market news
- Company profile dan financials
- Crypto market support
- User settings
- Saved news
- Push subscription jika VAPID/Web Push sudah dikonfigurasi
- Web client dan mobile client

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- TanStack React Query

### Backend

- PHP 8.2+
- Laravel 12
- Laravel Sanctum
- PostgreSQL
- Finnhub API
- Alpha Vantage API
- CoinGecko API
- Web Push notification

### Mobile

- React Native
- Expo
- Expo Router
- Zustand
- Axios
- TanStack React Query

---

## Struktur Repository

```txt
tradeview-dashboard/
+-- backend/     # REST API Laravel 12
+-- frontend/    # Web dashboard React + TypeScript + Vite
+-- mobile/      # Mobile app React Native / Expo
+-- docs/        # Dokumentasi API, agent workflow, dan catatan project
+-- shared/      # Shared types/utilities jika tersedia
`-- README.md    # Dokumentasi utama project
```

---

## Arsitektur Singkat

Web frontend dan mobile app mengirim request ke Laravel API. Laravel API menangani auth, portfolio, watchlist, settings, saved news, dan push subscription. Laravel API juga menjadi proxy untuk market data provider agar API key tetap berada di server.

Database PostgreSQL online menyimpan user data, portfolio, watchlist, settings, push subscription, dan saved news. Market data dari provider eksternal tidak disimpan permanen kecuali ada fitur tertentu yang secara eksplisit menyimpannya.

```txt
Web Frontend
     |
     v
Laravel API ---> PostgreSQL Online
     |
     v
Finnhub / Alpha Vantage / CoinGecko

Mobile App
     |
     v
Laravel API
```

---

## Prasyarat

- PHP 8.2+
- Composer 2.x
- Node.js 18+
- npm
- PostgreSQL online/cloud atau PostgreSQL server yang bisa diakses backend
- API key Finnhub dan Alpha Vantage untuk market data saham
- API key CoinGecko jika memakai endpoint/plan yang membutuhkan key
- Expo Go atau emulator/simulator untuk mobile

---

## Instalasi Lokal

### 1. Clone Repository

```bash
git clone https://github.com/ramirezzServer/tradeview-dashboard.git
cd tradeview-dashboard
```

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
```

Isi konfigurasi PostgreSQL online di `.env`. Bisa memakai `DB_URL` jika provider database menyediakan connection string, atau isi host/port/database/username/password secara manual.

```env
DB_CONNECTION=pgsql
DB_URL=postgresql://username:password@host:5432/database
DB_HOST=your-postgres-host
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Lanjutkan setup Laravel:

```bash
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Backend default berjalan di:

```txt
http://localhost:8000
```

### 3. Frontend

Buka terminal baru dari root repository:

```bash
cd frontend
npm install
cp .env.example .env.local
```

Isi URL backend API:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
```

Jalankan frontend:

```bash
npm run dev
```

Frontend default berjalan di:

```txt
http://localhost:5173
```

### 4. Mobile

```bash
cd mobile
npm install
```

Mobile menggunakan `apiBaseUrl` dari konfigurasi Expo. Untuk emulator web/iOS simulator, `localhost` kadang masih bisa dipakai. Untuk real device, jangan pakai `localhost`; gunakan IP laptop/server yang bisa diakses dari jaringan yang sama, misalnya:

```txt
http://192.168.x.x:8000
```

Jalankan mobile:

```bash
npm run android
# atau
npm run ios
```

---

## Environment Variables

### Backend

| Key | Keterangan |
|---|---|
| `APP_NAME` | Nama aplikasi Laravel |
| `APP_ENV` | Environment, misalnya `local` atau `production` |
| `APP_KEY` | Application key Laravel dari `php artisan key:generate` |
| `APP_DEBUG` | Gunakan `false` untuk production |
| `APP_URL` | URL backend, misalnya `http://localhost:8000` |
| `DB_CONNECTION` | Gunakan `pgsql` |
| `DB_URL` | Connection string PostgreSQL online/cloud jika tersedia |
| `DB_HOST` | Host PostgreSQL |
| `DB_PORT` | Port PostgreSQL, biasanya `5432` |
| `DB_DATABASE` | Nama database PostgreSQL |
| `DB_USERNAME` | Username database |
| `DB_PASSWORD` | Password database |
| `FINNHUB_API_KEY` | API key Finnhub |
| `ALPHA_VANTAGE_API_KEY` | API key Alpha Vantage |
| `COINGECKO_API_KEY` | API key CoinGecko jika diperlukan |
| `FRONTEND_URL` | URL frontend yang diizinkan |
| `CORS_ALLOWED_ORIGINS` | Daftar origin frontend/mobile web yang boleh mengakses API |
| `WEBPUSH_VAPID_PUBLIC_KEY` | Public key Web Push |
| `WEBPUSH_VAPID_PRIVATE_KEY` | Private key Web Push, hanya di backend |
| `WEBPUSH_VAPID_SUBJECT` | Subject VAPID, biasanya email admin |

### Frontend

| Key | Keterangan |
|---|---|
| `VITE_API_BASE_URL` | Base URL Laravel API, contoh `http://localhost:8000/api` |
| `VITE_VAPID_PUBLIC_KEY` | Public key untuk browser push notification |

### Mobile

Mobile memakai `apiBaseUrl` dari konfigurasi Expo. Untuk real device, gunakan IP laptop/server yang bisa dijangkau perangkat, bukan `localhost`.

Contoh:

```txt
http://192.168.x.x:8000
```

---

## API Reference

Base URL:

```txt
/api
```

Protected endpoint membutuhkan header:

```txt
Authorization: Bearer {token}
```

### Public

```txt
GET  /api/healthz
POST /api/auth/register
POST /api/auth/login
GET  /api/market/quote/{symbol}
GET  /api/market/quotes?symbols=AAPL,MSFT
GET  /api/market/candles/{symbol}
GET  /api/market/candles-alt/{symbol}
GET  /api/market/news
GET  /api/market/profile/{symbol}
GET  /api/market/financials/{symbol}
GET  /api/market/company-news/{symbol}
GET  /api/market/movers
GET  /api/market/indices
GET  /api/market/sectors
GET  /api/market/earnings/{symbol}
GET  /api/market/crypto/prices
GET  /api/market/crypto/ohlcv/{symbol}
GET  /api/market/crypto/supported
```

### Protected With Bearer Token

```txt
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/watchlists
POST   /api/watchlists
GET    /api/watchlists/{id}
PUT    /api/watchlists/{id}
DELETE /api/watchlists/{id}
POST   /api/watchlists/{id}/items
PUT    /api/watchlist-items/{id}
DELETE /api/watchlist-items/{id}

GET    /api/portfolios
POST   /api/portfolios
GET    /api/portfolios/{id}
PUT    /api/portfolios/{id}
DELETE /api/portfolios/{id}
POST   /api/portfolios/{id}/items
PUT    /api/portfolio-items/{id}
DELETE /api/portfolio-items/{id}

GET    /api/settings
PUT    /api/settings

POST   /api/push/subscribe
DELETE /api/push/unsubscribe

GET    /api/news/saved
POST   /api/news/saved
PUT    /api/news/saved/{savedNews}
DELETE /api/news/saved/{savedNews}
```

Dokumentasi endpoint yang lebih detail ada di [docs/api-endpoints.md](docs/api-endpoints.md).

---

## Testing

Command yang tersedia:

```bash
# Frontend
cd frontend
npm run build
npm test

# Backend
cd backend
php artisan test
```

Pengujian manual API bisa dilakukan dengan Postman, Thunder Client, atau tool sejenis. E2E/UI test tetap bisa memakai Katalon sesuai kebutuhan tim. Dokumentasi ini tidak mengubah flow testing Katalon, source aplikasi, atau konfigurasi runtime aktif.

---

## Deployment

- Frontend cocok di-deploy ke Vercel atau Netlify.
- Backend Laravel bisa di-deploy ke Railway, Render, VPS, atau hosting PHP yang mendukung Laravel.
- Database menggunakan PostgreSQL online/cloud.
- Set `APP_DEBUG=false` untuk production.
- Pastikan `FRONTEND_URL` dan `CORS_ALLOWED_ORIGINS` sesuai domain frontend production.
- Pastikan API keys hanya disimpan di backend/server environment, bukan di frontend.
- Set `VITE_API_BASE_URL` ke URL backend production dengan suffix `/api`.
- Frontend menyediakan halaman publik `/privacy`, `/terms`, dan `/disclaimer` untuk kesiapan produksi dasar.
- Frontend menyediakan `robots.txt` dan `sitemap.xml`; ganti domain placeholder `tradeview-dashboard.example.com` dengan domain production yang sebenarnya sebelum launch.
- Analytics/monitoring pihak ketiga tidak aktif secara default dan belum diwajibkan. Jika nanti ditambahkan, aktifkan hanya melalui environment variable publik yang aman dan jangan kirim data sensitif.

---

## Catatan Market Data

Data saham dan crypto bergantung pada provider eksternal seperti Finnhub, Alpha Vantage, dan CoinGecko. Jika provider terkena limit, tidak aktif, atau gagal merespons, aplikasi dapat memakai fallback, simulated, atau calculated data agar UI tetap bisa ditampilkan saat demo dan pengujian.

Data fallback hanya untuk kebutuhan demo/pengujian. Jangan gunakan data fallback sebagai dasar keputusan finansial real.

Halaman disclaimer publik tersedia di `/disclaimer` dan menjelaskan bahwa aplikasi ini bukan sumber saran finansial.

---

## Disclaimer

Project ini dibuat untuk pembelajaran, simulasi, dan demonstrasi aplikasi dashboard trading/portfolio. Data yang ditampilkan tidak boleh dianggap sebagai saran investasi.

---

## Kontribusi

Pull request terbuka. Untuk perubahan besar, buka issue terlebih dahulu agar perubahan bisa dibahas dengan jelas.

Contoh format commit:

```txt
feat: tambah fitur price alert
fix: perbaiki kalkulasi gain/loss portofolio
docs: update instruksi instalasi backend
```

---

## Lisensi

[MIT](LICENSE) (c) 2025 Faris Yahya Ayyash Alfatih
