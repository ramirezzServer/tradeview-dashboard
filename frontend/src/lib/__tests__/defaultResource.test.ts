import { describe, it, expect } from 'vitest';
import { shouldAutoCreate } from '../defaultResource';

describe('shouldAutoCreate', () => {
  it('returns true when loading is done and list is empty', () => {
    expect(shouldAutoCreate(false, [], false, false)).toBe(true);
  });

  it('returns true when list is undefined and not loading', () => {
    expect(shouldAutoCreate(false, undefined, false, false)).toBe(true);
  });

  it('returns false while still loading', () => {
    expect(shouldAutoCreate(true, [], false, false)).toBe(false);
  });

  it('returns false when list already has items', () => {
    expect(shouldAutoCreate(false, [{ id: 1 }], false, false)).toBe(false);
  });

  it('returns false when creation is in progress', () => {
    expect(shouldAutoCreate(false, [], true, false)).toBe(false);
  });

  it('returns false when already created this session', () => {
    expect(shouldAutoCreate(false, [], false, true)).toBe(false);
  });
});
