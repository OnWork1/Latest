import type { SalesTaxGroup } from '~/interfaces/models/sales-tax-group';
import PersistanceService from './persistance.service';
import { toRaw } from 'vue';

export default class SalesTaxGroupCacheService {
  cacheStore: PersistanceService;
  collectionName: string = 'offline-sales-tax-group';
  constructor() {
    this.cacheStore = new PersistanceService(this.collectionName);
  }

  async addSalesTaxGroup(taxes: SalesTaxGroup[]) {
    const filteredSalesTaxes = taxes.map((filteredSalesTax) =>
      toRaw(filteredSalesTax)
    );
    await this.cacheStore.putValues(filteredSalesTaxes);
  }
  async getAllRecords() {
    return this.cacheStore.getAll();
  }

  async deleteRecord(key: number) {
    return this.cacheStore.delete(key);
  }
}
