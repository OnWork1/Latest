import { describe, it, expect, beforeEach, vi } from 'vitest';
import AccountCacheService from '../account-cache.service';
import type { Account } from '~/interfaces/models/account';

vi.mock('./persistance.service', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        clear: vi.fn(),
        putValue: vi.fn(),
        getAll: vi.fn(),
        getById: vi.fn(),
        delete: vi.fn(),
      };
    }),
  };
});

describe('AccountCacheService', () => {
  let accountCacheService: AccountCacheService;
  let mockAccountDetail: Account;

  beforeEach(() => {
    accountCacheService = new AccountCacheService();
    mockAccountDetail = {
      id: 2,
      accountStatus: 'SUBMITTED',
      tripCode: 'trip1',
      noOfLeaders: 1,
      noOfPassengers: 1,
      productId: 1,
      departureDate:
        'Thu Feb 15 2024 00:00:00 GMT+0000 (Coordinated Universal Time)',
      totalBudget: 1637,
      totalExpenses: 0,
      leader: '',
      baseCurrencyCode: 'THB',
      finishDate:
        'Thu Feb 29 2024 00:00:00 GMT+0000 (Coordinated Universal Time)',
    };
  });

  it('should return the account detail if exists', async () => {
    vi.spyOn(accountCacheService.cacheStore, 'getAll').mockResolvedValue([
      mockAccountDetail,
    ]);
    const result = await accountCacheService.get();
    expect(accountCacheService.cacheStore.getAll).toHaveBeenCalled();
    expect(result).toEqual(mockAccountDetail);
  });

  it('should return an empty array if no accounts exist', async () => {
    vi.spyOn(accountCacheService.cacheStore, 'getAll').mockResolvedValue([]);
    const result = await accountCacheService.get();
    expect(accountCacheService.cacheStore.getAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should retrieve account detail by ID', async () => {
    vi.spyOn(accountCacheService.cacheStore, 'getById').mockResolvedValue(
      mockAccountDetail
    );
    const result = await accountCacheService.getbyId(1);
    expect(accountCacheService.cacheStore.getById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockAccountDetail);
  });

  it('should delete a account detail', async () => {
    const deleteSpy = vi
      .spyOn(accountCacheService.cacheStore, 'delete')
      .mockResolvedValue(undefined);
    await accountCacheService.delete(1);
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });
});
