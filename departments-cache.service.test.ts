import { describe, it, expect, beforeEach, vi } from 'vitest';
import DepartmentCacheService from '../department-cache.service';
import PersistanceService from '../persistance.service';
import type { Department } from '~/interfaces/models/department';

// Mock PersistanceService
vi.mock('../persistance.service', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        putValues: vi.fn(),
        getAll: vi.fn(),
        delete: vi.fn(),
      };
    }),
  };
});

describe('DepartmentCacheService', () => {
  let departmentCacheService: DepartmentCacheService;
  let mockDepartments: Department[];

  beforeEach(() => {
    departmentCacheService = new DepartmentCacheService();
    mockDepartments = [
      {
        id: 2,
        departmentName: 'Finance',
        departmentCode: '152',
      },
      {
        id: 3,
        departmentName: 'Operations',
        departmentCode: '153',
      },
    ];
  });

  it('should add department data', async () => {
    await departmentCacheService.addDepartmentData(
      'department',
      mockDepartments
    );
    expect(departmentCacheService.cacheStore.putValues).toHaveBeenCalledWith(
      mockDepartments.map(toRaw)
    );
  });

  it('should retrieve all department records', async () => {
    const getAllSpy = vi
      .spyOn(departmentCacheService.cacheStore, 'getAll')
      .mockResolvedValue(mockDepartments);
    const departments = await departmentCacheService.getAllRecords();
    expect(getAllSpy).toHaveBeenCalled();
    expect(departments).toEqual(mockDepartments);
  });

  it('should delete a department record', async () => {
    const deleteSpy = vi
      .spyOn(departmentCacheService.cacheStore, 'delete')
      .mockResolvedValue(undefined);
    await departmentCacheService.deleteRecord(1);
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });
});
