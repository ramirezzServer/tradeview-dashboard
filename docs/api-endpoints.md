# API Endpoints

Dokumen ini mengikuti route Laravel di:

```txt
backend/routes/api.php
```

Prefix `/api` ditambahkan otomatis oleh Laravel. Protected endpoint membutuhkan:

```txt
Authorization: Bearer {token}
```

---

## Response Envelope

Client web dan mobile mengharapkan response Laravel dalam bentuk umum:

```ts
{
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}
```

Beberapa `DELETE` endpoint dapat mengembalikan response kosong/`204 No Content`, jadi client perlu menangani empty response dengan aman.

---

## Public Endpoints

Endpoint berikut tidak membutuhkan Bearer token.

```txt
GET  /api/healthz
POST /api/auth/register
POST /api/auth/login
```

### Market Data

```txt
GET /api/market/quote/{symbol}
GET /api/market/quotes?symbols=AAPL,MSFT
GET /api/market/candles/{symbol}
GET /api/market/candles-alt/{symbol}
GET /api/market/news
GET /api/market/profile/{symbol}
GET /api/market/financials/{symbol}
GET /api/market/company-news/{symbol}
GET /api/market/movers
GET /api/market/indices
GET /api/market/sectors
GET /api/market/earnings/{symbol}
GET /api/market/crypto/prices
GET /api/market/crypto/ohlcv/{symbol}
GET /api/market/crypto/supported
```

Catatan query parameter umum:

| Endpoint | Query parameter |
|---|---|
| `/api/market/quotes` | `symbols=AAPL,MSFT` |
| `/api/market/candles/{symbol}` | `resolution`, `from`, `to` |
| `/api/market/candles-alt/{symbol}` | `from`, `to` |
| `/api/market/news` | `category`, `minId` |
| `/api/market/company-news/{symbol}` | `from`, `to` dengan format `YYYY-MM-DD` |
| `/api/market/crypto/prices` | `symbols=BTC,ETH,SOL` |

---

## Protected Auth

```txt
POST /api/auth/logout
GET  /api/auth/me
```

---

## Watchlists

```txt
GET    /api/watchlists
POST   /api/watchlists
GET    /api/watchlists/{id}
PUT    /api/watchlists/{id}
DELETE /api/watchlists/{id}
POST   /api/watchlists/{id}/items
PUT    /api/watchlist-items/{id}
DELETE /api/watchlist-items/{id}
```

Kegunaan:

- Mengelola daftar watchlist milik user.
- Menambah, mengubah, dan menghapus symbol di watchlist.
- Semua data harus ter-scope ke user yang sedang login.

---

## Portfolios

```txt
GET    /api/portfolios
POST   /api/portfolios
GET    /api/portfolios/{id}
PUT    /api/portfolios/{id}
DELETE /api/portfolios/{id}
POST   /api/portfolios/{id}/items
PUT    /api/portfolio-items/{id}
DELETE /api/portfolio-items/{id}
```

Kegunaan:

- Mengelola portfolio milik user.
- Menambah, mengubah, dan menghapus holding/asset di portfolio.
- Semua data harus ter-scope ke user yang sedang login.

---

## Settings

```txt
GET /api/settings
PUT /api/settings
```

Kegunaan:

- Membaca settings user.
- Mengubah settings user secara partial atau full.

---

## Push Subscription

```txt
POST   /api/push/subscribe
DELETE /api/push/unsubscribe
```

Contoh body subscribe:

```json
{
  "endpoint": "https://push-service.example/...",
  "keys": {
    "p256dh": "browser-public-key",
    "auth": "browser-auth-secret"
  }
}
```

Contoh body unsubscribe:

```json
{
  "endpoint": "https://push-service.example/..."
}
```

Environment Web Push:

```env
WEBPUSH_VAPID_PUBLIC_KEY=
WEBPUSH_VAPID_PRIVATE_KEY=
WEBPUSH_VAPID_SUBJECT=mailto:admin@example.com
VITE_VAPID_PUBLIC_KEY=
```

`WEBPUSH_VAPID_PRIVATE_KEY` harus tetap di backend/server. `VITE_VAPID_PUBLIC_KEY` boleh diekspos ke browser.

---

## Saved News

```txt
GET    /api/news/saved
POST   /api/news/saved
PUT    /api/news/saved/{savedNews}
DELETE /api/news/saved/{savedNews}
```

Kegunaan:

- Menampilkan artikel yang disimpan user.
- Menyimpan artikel.
- Mengubah notes atau metadata saved news.
- Menghapus artikel dari daftar saved news.

---

## Client Notes

Client utama:

```txt
frontend/src/services/api.ts
mobile/src/services/api.ts
```

Frontend menyimpan Bearer token di `localStorage` dengan key `auth_token`. Mobile membaca token dari Zustand auth store melalui token getter dan membersihkan session ketika API mengembalikan HTTP 401.

---

## Catatan Market Data

Laravel API menjadi proxy ke Finnhub, Alpha Vantage, dan CoinGecko. API key provider disimpan di backend environment, bukan di frontend/mobile.

Jika provider eksternal terkena limit, tidak aktif, atau gagal, backend dapat memakai fallback, simulated, atau calculated data agar UI tetap tampil untuk demo dan pengujian. Data fallback bukan saran investasi.
