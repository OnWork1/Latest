import { describe, it, expect, beforeEach, vi } from 'vitest';
import CurrencyCacheService from '../currency-cache.service';
import type { Currency } from '~/interfaces/models/currency';

vi.mock('../persistance.service', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        putValues: vi.fn(),
        getAll: vi.fn(),
        delete: vi.fn(),
      };
    }),
  };
});

describe('CurrencyCacheService', () => {
  let currencyCacheService: CurrencyCacheService;
  let mockCurrencies: Currency[];

  beforeEach(() => {
    currencyCacheService = new CurrencyCacheService();
    mockCurrencies = [
      {
        id: 2,
        currencyCode: 'AUD',
        currencyName: 'Australian Dollar',
        currencyRate: 1,
      },
      {
        id: 3,
        currencyCode: 'GBP',
        currencyName: 'British Pound',
        currencyRate: 1.94,
      },
      {
        id: 4,
        currencyCode: 'MAD',
        currencyName: 'Moroccan Dirham',
        currencyRate: 0.15,
      },
    ];
  });

  it('should add currency data', async () => {
    await currencyCacheService.addCurrencyData(mockCurrencies);
    expect(currencyCacheService.cacheStore.putValues).toHaveBeenCalledWith(
      mockCurrencies.map(toRaw)
    );
  });

  it('should retrieve all currency records', async () => {
    const getAllSpy = vi
      .spyOn(currencyCacheService.cacheStore, 'getAll')
      .mockResolvedValue(mockCurrencies);
    const currencies = await currencyCacheService.getAllRecords();
    expect(getAllSpy).toHaveBeenCalled();
    expect(currencies).toEqual(mockCurrencies);
  });

  it('should delete a currency record', async () => {
    const deleteSpy = vi
      .spyOn(currencyCacheService.cacheStore, 'delete')
      .mockResolvedValue(undefined);
    await currencyCacheService.deleteRecord(1);
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });
});
