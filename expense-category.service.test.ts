// @vitest-environment node
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import client from '~/prisma/__mocks__/client';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';
import { Prisma, type ExpenseCategory } from '@prisma/client';
import getSkipTake from '~/utils/get-skip-take';
import getISODateTime from '~/utils/get-iso-date-time';
import { ExpenseCategoryService } from '../expense-category.service';
import type ExpenseCategoryInputDto from '~/server/dtos/expense-category/expense-category-input.dto';
import ExpenseCategoryOutputDto from '~/server/dtos/expense-category/expense-category-output.dto';
import type ExpenseCategoryPaginationDto from '~/server/dtos/expense-category/expense-category-pagination.dto';

const user = 'testUser';
const service = new ExpenseCategoryService(user);
const pageLimit = 20;

const expenseCategories: ExpenseCategory[] = [
  {
    id: 1,
    expenseCode: 'EXC01',
    expenseName: 'Expense 01',
    defaultPaymentType: 'CARD',
    disablePaymentType: false,
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
    expenseCode: 'EXC02',
    expenseName: 'Expense 02',
    defaultPaymentType: 'CASH',
    disablePaymentType: false,
    createdBy: 'user',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
    isActive: true,
  },
  {
    id: 3,
    expenseCode: 'EXC03',
    expenseName: 'Expense 03',
    defaultPaymentType: 'CARD',
    disablePaymentType: true,
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
  const input: ExpenseCategoryInputDto = {
    expenseCode: 'EXP01',
    expenseName: 'Expense Name 01',
    defaultPaymentType: 'CARD',
    disablePaymentType: false,
  };
  const createdEntity: ExpenseCategory = expenseCategories[0];
  it('creates ExpenseCategory if expenseCode does not exist', async () => {
    //arrange
    const output = new EntitySavedResponseDto(createdEntity.id);
    client.expenseCategory.create.mockResolvedValue(createdEntity);
    client.expenseCategory.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.create(input);

    //assert
    expect(client.expenseCategory.create).toBeCalledWith({
      data: {
        ...input,
        createdBy: user,
      },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if expenseCode exists', async () => {
    //arrange
    client.expenseCategory.create.mockResolvedValue(createdEntity);
    client.expenseCategory.findFirst.mockResolvedValue(expenseCategories[0]);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.expenseCategory.findFirst).toBeCalledTimes(1);
    expect(client.expenseCategory.create).toBeCalledTimes(0);
  });
});

describe('getById()', () => {
  const id = 1;
  it('queries and returns ExpenseCategory', async () => {
    // arrange
    client.expenseCategory.findFirstOrThrow.mockResolvedValue(
      expenseCategories[0]
    );
    const output = ExpenseCategoryOutputDto.fromEntity(expenseCategories[0]);

    // act
    const result = await service.getById(id);

    // assert
    expect(client.expenseCategory.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
    });
    expect(client.expenseCategory.findFirstOrThrow).toBeCalledTimes(1);
    expect(result).toStrictEqual(output);
  });

  it('throws error if ExpenseCategory does not exist', async () => {
    // arrange
    client.expenseCategory.findFirstOrThrow.mockImplementation(() => {
      throw new Error('ExpenseCategory does not exist');
    });

    // act and assert
    await expect(service.getById(id)).rejects.toThrowError(
      'ExpenseCategory does not exist'
    );
    expect(client.expenseCategory.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
    });
    expect(client.expenseCategory.findFirstOrThrow).toBeCalledTimes(1);
  });
});

describe('getByCode()', () => {
  const expenseCode = 'EXPA01';
  it('queries and returns ExpenseCategory', async () => {
    // arrange
    client.expenseCategory.findFirst.mockResolvedValue(expenseCategories[0]);
    const output = expenseCategories[0];

    // act
    const result = await service.getByCode(expenseCode);

    // assert
    expect(client.expenseCategory.findFirst).toHaveBeenCalledWith({
      where: { expenseCode: expenseCode, isActive: true },
    });
    expect(client.expenseCategory.findFirst).toBeCalledTimes(1);
    expect(result).toStrictEqual(output);
  });

  it('returns null if ExpenseCategory does not exist', async () => {
    // arrange
    client.expenseCategory.findFirst.mockResolvedValue(null);

    // act and assert
    const result = await service.getByCode(expenseCode);
    expect(client.expenseCategory.findFirst).toHaveBeenCalledWith({
      where: { expenseCode: expenseCode, isActive: true },
    });
    expect(client.expenseCategory.findFirst).toBeCalledTimes(1);
    expect(result).toBeNull();
  });
});

