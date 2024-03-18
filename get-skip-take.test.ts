import { describe, expect, it } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import getSkipTake from '~/utils/get-skip-take';

describe('getSkipTake', () => {
  mockNuxtImport('useRuntimeConfig', () => {
    return () => {
      return { defaultPageLimit: 20 };
    };
  });

  it('should return default values when no arguments are provided', () => {
    const result = getSkipTake();
    expect(result.skip).toBe(0);
    expect(result.take).toBe(20);
  });

  it('should override default take value when perPage is provided', () => {
    const result = getSkipTake(25);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(25);
  });

  it('should calculate skip and take values correctly when both perPage and page are provided', () => {
    const result = getSkipTake(25, 3);
    expect(result.skip).toBe(50);
    expect(result.take).toBe(25);
  });

  it('should calculate skip value correctly when only page is provided', () => {
    const result = getSkipTake(undefined, 3);
    expect(result.skip).toBe(40);
    expect(result.take).toBe(20);
  });

  it('should return default take value when only perPage is provided', () => {
    const result = getSkipTake(30);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(30);
  });

  it('should return skip as 0 when page is 1', () => {
    const result = getSkipTake(30, 1);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(30);
  });

  it('should return skip as 0 when page is 0', () => {
    const result = getSkipTake(30, 0);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(30);
  });
});
