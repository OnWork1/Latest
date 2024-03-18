import { indexedDB, IDBFactory } from 'fake-indexeddb';
import { describe, it, expect, beforeEach } from 'vitest';

const resetDatabase = async () => {
  const dbs = await indexedDB.databases();
  await Promise.all(dbs.map((db) => indexedDB.deleteDatabase(db.name!)));
};

beforeEach(async () => {
  await resetDatabase();
});

export const mockedIndexedDB: IDBFactory = indexedDB;
