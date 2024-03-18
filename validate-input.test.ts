import { describe, expect, it } from 'vitest';
import { validateInput } from '~/utils/validate-input';

describe('validateInput', () => {
  it('should return true when value is provided', () => {
    const result = validateInput('test', 'fieldName');
    expect(result).toBe(true);
  });

  it('should return error message when value is not provided', () => {
    const fieldName = 'Test Field';
    const result = validateInput(null, fieldName);
    expect(result).toBe(`${fieldName} is required.`);
  });

  it('should return error message when value is an empty string', () => {
    const fieldName = 'Test Field';
    const result = validateInput('', fieldName);
    expect(result).toBe(`${fieldName} is required.`);
  });

  it('should return true when value is a number', () => {
    const result = validateInput(123, 'fieldName');
    expect(result).toBe(true);
  });

  it('should return true when value is a boolean', () => {
    const result = validateInput(true, 'fieldName');
    expect(result).toBe(true);
  });
});
