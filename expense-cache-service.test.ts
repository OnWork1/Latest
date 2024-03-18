import { describe, it, expect, beforeEach, vi } from 'vitest';
import ExpenseCacheService from '../expense-cache.service';
import type { Expense } from '~/interfaces/models/expense';
import { ExpenseType } from '~/enums/expense-type';

vi.mock('../persistance.service', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        putValue: vi.fn(),
        getById: vi.fn(),
        getAll: vi.fn(),
      };
    }),
  };
});

describe('ExpenseCacheService', () => {
  let expenseCacheService: ExpenseCacheService;
  let mockExpenses: Expense[];

  beforeEach(() => {
    expenseCacheService = new ExpenseCacheService();
    mockExpenses = [
      {
        expenseTitle: 'Sample Expense Title',
        expenseType: ExpenseType.EXPENSE,
        expenseDate: '2024-02-23',
        accountId: 1,
        expenseCategoryId: 1,
        status: 'Pending',
        amount: 100.0,
      },
    ];
  });

  it('should add a list of expenses to the cache', async () => {
    await expenseCacheService.addExpenseList(mockExpenses);
    expect(expenseCacheService.cacheStore.putValue).toHaveBeenCalledWith(
      mockExpenses
    );
  });

  it('should retrieve a specific expense by cacheId', async () => {
    const getByIdSpy = vi
      .spyOn(expenseCacheService.cacheStore, 'getById')
      .mockResolvedValue(mockExpenses[0]);
    const expense = await expenseCacheService.get(mockExpenses[0].cacheId!);
    expect(getByIdSpy).toHaveBeenCalledWith(mockExpenses[0].cacheId);
    expect(expense).toEqual(mockExpenses[0]);
  });

  it('should retrieve all expense records', async () => {
    const getAllSpy = vi
      .spyOn(expenseCacheService.cacheStore, 'getAll')
      .mockResolvedValue(mockExpenses);
    const expenses = await expenseCacheService.getAllRecords();
    expect(getAllSpy).toHaveBeenCalled();
    expect(expenses).toEqual(mockExpenses);
  });
});
