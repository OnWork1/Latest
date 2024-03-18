import type { Expense } from '~/interfaces/models/expense';
import PersistanceService from './persistance.service';

export default class ExpenseCacheService {
  cacheStore: PersistanceService;
  deletedCacheStore: PersistanceService;
  collectionName: string = 'offline-expenses';
  constructor() {
    this.cacheStore = new PersistanceService(this.collectionName);
    this.deletedCacheStore = new PersistanceService('offline-deleted-expenses');
  }

  async clear() {
    await this.cacheStore.clear();
  }

  async addExpenseList(expense: Expense[]) {
    await this.cacheStore.putValue(expense);
  }

  async get(cacheId: number) {
    return this.cacheStore.getById(cacheId);
  }

  async getAllRecords() {
    return this.cacheStore.getAll();
  }

  async getAllDeletedRecords() {
    return this.deletedCacheStore.getAll();
  }

  async clearAllDeleted() {
    await this.deletedCacheStore.clear();
  }

  async deleteRecord(key: number) {
    return this.deletedCacheStore.putValue({ deletedExpenseId: key });
  }
}
