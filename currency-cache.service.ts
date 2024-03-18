import type { Currency } from '~/interfaces/models/currency';
import PersistanceService from './persistance.service';
import { toRaw } from 'vue';

export default class CurrencyCacheService {
  cacheStore: PersistanceService;
  collectionName: string = 'offline-currencies';
  constructor() {
    this.cacheStore = new PersistanceService(this.collectionName);
  }

  async addCurrencyData(currencies: Currency[]) {
    const filteredCurrencies = currencies.map((currency) => toRaw(currency));
    await this.cacheStore.putValues(filteredCurrencies);
  }
  async getAllRecords() {
    return this.cacheStore.getAll();
  }

  async deleteRecord(key: number) {
    return this.cacheStore.delete(key);
  }
}
