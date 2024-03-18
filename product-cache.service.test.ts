import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProductCacheService from '../product-cache.service';
import type { Product } from '~/interfaces/models/product';

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

describe('ProductCacheService', () => {
  let productCacheService: ProductCacheService;
  let mockProducts: Product[];

  beforeEach(() => {
    productCacheService = new ProductCacheService();
    mockProducts = [
      {
        id: 1,
        brandId: 7,
        companyId: 3,
        productCode: 'TTSN',
        productName: 'Beautiful Northern Thailand',
        duration: 15,
        brandName: 'Intrepid',
        companyCode: '4299',
        companyName: 'Intrepid Thailand',
        businessId: 4,
      },
      {
        id: 2,
        brandId: 6,
        companyId: 2,
        productCode: 'XMKN',
        productName: 'Classic Morocco',
        duration: 8,
        brandName: 'Topdeck Travel',
        companyCode: '4401',
        companyName: 'Intrepid Morocco',
        businessId: 3,
      },
    ];
  });

  it('should add product data', async () => {
    await productCacheService.addProductData(mockProducts);
    expect(productCacheService.cacheStore.putValues).toHaveBeenCalledWith(
      mockProducts.map(toRaw)
    );
  });

  it('should retrieve all product records', async () => {
    const getAllSpy = vi
      .spyOn(productCacheService.cacheStore, 'getAll')
      .mockResolvedValue(mockProducts);
    const products = await productCacheService.getAllRecords();
    expect(getAllSpy).toHaveBeenCalled();
    expect(products).toEqual(mockProducts);
  });

  it('should delete a product record', async () => {
    const deleteSpy = vi
      .spyOn(productCacheService.cacheStore, 'delete')
      .mockResolvedValue(undefined);
    await productCacheService.deleteRecord(1);
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });
});
