import PersistanceService from './persistance.service';

export default class AccountCacheService {
  cacheStore: PersistanceService;
  collectionName: string = 'offline-accounts';
  constructor() {
    this.cacheStore = new PersistanceService(this.collectionName);
  }

  async add(accountDetail: unknown) {
    await this.cacheStore.clear();
    await this.cacheStore.putValue(accountDetail || {});
  }

  async get() {
    const result = await this.cacheStore.getAll();
    if (result && result.length > 0) return result[0];
    else return [];
  }

  async getbyId(accountId: number) {
    const result = await this.cacheStore.getById(accountId);

    return result;
  }

  async delete(key: number) {
    return await this.cacheStore.delete(key);
  }
}
