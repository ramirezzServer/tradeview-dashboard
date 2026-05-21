# TradeView Dashboard Setup

## Required Environment Variables

Frontend (`frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
```

Backend (`backend/.env`):

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.example

FINNHUB_API_KEY=your-free-finnhub-key
FINNHUB_BASE_URL=https://finnhub.io/api/v1

ALPHA_VANTAGE_KEY=optional-free-alpha-vantage-key
ALPHA_VANTAGE_BASE_URL=https://www.alphavantage.co/query

VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@example.com
```

Mobile uses `expo.extra.apiBaseUrl` in `mobile/app.json`. The default is `http://localhost:8000`; for a physical phone, set it to your computer's LAN URL, for example `http://192.168.x.x:8000`.

## API Keys

Finnhub is required for live stocks, ETF proxy indices, sector ETFs, news, profiles, earnings, and quotes. Create a free key at `https://finnhub.io`.

Alpha Vantage is optional and limited to 25 requests per day on the free tier. Create a free key at `https://www.alphavantage.co/support/#api-key`. When unavailable or rate-limited, the app falls back to calculated/simulated candle data so charts still render.

CoinGecko basic prices require no key. Crypto OHLCV may require a paid plan, so the backend simulates realistic OHLCV candles from the current free-tier spot price when CoinGecko OHLCV is unavailable.

## Run Locally

Backend:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Mobile:

```bash
cd mobile
npm install
npm start
```

## Deployment

Frontend can be deployed to Vercel or Netlify. Set `VITE_API_BASE_URL` to the production backend URL including `/api`.

Backend can be deployed to PHP shared hosting or a VPS with PHP 8.2+, Composer, and a supported database. Configure `.env`, run migrations, point the web root at `backend/public`, and run Laravel's scheduler every minute:

```bash
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

Set `CORS_ALLOWED_ORIGINS` to your production frontend domain.
