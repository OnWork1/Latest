import { describe, it, expect, beforeEach, vi } from 'vitest';
import SalesTaxGroupCacheService from '../sales-tax-group-cache.service';
import PersistanceService from '../persistance.service';
import type { SalesTaxGroup } from '~/interfaces/models/sales-tax-group';

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

describe('SalesTaxGroupCacheService', () => {
  let salesTaxGroupCacheService: SalesTaxGroupCacheService;
  let mockSalesTaxGroups: SalesTaxGroup[];

  beforeEach(() => {
    salesTaxGroupCacheService = new SalesTaxGroupCacheService();
    mockSalesTaxGroups = [
      {
        id: 1,
        salesTaxGroupCode: 'GST25',
      },
      {
        id: 2,
        salesTaxGroupCode: 'TAXFREE',
      },
    ];
  });

  it('should add sales tax group data', async () => {
    await salesTaxGroupCacheService.addSalesTaxGroup(mockSalesTaxGroups);
    expect(salesTaxGroupCacheService.cacheStore.putValues).toHaveBeenCalledWith(
      mockSalesTaxGroups.map(toRaw)
    );
  });

  it('should retrieve all sales tax group records', async () => {
    const getAllSpy = vi
      .spyOn(salesTaxGroupCacheService.cacheStore, 'getAll')
      .mockResolvedValue(mockSalesTaxGroups);
    const taxes = await salesTaxGroupCacheService.getAllRecords();
    expect(getAllSpy).toHaveBeenCalled();
    expect(taxes).toEqual(mockSalesTaxGroups);
  });

  it('should delete a sales tax group record', async () => {
    const deleteSpy = vi
      .spyOn(salesTaxGroupCacheService.cacheStore, 'delete')
      .mockResolvedValue(undefined);
    await salesTaxGroupCacheService.deleteRecord(1);
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });
});
