import { describe, expect, it } from 'vitest';
import getISODateTime from '~/utils/get-iso-date-time';

describe('getISODateTime', () => {
  it('should return a string', () => {
    const result = getISODateTime();
    expect(typeof result).toBe('string');
  });

  it('should return a string in ISO date format', () => {
    const result = getISODateTime();
    const date = new Date(result);
    expect(date.toISOString()).toBe(result);
  });

  it('should return a string of correct length for ISO date', () => {
    const result = getISODateTime();
    // ISO 8601 date string length is 24: "YYYY-MM-DDTHH:mm:ss.sssZ"
    expect(result.length).toBe(24);
  });

  it('should not return a date in the future', () => {
    const result = getISODateTime();
    const date = new Date(result);
    expect(date.getTime()).toBeLessThanOrEqual(Date.now());
  });
});
