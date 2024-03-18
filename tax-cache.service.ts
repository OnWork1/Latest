import type { Tax } from '~/interfaces/models/tax';
import PersistanceService from './persistance.service';
import { toRaw } from 'vue';

export default class TaxCacheService {
  cacheStore: PersistanceService;
  collectionName: string = 'offline-taxes';
  constructor() {
    this.cacheStore = new PersistanceService(this.collectionName);
  }

  async addTaxData(taxes: Tax[]) {
    const filteredTaxes = taxes.map((tax) => toRaw(tax));
    await this.cacheStore.putValues(filteredTaxes);
  }
  async getAllRecords() {
    return this.cacheStore.getAll();
  }

  async deleteRecord(key: number) {
    return this.cacheStore.delete(key);
  }
}