describe('getAll()', () => {
  it('queries with defaults when no parameters are passed and returns ExpenseCategories', async () => {
    // arrange
    client.$transaction.mockResolvedValue([
      expenseCategories,
      expenseCategories.length,
    ]);
    const { skip, take } = getSkipTake();
    const defaultWhere: Prisma.ExpenseCategoryWhereInput = {
      isActive: true,
      OR: [
        { expenseCode: { contains: undefined, mode: 'insensitive' } },
        { expenseName: { contains: undefined, mode: 'insensitive' } },
      ],
    };
    const output = {
      data: ExpenseCategoryOutputDto.fromEntityArray(expenseCategories),
      pagination: {
        totalCount: expenseCategories.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    // act
    const result = await service.getAll({});

    // assert
    expect(client.expenseCategory.findMany).toHaveBeenCalledTimes(1);
    expect(client.expenseCategory.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        id: 'asc',
      },
    });
    expect(client.expenseCategory.count).toHaveBeenCalledWith({
      where: defaultWhere,
    });
    expect(result).toStrictEqual(output);
  });

  it('queries with input parameters and returns relevant ExpenseCategories', async () => {
    // arrange
    const input: ExpenseCategoryPaginationDto = {
      orderBy: 'expenseCode',
      orderDirection: 'desc',
      page: 2,
      perPage: 10,
      searchQuery: 'expenseCategory 1',
    };
    client.$transaction.mockResolvedValue([
      expenseCategories,
      expenseCategories.length,
    ]);
    const { skip, take } = getSkipTake(input.perPage, input.page);
    const defaultWhere: Prisma.ExpenseCategoryWhereInput = {
      isActive: true,
      OR: [
        {
          expenseCode: { contains: input.searchQuery, mode: 'insensitive' },
        },
        { expenseName: { contains: input.searchQuery, mode: 'insensitive' } },
      ],
    };
    const output = {
      data: ExpenseCategoryOutputDto.fromEntityArray(expenseCategories),
      pagination: {
        totalCount: expenseCategories.length,
        page: input.page,
        perPage: input.perPage,
      },
    };

    // act
    const result = await service.getAll(input);

    // assert
    expect(client.expenseCategory.findMany).toHaveBeenCalledTimes(1);
    expect(client.expenseCategory.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        expenseCode: 'desc',
      },
    });
    expect(client.expenseCategory.count).toHaveBeenCalledWith({
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

  const input: ExpenseCategoryInputDto = {
    expenseCode: 'EXP01',
    expenseName: 'Expense Name 01',
    defaultPaymentType: 'CARD',
    disablePaymentType: false,
  };

  it('updates ExpenseCategory if no other ExpenseCategory has the same expenseCode', async () => {
    //arrange
    client.expenseCategory.update.mockResolvedValue(expenseCategories[0]);
    client.expenseCategory.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act
    await service.update(1, input);

    //assert
    expect(client.expenseCategory.update).toBeCalledTimes(1);
    expect(client.expenseCategory.findFirst).toBeCalledTimes(1);
    expect(client.expenseCategory.findFirst).toBeCalledWith({
      where: {
        expenseCode: input.expenseCode,
        isActive: true,
        id: {
          not: 1,
        },
      },
      select: { id: true },
    });
    expect(client.expenseCategory.update).toBeCalledWith({
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

  it('throws Error if another ExpenseCategory with the same expenseCode exists', async () => {
    //arrange
    client.expenseCategory.update.mockResolvedValue(expenseCategories[0]);
    client.expenseCategory.findFirst.mockResolvedValue(expenseCategories[1]);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.expenseCategory.update).toBeCalledTimes(0);
    expect(client.expenseCategory.findFirst).toBeCalledTimes(1);
    expect(client.expenseCategory.findFirst).toBeCalledWith({
      where: {
        expenseCode: input.expenseCode,
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
    const updatedEntity: ExpenseCategory = {
      ...expenseCategories[1],
      isActive: false,
    };
    client.expenseCategory.update.mockResolvedValue(updatedEntity);

    //act and assert
    await expect(service.delete(id)).resolves.not.toThrow();
    expect(client.expenseCategory.update).toBeCalledWith({
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

  it('throws error if ExpenseCategory does not exist', async () => {
    //arrange
    const id = 15;
    client.expenseCategory.update.mockImplementation(() => {
      throw new Error('ExpenseCategory does not exist');
    });

    //act and assert
    await expect(service.delete(id)).rejects.toThrowError(
      'ExpenseCategory does not exist'
    );
    expect(client.expenseCategory.update).toBeCalledWith({
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
