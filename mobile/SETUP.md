# TradeView Mobile Setup

Panduan singkat untuk menjalankan mobile app TradeView Dashboard berbasis React Native, Expo, dan Expo Router.

---

## Quick Start

```bash
cd mobile
npm install
npm start
```

Scan QR code dengan Expo Go atau jalankan melalui emulator/simulator.

---

## Requirements

| Tool | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Expo Go | Latest |
| Laravel backend | Berjalan dan bisa diakses mobile app |

---

## Backend Harus Berjalan

Untuk testing dengan real device di jaringan LAN yang sama, jalankan backend agar listen ke semua interface:

```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

Backend tetap memakai base URL API dengan suffix `/api`.

---

## API Base URL

Mobile memakai `apiBaseUrl` dari konfigurasi Expo. Default development biasanya mengarah ke backend lokal.

Untuk real device, jangan gunakan:

```txt
http://localhost:8000
```

Gunakan IP laptop/server yang bisa diakses dari perangkat:

```txt
http://192.168.x.x:8000
```

Cara mencari IP lokal:

- Windows: `ipconfig`, lihat `IPv4 Address`
- macOS/Linux: `ifconfig` atau `ip addr`, lihat alamat interface Wi-Fi/LAN

---

## Architecture

```txt
mobile/
+-- app/              # Expo Router file-based routing
|   +-- _layout.tsx   # Providers dan auth gate
|   +-- (auth)/       # Login dan register
|   `-- (tabs)/       # Dashboard, watchlist, portfolio, news, settings
`-- src/
    +-- components/   # UI dan feature components
    +-- hooks/        # React Query hooks
    +-- services/     # Axios API services
    +-- store/        # Zustand auth/session state
    +-- theme/        # Theme dan warna
    `-- types/        # TypeScript interfaces
```

Mobile app mengonsumsi Laravel API yang sama dengan web frontend. Token auth dikirim sebagai Bearer token, dan session dibersihkan ketika API mengembalikan HTTP 401.

---

## Tech Notes

- Zustand digunakan untuk auth/session state.
- TanStack React Query digunakan untuk cache dan data fetching.
- Axios digunakan untuk request API dan interceptor auth.
- Expo Router digunakan untuk navigasi berbasis file.

---

## Testing

```bash
npm run android
npm run ios
npm run web
npm run lint
```

Untuk masalah cache Expo:

```bash
npx expo start -c
```

Dokumentasi ini tidak mengubah konfigurasi runtime mobile atau flow testing Katalon.
