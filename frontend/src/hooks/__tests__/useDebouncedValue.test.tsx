import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

describe('useDebouncedValue', () => {
  it('updates only after the configured delay', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 250), {
      initialProps: { value: 'A' },
    });

    expect(result.current).toBe('A');

    rerender({ value: 'AAP' });
    expect(result.current).toBe('A');

    act(() => {
      vi.advanceTimersByTime(249);
    });
    expect(result.current).toBe('A');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('AAP');

    vi.useRealTimers();
  });
});
