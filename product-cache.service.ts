import type { Product } from '~/interfaces/models/product';
import PersistanceService from './persistance.service';
import { toRaw } from 'vue';

export default class ProductCacheService {
  cacheStore: PersistanceService;
  collectionName: string = 'offline-products';
  constructor() {
    this.cacheStore = new PersistanceService(this.collectionName);
  }

  async addProductData(products: Product[]) {
    const filteredProducts = products.map((product) => toRaw(product));
    await this.cacheStore.putValues(filteredProducts);
  }
  async getAllRecords() {
    return this.cacheStore.getAll();
  }

  async deleteRecord(key: number) {
    return this.cacheStore.delete(key);
  }
}
