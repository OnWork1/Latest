// @vitest-environment node
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import client from '~/prisma/__mocks__/client';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';
import { type Department, Prisma } from '@prisma/client';
import getSkipTake from '~/utils/get-skip-take';
import getISODateTime from '~/utils/get-iso-date-time';
import DepartmentService from '../department.service';
import type DepartmentInputDto from '~/server/dtos/department/department-input.dto';
import DepartmentOutputDto from '~/server/dtos/department/department-output.dto';
import type DepartmentPaginationDto from '~/server/dtos/department/department-pagination.dto';

const user = 'testUser';
const service = new DepartmentService(user);
const pageLimit = 20;

const departments: Department[] = [
  {
    id: 1,
    departmentCode: 'DP01',
    departmentName: 'Department 1',
    createdBy: 'user',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
    isActive: true,
  },
  {
    id: 2,
    departmentCode: 'DP02',
    departmentName: 'Department 2',
    createdBy: 'user',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
    isActive: true,
  },
];

vi.mock('~/prisma/client');
mockNuxtImport('useRuntimeConfig', () => {
  return () => {
    return { defaultPageLimit: pageLimit };
  };
});

describe('create()', () => {
  const input: DepartmentInputDto = {
    departmentCode: 'DEP03',
    departmentName: 'Department 3',
  };
  const createdEntity: Department = departments[0];
  it('creates Department if departmentCode does not exist', async () => {
    //arrange
    const output = new EntitySavedResponseDto(createdEntity.id);
    client.department.create.mockResolvedValue(createdEntity);
    client.department.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.create(input);

    //assert
    expect(client.department.create).toBeCalledWith({
      data: {
        ...input,
        createdBy: user,
      },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if departmentCode exists', async () => {
    //arrange
    client.department.create.mockResolvedValue(createdEntity);
    client.department.findFirst.mockResolvedValue(departments[0]);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.department.findFirst).toBeCalledTimes(1);
    expect(client.department.create).toBeCalledTimes(0);
  });
});

describe('getById()', () => {
  const id = 1;
  it('queries and returns department', async () => {
    // arrange
    client.department.findFirstOrThrow.mockResolvedValue(departments[0]);
    const output = DepartmentOutputDto.fromEntity(departments[0]);

    // act
    const result = await service.getById(id);

    // assert
    expect(client.department.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
    });
    expect(client.department.findFirstOrThrow).toBeCalledTimes(1);
    expect(result).toStrictEqual(output);
  });

  it('throws error if department does not exist', async () => {
    // arrange
    client.department.findFirstOrThrow.mockImplementation(() => {
      throw new Error('Department does not exist');
    });

    // act and assert
    await expect(service.getById(id)).rejects.toThrowError(
      'Department does not exist'
    );
    expect(client.department.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
    });
    expect(client.department.findFirstOrThrow).toBeCalledTimes(1);
  });
});

describe('getByCode()', () => {
  const departmentCode = 'TA01';
  it('queries and returns department', async () => {
    // arrange
    client.department.findFirst.mockResolvedValue(departments[0]);
    const output = DepartmentOutputDto.fromEntity(departments[0]);

    // act
    const result = await service.getByCode(departmentCode);

    // assert
    expect(client.department.findFirst).toHaveBeenCalledWith({
      where: { departmentCode: departmentCode, isActive: true },
    });
    expect(client.department.findFirst).toBeCalledTimes(1);
    expect(result).toStrictEqual(output);
  });

  it('returns null if department does not exist', async () => {
    // arrange
    client.department.findFirst.mockResolvedValue(null);

    // act and assert
    const result = await service.getByCode(departmentCode);
    expect(client.department.findFirst).toHaveBeenCalledWith({
      where: { departmentCode: departmentCode, isActive: true },
    });
    expect(client.department.findFirst).toBeCalledTimes(1);
    expect(result).toBeNull();
  });
});

