import {
  convertDateFormat,
  convertToISOString,
  currencyFormatter,
} from '~/utils/helpers';
import dayjs from 'dayjs';
import { AppRole } from '~/enums/app-role';
import { describe, test, expect } from 'vitest';
import { AccountStatus } from '~/enums/account-status';

describe('helpers', () => {
  test('convertDateFormat', () => {
    const date = '2022-12-31';
    const expectedFormat = dayjs(date).format('DD/MM/YYYY');
    expect(convertDateFormat(date)).toBe(expectedFormat);
  });

  test('convertToISOString with string input', () => {
    const date = '31/12/2022';
    const expectedFormat = new Date('2022-12-31').toISOString();
    expect(convertToISOString(date)).toBe(expectedFormat);
  });

  test('convertToISOString with Date input', () => {
    const date = new Date('2022-12-31');
    const expectedFormat = date.toISOString();
    expect(convertToISOString(date)).toBe(expectedFormat);
  });

  test('currencyFormatter', () => {
    const amount = 1234.56;
    const expectedFormat = new Intl.NumberFormat('en', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
    expect(currencyFormatter(amount)).toBe(expectedFormat);
  });

  test('getAccountStatuses', () => {
    const roles = [AppRole.OperationsManager];
    const expectedStatuses = accountStatuses.filter(
      (status) => status.value !== AccountStatus.SUBMITTED
    );
    expect(getAccountStatuses(roles)).toEqual(expectedStatuses);
  });

  test('should return the correct flag for a valid currency code', () => {
    const result = getFlagByCurrencyCode('USD');
    expect(result).toBe('🇺🇸');
  });

  test('should return an empty string for an unknown currency code', () => {
    const result = getFlagByCurrencyCode('XYZ');
    expect(result).toBe('');
  });

  test('should handle case sensitivity in currency codes', () => {
    const result = getFlagByCurrencyCode('eur');
    expect(result).toBe('🇪🇺');
  });

  test('should return an empty string if the input is an empty string', () => {
    const result = getFlagByCurrencyCode('');
    expect(result).toBe('');
  });
});
