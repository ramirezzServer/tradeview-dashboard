# TradeView Backend

Backend TradeView Dashboard adalah REST API berbasis Laravel 12. API ini menangani autentikasi, portfolio, watchlist, settings, saved news, push subscription, dan proxy market data ke provider eksternal.

---

## Tech Stack

- PHP 8.2+
- Laravel 12
- Laravel Sanctum
- PostgreSQL
- Finnhub API
- Alpha Vantage API
- CoinGecko API
- Web Push notification

---

## Setup Lokal

```bash
cd backend
composer install
cp .env.example .env
```

Isi konfigurasi PostgreSQL online/cloud:

```env
DB_CONNECTION=pgsql
DB_URL=postgresql://username:password@host:5432/database
DB_HOST=your-postgres-host
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Isi juga konfigurasi aplikasi dan API key sesuai kebutuhan:

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173

FINNHUB_API_KEY=your-finnhub-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
COINGECKO_API_KEY=your-coingecko-key-if-needed

WEBPUSH_VAPID_PUBLIC_KEY=your-vapid-public-key
WEBPUSH_VAPID_PRIVATE_KEY=your-vapid-private-key
WEBPUSH_VAPID_SUBJECT=mailto:admin@example.com
```

Jalankan:

```bash
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Default backend berjalan di `http://localhost:8000`.

---

## Endpoint Ringkas

Public endpoint utama:

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

Protected endpoint menggunakan `Authorization: Bearer {token}`:

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

Detail endpoint ada di `../docs/api-endpoints.md`.

---

## Testing

```bash
php artisan test
```

Jika route berubah pada pekerjaan lain, cek ulang dengan:

```bash
php artisan route:list
```

Dokumentasi ini tidak mengubah route, controller, model, migration, atau konfigurasi runtime aktif.

---

## Catatan Market Data

Data saham dan crypto bergantung pada Finnhub, Alpha Vantage, dan CoinGecko. Jika provider gagal atau terkena limit, backend dapat memakai fallback, simulated, atau calculated data untuk menjaga UI tetap tampil saat demo/pengujian.

Data fallback bukan saran investasi.
