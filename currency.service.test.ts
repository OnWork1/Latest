// @vitest-environment node
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import client from '~/prisma/__mocks__/client';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';
import { type Currency, Prisma } from '@prisma/client';
import getSkipTake from '~/utils/get-skip-take';
import getISODateTime from '~/utils/get-iso-date-time';
import CurrencyService from '../currency.service';
import type CurrencyInputDto from '~/server/dtos/currency/currency-input.dto';
import CurrencyOutputDto from '~/server/dtos/currency/currency-output.dto';
import type CurrencyPaginationDto from '~/server/dtos/currency/currency-pagination.dto';

const user = 'testUser';
const service = new CurrencyService(user);
const pageLimit = 20;

const currencies: Currency[] = [
  {
    id: 1,
    currencyCode: 'CUR01',
    currencyName: 'Currency 1',
    currencyRate: 21,
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
    currencyCode: 'CUR02',
    currencyName: 'Currency 2',
    currencyRate: 30,
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
  const input: CurrencyInputDto = {
    currencyCode: 'CU01',
    currencyName: 'LKR',
    currencyRate: 320,
  };
  const createdEntity: Currency = currencies[0];
  it('creates Currency if currencyCode does not exist', async () => {
    //arrange
    const output = new EntitySavedResponseDto(createdEntity.id);
    client.currency.create.mockResolvedValue(createdEntity);
    client.currency.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.create(input);

    //assert
    expect(client.currency.create).toBeCalledWith({
      data: {
        ...input,
        createdBy: user,
      },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if currencyCode exists', async () => {
    //arrange
    client.currency.create.mockResolvedValue(createdEntity);
    client.currency.findFirst.mockResolvedValue(currencies[0]);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.currency.findFirst).toBeCalledTimes(1);
    expect(client.currency.create).toBeCalledTimes(0);
  });
});

describe('getById()', () => {
  const id = 1;
  it('queries and returns Currency', async () => {
    // arrange
    client.currency.findFirstOrThrow.mockResolvedValue(currencies[0]);
    const output = CurrencyOutputDto.fromEntity(currencies[0]);

    // act
    const result = await service.getById(id);

    // assert
    expect(client.currency.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
    });
    expect(client.currency.findFirstOrThrow).toBeCalledTimes(1);
    expect(result).toStrictEqual(output);
  });

  it('throws error if Currency does not exist', async () => {
    // arrange
    client.currency.findFirstOrThrow.mockImplementation(() => {
      throw new Error('Currency does not exist');
    });

    // act and assert
    await expect(service.getById(id)).rejects.toThrowError(
      'Currency does not exist'
    );
    expect(client.currency.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
    });
    expect(client.currency.findFirstOrThrow).toBeCalledTimes(1);
  });
});

describe('getByCode()', () => {
  const currencyCode = 'TA01';
  it('queries and returns Currency', async () => {
    // arrange
    client.currency.findFirst.mockResolvedValue(currencies[0]);
    const output = currencies[0];

    // act
    const result = await service.getByCode(currencyCode);

    // assert
    expect(client.currency.findFirst).toHaveBeenCalledWith({
      where: {
        currencyCode: { equals: currencyCode, mode: 'insensitive' },
        isActive: true,
      },
    });
    expect(client.currency.findFirst).toBeCalledTimes(1);
    expect(result).toStrictEqual(output);
  });

  it('returns null if Currency does not exist', async () => {
    // arrange
    client.currency.findFirst.mockResolvedValue(null);

    // act and assert
    const result = await service.getByCode(currencyCode);
    expect(client.currency.findFirst).toHaveBeenCalledWith({
      where: {
        currencyCode: { equals: currencyCode, mode: 'insensitive' },
        isActive: true,
      },
    });
    expect(client.currency.findFirst).toBeCalledTimes(1);
    expect(result).toBeNull();
  });
});

