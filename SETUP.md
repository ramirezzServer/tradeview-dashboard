# TradeView Dashboard Setup

Panduan ini merangkum setup lokal untuk backend, frontend, dan mobile. Semua instruksi di sini bersifat dokumentasi dan tidak mengubah flow testing Katalon.

---

## Prasyarat

- PHP 8.2+
- Composer 2.x
- Node.js 18+
- npm
- PostgreSQL online/cloud atau PostgreSQL server yang bisa diakses backend
- API key Finnhub dan Alpha Vantage untuk market data saham
- Expo Go atau emulator/simulator untuk mobile

---

## Backend

```bash
cd backend
composer install
cp .env.example .env
```

Isi konfigurasi PostgreSQL online di `backend/.env`:

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.example

DB_CONNECTION=pgsql
DB_URL=postgresql://username:password@host:5432/database
DB_HOST=your-postgres-host
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

FINNHUB_API_KEY=your-finnhub-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
COINGECKO_API_KEY=your-coingecko-key-if-needed

WEBPUSH_VAPID_PUBLIC_KEY=your-vapid-public-key
WEBPUSH_VAPID_PRIVATE_KEY=your-vapid-private-key
WEBPUSH_VAPID_SUBJECT=mailto:admin@example.com
```

Lanjutkan:

```bash
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Backend default berjalan di `http://localhost:8000`.

---

## Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

Isi `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
```

Jalankan:

```bash
npm run dev
```

Frontend default berjalan di `http://localhost:5173`.

---

## Mobile

```bash
cd mobile
npm install
```

Mobile memakai `apiBaseUrl` dari konfigurasi Expo. Untuk real device, jangan gunakan `localhost`; gunakan IP laptop/server yang bisa diakses dari jaringan yang sama.

Contoh:

```txt
http://192.168.x.x:8000
```

Jalankan:

```bash
npm run android
# atau
npm run ios
```

Untuk Expo cache issue:

```bash
npx expo start -c
```

---

## API Keys dan Market Data

Finnhub digunakan untuk quote, news, profile, financials, earnings, dan sebagian market data saham.

Alpha Vantage digunakan sebagai provider alternatif/fallback untuk beberapa data market. Free tier dapat terkena limit.

CoinGecko digunakan untuk crypto market data. Beberapa endpoint/plan dapat membutuhkan API key.

Jika provider gagal atau rate limited, backend dapat mengembalikan fallback, simulated, atau calculated data supaya UI tetap bisa dipakai untuk demo dan pengujian. Data fallback bukan saran investasi.

---

## Testing

```bash
# Frontend
cd frontend
npm run build
npm test

# Backend
cd backend
php artisan test
```

Manual API test bisa memakai Postman atau Thunder Client. E2E/UI test dapat tetap memakai Katalon sesuai kebutuhan tim.

---

## Deployment Notes

- Frontend: Vercel atau Netlify.
- Backend: Railway, Render, VPS, atau hosting PHP yang mendukung Laravel.
- Database: PostgreSQL online/cloud.
- Production backend harus memakai `APP_DEBUG=false`.
- `FRONTEND_URL` dan `CORS_ALLOWED_ORIGINS` harus sesuai domain frontend production.
- API keys harus disimpan di backend/server environment, bukan di frontend.
