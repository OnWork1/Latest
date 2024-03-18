import type { ExpenseCategory } from '~/interfaces/models/expense-category';
import PersistanceService from './persistance.service';
import { toRaw } from 'vue';

export default class ExpenseCategoryCacheService {
  cacheStore: PersistanceService;
  collectionName: string = 'offline-expense-categories';
  constructor() {
    this.cacheStore = new PersistanceService(this.collectionName);
  }

  async addExpenseCategoryData(expenseCategories: ExpenseCategory[]) {
    const filteredExpenseCategories = expenseCategories.map((expenseCategory) =>
      toRaw(expenseCategory)
    );
    await this.cacheStore.putValues(filteredExpenseCategories);
  }
  async getAllRecords() {
    return this.cacheStore.getAll();
  }

  async deleteRecord(key: number) {
    return this.cacheStore.delete(key);
  }
}
