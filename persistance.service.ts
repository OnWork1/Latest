import { type IDBPDatabase, openDB } from 'idb';
import { offlineObjectStores } from '~/utils/constants';

export default class PersistanceService {
  private database: string;
  private db: IDBPDatabase | undefined;
  private tableName: string;
  private dbVersion: number = 2;

  constructor(tableName: string) {
    this.database = 'leader-offline-data';
    this.tableName = tableName;
    this.createObjectStore();
  }

  private async createObjectStore() {
    try {
      this.db = await openDB(this.database, this.dbVersion, {
        upgrade(db: IDBPDatabase) {
          for (const offlineObjectStore of offlineObjectStores) {
            if (db.objectStoreNames.contains(offlineObjectStore)) {
              continue;
            }
            db.createObjectStore(offlineObjectStore, {
              autoIncrement: true,
              keyPath: 'cacheId',
            });
          }
        },
      });
    } catch (error) {
      return false;
    }
  }

  public async getById(id: number) {
    if (this.db) {
      const tx = this.db.transaction(this.tableName, 'readonly');

      const store = tx.objectStore(this.tableName);
      return await store.get(id);
    }
  }

  public async getAll() {
    if (this.db) {
      const tx = this.db?.transaction(this.tableName, 'readonly');

      const store = tx?.objectStore(this.tableName);
      return await store?.getAll();
    }
  }

  public async putValue(value: object) {
    if (this.db) {
      const tx = this.db.transaction(this.tableName, 'readwrite');
      const store = tx.objectStore(this.tableName);
      return await store.put(value);
    }
  }

  public async clear() {
    if (this.db) {
      const tx = this.db.transaction(this.tableName, 'readwrite');
      const store = tx.objectStore(this.tableName);

      return await store.clear();
    }
  }

  public async putValues(values: object[]) {
    if (this.db) {
      const tx = this.db.transaction(this.tableName, 'readwrite');
      const store = tx.objectStore(this.tableName);
      for (const value of values) {
        await store.put(value);
      }
      return this.getAll();
    }
  }

  public async delete(id: number) {
    if (this.db) {
      const tx = this.db.transaction(this.tableName, 'readwrite');
      const store = tx.objectStore(this.tableName);
      const result = await store.get(id);
      if (!result) {
        return result;
      }
      await store.delete(id);

      return id;
    }
  }
}
