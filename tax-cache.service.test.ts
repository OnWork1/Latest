import { describe, it, expect, beforeEach, vi } from 'vitest';
import TaxCacheService from '../tax-cache.service';
import { mockedIndexedDB } from './indexedDBMock';
import type { Tax } from '~/interfaces/models/tax';

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

describe('TaxCacheService', () => {
  let taxCacheService: TaxCacheService;
  let mockTaxes: Tax[];

  beforeEach(() => {
    taxCacheService = new TaxCacheService();
    mockTaxes = [
      {
        id: 1,
        taxCode: 'TAXFREE',
        taxRate: 0,
      },
      {
        id: 2,
        taxCode: 'THAILAND10%',
        taxRate: 10,
      },
    ];
  });

  it('should add tax data correctly', async () => {
    await taxCacheService.addTaxData(mockTaxes);
    expect(taxCacheService.cacheStore.putValues).toHaveBeenCalledWith(
      mockTaxes.map(toRaw)
    );
  });

  it('should retrieve all tax records', async () => {
    vi.spyOn(taxCacheService.cacheStore, 'getAll').mockResolvedValue(mockTaxes);
    const taxes = await taxCacheService.getAllRecords();
    expect(taxes).toEqual(mockTaxes);
  });

  it('should delete a tax record', async () => {
    const deleteSpy = vi
      .spyOn(taxCacheService.cacheStore, 'delete')
      .mockResolvedValue(undefined);
    await taxCacheService.deleteRecord(1);
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });
});
