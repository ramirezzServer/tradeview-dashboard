# Project Instructions

## Project Overview
This project is a stock tracking platform with a premium frontend that has already been completed.
The frontend currently uses Finnhub for market data and has the following pages:

- Dashboard
- Watchlist
- Portfolio
- Market Overview
- Technical Analysis
- Sector Counter
- News
- Financial Snapshot
- Settings

The frontend design and structure should be treated as stable and should not be changed unless explicitly requested.

## Current Development Phase
We are now starting the backend phase.

The backend must be built with:
- PHP
- Laravel

## Backend Goal
Build a clean Laravel backend foundation for this stock tracking platform.

The first backend phase should focus on:
1. Secure Finnhub proxy endpoints
2. Environment-based API key handling
3. SQLite setup for initial development
4. Future-ready database schema
5. Clean REST API structure for frontend integration

## Important Rules
- Do not modify the frontend unless explicitly asked
- Do not replace Laravel with another backend stack
- Do not use Node.js backend
- Do not use Supabase
- Do not use Firebase
- Do not add any extra stock market API besides Finnhub
- Keep the code modular and beginner-friendly
- Follow Laravel best practices
- Keep controllers thin
- Put Finnhub logic in a dedicated service class
- Validate all request parameters
- Return consistent JSON responses
- Do not hardcode secrets
- Read the Finnhub API key from Laravel environment variables only

## Database Rules
- Start with SQLite for local development
- Structure migrations and models so the project can be migrated to MySQL later
- Prepare the backend for future features such as:
  - authentication
  - watchlist persistence
  - portfolio persistence
  - user settings

## Backend Scope for Phase 1
Build only Phase 1 backend features:

### Finnhub Proxy Endpoints
- GET /api/market/quote/{symbol}
- GET /api/market/candles/{symbol}
- GET /api/market/news
- GET /api/market/profile/{symbol}
- GET /api/market/financials/{symbol}

### Backend Responsibilities
- Hide the Finnhub API key from the frontend
- Validate input
- Normalize Finnhub responses when needed
- Handle API errors gracefully
- Handle rate limits gracefully
- Add simple caching if helpful and easy to maintain

## Expected Architecture
Use Laravel conventions and organize the code cleanly:
- routes/api.php
- Controllers
- Services
- Form Requests
- Models
- Migrations

## Response Format
Use a consistent JSON format like:
- success
- message
- data
- meta (optional)

## Working Style
- Work step by step
- Explain important file creation or structural decisions briefly
- Prefer clear maintainable code over overengineering
- Preserve a clean foundation for future expansion

## Future Phase (Not Now)
Do not implement these yet unless explicitly requested:
- full authentication
- watchlist CRUD for users
- portfolio CRUD for users
- notifications
- AI prediction backend
- advanced scheduled jobs