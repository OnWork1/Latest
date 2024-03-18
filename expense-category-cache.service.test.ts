import { describe, it, expect, beforeEach, vi } from 'vitest';
import ExpenseCategoryCacheService from '../expense-category-cache.service';
import PersistanceService from '../persistance.service';
import type { ExpenseCategory } from '~/interfaces/models/expense-category';

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

describe('ExpenseCategoryCacheService', () => {
  let expenseCategoryCacheService: ExpenseCategoryCacheService;
  let mockExpenseCategories: ExpenseCategory[];

  beforeEach(() => {
    expenseCategoryCacheService = new ExpenseCategoryCacheService();
    mockExpenseCategories = [
      {
        id: 1,
        expenseName: 'VERUSHKA_EXPENSE_TAX_NAME',
        expenseCode: '005',
        defaultPaymentType: 'CASH',
        disablePaymentType: false,
      },
      {
        id: 2,
        expenseName: 'VERUSHKA_EXPENSE_TAX_NAME22',
        expenseCode: '0052222',
        defaultPaymentType: 'CASH',
        disablePaymentType: false,
      },
    ];
  });

  it('should add expense category data', async () => {
    await expenseCategoryCacheService.addExpenseCategoryData(
      mockExpenseCategories
    );
    expect(
      expenseCategoryCacheService.cacheStore.putValues
    ).toHaveBeenCalledWith(mockExpenseCategories.map(toRaw));
  });

  it('should retrieve all expense category records', async () => {
    const getAllSpy = vi
      .spyOn(expenseCategoryCacheService.cacheStore, 'getAll')
      .mockResolvedValue(mockExpenseCategories);
    const expenseCategories = await expenseCategoryCacheService.getAllRecords();
    expect(getAllSpy).toHaveBeenCalled();
    expect(expenseCategories).toEqual(mockExpenseCategories);
  });

  it('should delete an expense category record', async () => {
    const deleteSpy = vi
      .spyOn(expenseCategoryCacheService.cacheStore, 'delete')
      .mockResolvedValue(undefined);
    await expenseCategoryCacheService.deleteRecord(1);
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });
});