describe('getAll()', () => {
  it('queries with defaults when no parameters are passed and returns Currencies', async () => {
    // arrange
    client.$transaction.mockResolvedValue([currencies, currencies.length]);
    const { skip, take } = getSkipTake();
    const defaultWhere: Prisma.CurrencyWhereInput = {
      isActive: true,
      OR: [
        { currencyCode: { contains: undefined, mode: 'insensitive' } },
        { currencyName: { contains: undefined, mode: 'insensitive' } },
      ],
    };
    const output = {
      data: CurrencyOutputDto.fromEntityArray(currencies),
      pagination: {
        totalCount: currencies.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    // act
    const result = await service.getAll({});

    // assert
    expect(client.currency.findMany).toHaveBeenCalledTimes(1);
    expect(client.currency.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        id: 'asc',
      },
    });
    expect(client.currency.count).toHaveBeenCalledWith({ where: defaultWhere });
    expect(result).toStrictEqual(output);
  });

  it('queries with input parameters and returns relevant Currencies', async () => {
    // arrange
    const input: CurrencyPaginationDto = {
      orderBy: 'currencyCode',
      orderDirection: 'desc',
      page: 2,
      perPage: 10,
      searchQuery: 'Currency 1',
    };
    client.$transaction.mockResolvedValue([currencies, currencies.length]);
    const { skip, take } = getSkipTake(input.perPage, input.page);
    const defaultWhere: Prisma.CurrencyWhereInput = {
      isActive: true,
      OR: [
        { currencyCode: { contains: input.searchQuery, mode: 'insensitive' } },
        { currencyName: { contains: input.searchQuery, mode: 'insensitive' } },
      ],
    };
    const output = {
      data: CurrencyOutputDto.fromEntityArray(currencies),
      pagination: {
        totalCount: currencies.length,
        page: input.page,
        perPage: input.perPage,
      },
    };

    // act
    const result = await service.getAll(input);

    // assert
    expect(client.currency.findMany).toHaveBeenCalledTimes(1);
    expect(client.currency.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        currencyCode: 'desc',
      },
    });
    expect(client.currency.count).toHaveBeenCalledWith({ where: defaultWhere });
    expect(result).toStrictEqual(output);
  });
});

describe('update()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    return () => vi.useRealTimers();
  });

  const input: CurrencyInputDto = {
    currencyCode: 'CU01',
    currencyName: 'LKR',
    currencyRate: 320,
  };

  it('updates Currency if no other Currency has the same currencyCode', async () => {
    //arrange
    client.currency.update.mockResolvedValue(currencies[0]);
    client.currency.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act
    await service.update(1, input);

    //assert
    expect(client.currency.update).toBeCalledTimes(1);
    expect(client.currency.findFirst).toBeCalledTimes(1);
    expect(client.currency.findFirst).toBeCalledWith({
      where: {
        currencyCode: input.currencyCode,
        isActive: true,
        id: {
          not: 1,
        },
      },
      select: { id: true },
    });
    expect(client.currency.update).toBeCalledWith({
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

  it('throws Error if another Currency with the same currencyCode exists', async () => {
    //arrange
    client.currency.update.mockResolvedValue(currencies[0]);
    client.currency.findFirst.mockResolvedValue(currencies[1]);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.currency.update).toBeCalledTimes(0);
    expect(client.currency.findFirst).toBeCalledTimes(1);
    expect(client.currency.findFirst).toBeCalledWith({
      where: {
        currencyCode: input.currencyCode,
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
    const updatedEntity: Currency = { ...currencies[1], isActive: false };
    client.currency.update.mockResolvedValue(updatedEntity);

    //act and assert
    await expect(service.delete(id)).resolves.not.toThrow();
    expect(client.currency.update).toBeCalledWith({
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

  it('throws error if Currency does not exist', async () => {
    //arrange
    const id = 15;
    client.currency.update.mockImplementation(() => {
      throw new Error('Currency does not exist');
    });

    //act and assert
    await expect(service.delete(id)).rejects.toThrowError(
      'Currency does not exist'
    );
    expect(client.currency.update).toBeCalledWith({
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