describe('getAll()', () => {
  it('queries with defaults when no parameters are passed and returns departments', async () => {
    // arrange
    client.$transaction.mockResolvedValue([departments, departments.length]);
    const { skip, take } = getSkipTake();
    const defaultWhere: Prisma.DepartmentWhereInput = {
      isActive: true,
      OR: [
        { departmentCode: { contains: undefined, mode: 'insensitive' } },
        { departmentName: { contains: undefined, mode: 'insensitive' } },
      ],
    };
    const output = {
      data: DepartmentOutputDto.fromEntityArray(departments),
      pagination: {
        totalCount: departments.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    // act
    const result = await service.getAll({});

    // assert
    expect(client.department.findMany).toHaveBeenCalledTimes(1);
    expect(client.department.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        id: 'asc',
      },
    });
    expect(client.department.count).toHaveBeenCalledWith({
      where: defaultWhere,
    });
    expect(result).toStrictEqual(output);
  });

  it('queries with input parameters and returns relevant departments', async () => {
    // arrange
    const input: DepartmentPaginationDto = {
      orderBy: 'departmentCode',
      orderDirection: 'desc',
      page: 2,
      perPage: 10,
      searchQuery: 'department 1',
    };
    client.$transaction.mockResolvedValue([departments, departments.length]);
    const { skip, take } = getSkipTake(input.perPage, input.page);
    const defaultWhere: Prisma.DepartmentWhereInput = {
      isActive: true,
      OR: [
        {
          departmentCode: { contains: input.searchQuery, mode: 'insensitive' },
        },
        {
          departmentName: { contains: input.searchQuery, mode: 'insensitive' },
        },
      ],
    };
    const output = {
      data: DepartmentOutputDto.fromEntityArray(departments),
      pagination: {
        totalCount: departments.length,
        page: input.page,
        perPage: input.perPage,
      },
    };

    // act
    const result = await service.getAll(input);

    // assert
    expect(client.department.findMany).toHaveBeenCalledTimes(1);
    expect(client.department.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        departmentCode: 'desc',
      },
    });
    expect(client.department.count).toHaveBeenCalledWith({
      where: defaultWhere,
    });
    expect(result).toStrictEqual(output);
  });
});

describe('update()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    return () => vi.useRealTimers();
  });

  const input: DepartmentInputDto = {
    departmentCode: 'DEP01',
    departmentName: 'department 1',
  };

  it('updates department if no other department has the same departmentCode', async () => {
    //arrange
    client.department.update.mockResolvedValue(departments[0]);
    client.department.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act
    await service.update(1, input);

    //assert
    expect(client.department.update).toBeCalledTimes(1);
    expect(client.department.findFirst).toBeCalledTimes(1);
    expect(client.department.findFirst).toBeCalledWith({
      where: {
        departmentCode: input.departmentCode,
        isActive: true,
        id: {
          not: 1,
        },
      },
      select: { id: true },
    });
    expect(client.department.update).toBeCalledWith({
      where: {
        id: 1,
        isActive: true,
      },
      data: {
        ...input,
        updatedBy: user,
        updatedDate: getISODateTime(),
      },
    });
    await expect(service.update(1, input)).resolves.not.toThrow();
  });

  it('throws Error if another department with the same departmentCode exists', async () => {
    //arrange
    client.department.update.mockResolvedValue(departments[0]);
    client.department.findFirst.mockResolvedValue(departments[1]);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.department.update).toBeCalledTimes(0);
    expect(client.department.findFirst).toBeCalledTimes(1);
    expect(client.department.findFirst).toBeCalledWith({
      where: {
        departmentCode: input.departmentCode,
        isActive: true,
        id: {
          not: 1,
        },
      },
      select: { id: true },
    });
  });
});

describe('delete()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    return () => vi.useRealTimers();
  });

  it('updates isActive to false', async () => {
    //arrange
    const id = 1;
    const updatedEntity: Department = { ...departments[1], isActive: false };
    client.department.update.mockResolvedValue(updatedEntity);

    //act and assert
    await expect(service.delete(id)).resolves.not.toThrow();
    expect(client.department.update).toBeCalledWith({
      where: {
        id: id,
        isActive: true,
      },
      data: {
        isActive: false,
        deletedBy: user,
        deletedDate: getISODateTime(),
      },
    });
  });

  it('throws error if department does not exist', async () => {
    //arrange
    const id = 15;
    client.department.update.mockImplementation(() => {
      throw new Error('Department does not exist');
    });

    //act and assert
    await expect(service.delete(id)).rejects.toThrowError(
      'Department does not exist'
    );
    expect(client.department.update).toBeCalledWith({
      where: {
        id: id,
        isActive: true,
      },
      data: {
        isActive: false,
        deletedBy: user,
        deletedDate: getISODateTime(),
      },
    });
  });
});
