// @vitest-environment node
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TaxService from '../tax.service';
import client from '~/prisma/__mocks__/client';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';
import type TaxInputDto from '~/server/dtos/tax/tax-input.dto';
import { Prisma, type Tax } from '@prisma/client';
import TaxOutputDto from '~/server/dtos/tax/tax-output.dto';
import getSkipTake from '~/utils/get-skip-take';
import type TaxPaginationDto from '~/server/dtos/tax/tax-pagination.dto';
import getISODateTime from '~/utils/get-iso-date-time';

const user = 'testUser';
const service = new TaxService(user);
const pageLimit = 20;

const taxes: Tax[] = [
  {
    id: 1,
    taxCode: 'TA01',
    taxRate: new Prisma.Decimal(10),
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
    taxCode: 'TA02',
    taxRate: new Prisma.Decimal(110),
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
  const input: TaxInputDto = { taxCode: 'TA01', taxRate: 32 };
  const createdEntity: Tax = taxes[0];
  it('creates Tax if taxCode does not exist', async () => {
    //arrange
    const output = new EntitySavedResponseDto(createdEntity.id);
    client.tax.create.mockResolvedValue(createdEntity);
    client.tax.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.create(input);

    //assert
    expect(client.tax.create).toBeCalledWith({
      data: {
        ...input,
        createdBy: user,
      },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if taxCode exists', async () => {
    //arrange
    client.tax.create.mockResolvedValue(createdEntity);
    client.tax.findFirst.mockResolvedValue(taxes[0]);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.tax.findFirst).toBeCalledTimes(1);
    expect(client.tax.create).toBeCalledTimes(0);
  });
});

describe('getById()', () => {
  const id = 1;
  it('queries and returns tax', async () => {
    // arrange
    client.tax.findFirstOrThrow.mockResolvedValue(taxes[0]);
    const output = TaxOutputDto.fromEntity(taxes[0]);

    // act
    const result = await service.getById(id);

    // assert
    expect(client.tax.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
    });
    expect(client.tax.findFirstOrThrow).toBeCalledTimes(1);
    expect(result).toStrictEqual(output);
  });

  it('throws error if tax does not exist', async () => {
    // arrange
    client.tax.findFirstOrThrow.mockImplementation(() => {
      throw new Error('Tax does not exist');
    });

    // act and assert
    await expect(service.getById(id)).rejects.toThrowError(
      'Tax does not exist'
    );
    expect(client.tax.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
    });
    expect(client.tax.findFirstOrThrow).toBeCalledTimes(1);
  });
});

describe('getByCode()', () => {
  const taxCode = 'TA01';
  it('queries and returns tax', async () => {
    // arrange
    client.tax.findFirst.mockResolvedValue(taxes[0]);
    const output = TaxOutputDto.fromEntity(taxes[0]);

    // act
    const result = await service.getByCode(taxCode);

    // assert
    expect(client.tax.findFirst).toHaveBeenCalledWith({
      where: { taxCode: taxCode, isActive: true },
    });
    expect(client.tax.findFirst).toBeCalledTimes(1);
    expect(result).toStrictEqual(output);
  });

  it('returns null if tax does not exist', async () => {
    // arrange
    client.tax.findFirst.mockResolvedValue(null);

    // act and assert
    const result = await service.getByCode(taxCode);
    expect(client.tax.findFirst).toHaveBeenCalledWith({
      where: { taxCode: taxCode, isActive: true },
    });
    expect(client.tax.findFirst).toBeCalledTimes(1);
    expect(result).toBeNull();
  });
});

describe('getAll()', () => {
  it('queries with defaults when no parameters are passed and returns taxes', async () => {
    // arrange
    client.$transaction.mockResolvedValue([taxes, taxes.length]);
    const { skip, take } = getSkipTake();
    const defaultWhere: Prisma.TaxWhereInput = {
      isActive: true,
      taxCode: { contains: undefined, mode: 'insensitive' },
    };
    const output = {
      data: TaxOutputDto.fromEntityArray(taxes),
      pagination: {
        totalCount: taxes.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    // act
    const result = await service.getAll({});

    // assert
    expect(client.tax.findMany).toHaveBeenCalledTimes(1);
    expect(client.tax.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        id: 'asc',
      },
    });
    expect(client.tax.count).toHaveBeenCalledWith({ where: defaultWhere });
    expect(result).toStrictEqual(output);
  });

  it('queries with input parameters and returns relevant taxes', async () => {
    // arrange
    const input: TaxPaginationDto = {
      orderBy: 'taxCode',
      orderDirection: 'desc',
      page: 2,
      perPage: 10,
      searchQuery: 'tax 1',
    };
    client.$transaction.mockResolvedValue([taxes, taxes.length]);
    const { skip, take } = getSkipTake(input.perPage, input.page);
    const defaultWhere: Prisma.TaxWhereInput = {
      isActive: true,
      taxCode: { contains: input.searchQuery, mode: 'insensitive' },
    };
    const output = {
      data: TaxOutputDto.fromEntityArray(taxes),
      pagination: {
        totalCount: taxes.length,
        page: input.page,
        perPage: input.perPage,
      },
    };

    // act
    const result = await service.getAll(input);

    // assert
    expect(client.tax.findMany).toHaveBeenCalledTimes(1);
    expect(client.tax.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        taxCode: 'desc',
      },
    });
    expect(client.tax.count).toHaveBeenCalledWith({ where: defaultWhere });
    expect(result).toStrictEqual(output);
  });
});

describe('update()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    return () => vi.useRealTimers();
  });

  const input: TaxInputDto = { taxCode: 'TA01', taxRate: 100 };

  it('updates tax if no other tax has the same taxCode', async () => {
    //arrange
    client.tax.update.mockResolvedValue(taxes[0]);
    client.tax.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act
    await service.update(1, input);

    //assert
    expect(client.tax.update).toBeCalledTimes(1);
    expect(client.tax.findFirst).toBeCalledTimes(1);
    expect(client.tax.findFirst).toBeCalledWith({
      where: {
        taxCode: input.taxCode,
        isActive: true,
        id: {
          not: 1,
        },
      },
      select: { id: true },
    });
    expect(client.tax.update).toBeCalledWith({
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

  it('throws Error if another tax with the same taxCode exists', async () => {
    //arrange
    client.tax.update.mockResolvedValue(taxes[0]);
    client.tax.findFirst.mockResolvedValue(taxes[1]);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.tax.update).toBeCalledTimes(0);
    expect(client.tax.findFirst).toBeCalledTimes(1);
    expect(client.tax.findFirst).toBeCalledWith({
      where: {
        taxCode: input.taxCode,
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
    const updatedEntity: Tax = { ...taxes[1], isActive: false };
    client.tax.update.mockResolvedValue(updatedEntity);

    //act and assert
    await expect(service.delete(id)).resolves.not.toThrow();
    expect(client.tax.update).toBeCalledWith({
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

  it('throws error if tax does not exist', async () => {
    //arrange
    const id = 15;
    client.tax.update.mockImplementation(() => {
      throw new Error('Tax does not exist');
    });

    //act and assert
    await expect(service.delete(id)).rejects.toThrowError('Tax does not exist');
    expect(client.tax.update).toBeCalledWith({
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
