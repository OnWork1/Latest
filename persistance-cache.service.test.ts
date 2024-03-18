import { describe, it, expect, beforeEach, vi } from 'vitest';
import PersistanceService from '../persistance.service';
import { openDB } from 'idb';

vi.mock('idb', () => ({
  openDB: vi.fn(),
}));

const mockIDBObjectStore = () => ({
  get: vi.fn(),
  getAll: vi.fn(),
  put: vi.fn(),
  clear: vi.fn(),
  delete: vi.fn(),
});

const mockIDBTransaction = (store: any) => ({
  objectStore: vi.fn().mockReturnValue(store),
});

const mockIDBDatabase = (transaction: any) => ({
  transaction: vi.fn().mockReturnValue(transaction),
});

describe('PersistanceService', () => {
  let persistanceService: PersistanceService;
  let mockStore: ReturnType<typeof mockIDBObjectStore>;
  let mockTransaction: ReturnType<typeof mockIDBTransaction>;
  let mockDatabase: ReturnType<typeof mockIDBDatabase>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStore = mockIDBObjectStore();
    mockTransaction = mockIDBTransaction(mockStore);
    mockDatabase = mockIDBDatabase(mockTransaction);
    (openDB as any).mockResolvedValue(mockDatabase);

    persistanceService = new PersistanceService('testTable');
  });

  it('should successfully get an item by ID', async () => {
    const expectedItem = { id: 1, name: 'Test Item' };
    mockStore.get.mockResolvedValue(expectedItem);

    const item = await persistanceService.getById(1);

    expect(item).toEqual(expectedItem);
    expect(mockStore.get).toHaveBeenCalledWith(1);
  });

  it('should successfully get all items', async () => {
    const expectedItems = [{ id: 1, name: 'Test Item' }];
    mockStore.getAll.mockResolvedValue(expectedItems);

    const items = await persistanceService.getAll();

    expect(items).toEqual(expectedItems);
    expect(mockStore.getAll).toHaveBeenCalled();
  });

  it('should add a value to the store', async () => {
    const value = { id: 1, data: 'test data' };

    await persistanceService.putValue(value);

    expect(mockStore.put).toHaveBeenCalledWith(value);
    expect(mockTransaction.objectStore).toHaveBeenCalledWith('testTable');
    expect(mockDatabase.transaction).toHaveBeenCalledWith(
      'testTable',
      'readwrite'
    );
  });

  it('should add multiple items to the store', async () => {
    const testValues = [
      { id: 1, data: 'test1' },
      { id: 2, data: 'test2' },
    ];

    await persistanceService.putValues(testValues);

    for (const testValue of testValues) {
      expect(mockStore.put).toHaveBeenCalledWith(testValue);
    }
    expect(mockTransaction.objectStore).toHaveBeenCalledWith('testTable');
    expect(mockDatabase.transaction).toHaveBeenCalledWith(
      'testTable',
      'readwrite'
    );
  });

  it('should delete successfully', async () => {
    const itemId = 1;
    const itemToDelete = { id: itemId, name: 'Test Item' };

    mockStore.get.mockResolvedValue(itemToDelete);

    const deletedId = await persistanceService.delete(itemId);
    expect(deletedId).toEqual(itemId);
  });

  it('should add an item to the store', async () => {
    const testValue = { id: 1, name: 'Test Item' };
    await persistanceService.putValue(testValue);

    expect(mockStore.put).toHaveBeenCalledWith(testValue);
  });

  it('should clear all items from the store', async () => {
    await persistanceService.putValue({ id: 1, data: 'item1' });
    await persistanceService.putValue({ id: 2, data: 'item2' });

    await persistanceService.clear();

    expect(mockStore.clear).toHaveBeenCalled();
  });
});
