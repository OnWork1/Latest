import type { Department } from '~/interfaces/models/department';
import PersistanceService from './persistance.service';
import { toRaw } from 'vue';

export default class DepartmentCacheService {
  cacheStore: PersistanceService;
  collectionName: string = 'offline-departments';
  constructor() {
    this.cacheStore = new PersistanceService(this.collectionName);
  }

  async addDepartmentData(storeName: string, departments: Department[]) {
    const filteredDepartments = departments.map((dept) => toRaw(dept));
    await this.cacheStore.putValues(filteredDepartments);
  }
  async getAllRecords() {
    return this.cacheStore.getAll();
  }

  async deleteRecord(key: number) {
    return this.cacheStore.delete(key);
  }
}
