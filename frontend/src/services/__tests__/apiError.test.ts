import { describe, expect, it } from 'vitest';
import { ApiError, getHumanApiError } from '@/services/api';

describe('getHumanApiError', () => {
  it('normalizes validation email errors', () => {
    const error = new ApiError(422, 'Validation failed.', {
      email: ['The email field must be a valid email address.'],
    });

    expect(getHumanApiError(error)).toBe('Format email salah, pastikan menggunakan tanda @.');
  });

  it('normalizes rate limit errors', () => {
    expect(getHumanApiError(new ApiError(429, 'Too many attempts.'))).toBe(
      'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
    );
  });

  it('normalizes network errors', () => {
    expect(getHumanApiError(new TypeError('Failed to fetch'))).toBe(
      'Koneksi internet bermasalah. Periksa jaringan Anda lalu coba lagi.',
    );
  });

  it('normalizes provider unavailable errors without leaking raw text', () => {
    expect(getHumanApiError(new ApiError(503, 'Finnhub API key missing in .env'))).toBe(
      'Data market sedang tidak tersedia. Coba lagi nanti.',
    );
  });
});
