import { describe, expect, it } from 'vitest';
import { retryUnlessClientError } from '@/lib/queryOptions';

describe('retryUnlessClientError', () => {
  it('does not retry client/auth/rate-limit failures', () => {
    expect(retryUnlessClientError(0, new Error('HTTP_422'))).toBe(false);
    expect(retryUnlessClientError(0, new Error('RATE_LIMITED'))).toBe(false);
    expect(retryUnlessClientError(0, new Error('UNAUTHORIZED'))).toBe(false);
  });

  it('retries transient failures up to two attempts', () => {
    expect(retryUnlessClientError(0, new Error('HTTP_503'))).toBe(true);
    expect(retryUnlessClientError(1, new Error('REQUEST_TIMEOUT'))).toBe(true);
    expect(retryUnlessClientError(2, new Error('REQUEST_TIMEOUT'))).toBe(false);
  });
});
