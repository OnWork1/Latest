import { describe, expect, it } from 'vitest';
import { truncateString } from '~/utils/string-truncate';

describe('string truncate utility', () => {
  it('should truncate string when length is less than input length', () => {
    const input = 'This is a test sentence';
    const length = 10;
    const result = truncateString(input, length);
    expect(result).toBe('This is...');
  });

  it('should not truncate when input length is less than or equal to specified length', () => {
    const input = 'Short';
    const length = 10;
    const result = truncateString(input, length);
    expect(result).toBe('Short');
  });

  it('should handle case where length is exactly 0', () => {
    const input = 'Test string';
    const length = 0;
    const result = truncateString(input, length);
    expect(result).toBe('...');
  });

  it('should not truncate when length is greater than input length', () => {
    const input = 'Hello';
    const length = 20;
    const result = truncateString(input, length);
    expect(result).toBe('Hello');
  });

  it('should handle case where length is exactly 3 characters more than input length', () => {
    const input = '123456789';
    const length = 6;
    const result = truncateString(input, length);
    expect(result).toBe('123...');
  });
});
