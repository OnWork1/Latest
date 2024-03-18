// @vitest-environment node
import { Prisma, type SalesTaxGroup } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import client from '~/prisma/__mocks__/client';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';
import getISODateTime from '~/utils/get-iso-date-time';
import getSkipTake from '~/utils/get-skip-take';
import SalesTaxGroupService from '../sales-tax-group.service';
import type SalesTaxGroupInputDto from '~/server/dtos/sales-tax-group/sales-tax-group-input.dto';
import SalesTaxGroupOutputDto from '~/server/dtos/sales-tax-group/sales-tax-group-output.dto';
import type SalesTaxGroupPaginationDto from '~/server/dtos/sales-tax-group/sales-tax-group-pagination.dto';

const user = 'testUser';
const service = new SalesTaxGroupService(user);
const pageLimit = 20;

vi.mock('~/prisma/client');
mockNuxtImport('useRuntimeConfig', () => {
  return () => {
    return { defaultPageLimit: pageLimit };
  };
});

const salesTaxGroups: SalesTaxGroup[] = [
  {
    id: 1,
    salesTaxGroupCode: 'SA001',
    createdBy: 'user',
    deletedBy: null,
    isActive: true,
    updatedBy: null,
    deletedDate: null,
    updatedDate: null,
    createdDate: new Date(),
  },
  {
    id: 2,
    salesTaxGroupCode: 'SA002',
    createdBy: 'user',
    deletedBy: null,
    isActive: true,
    updatedBy: null,
    deletedDate: null,
    updatedDate: null,
    createdDate: new Date(),
  },
];

describe('create()', () => {
  it('creates SalesTaxGroup if salesTaxGroupCode does not exist', async () => {
    //arrange
    const input: SalesTaxGroupInputDto = {
      salesTaxGroupCode: 'SalesTaxGroup 2',
    };
    const createdEntity: SalesTaxGroup = salesTaxGroups[1];
    const output = new EntitySavedResponseDto(createdEntity.id);
    client.salesTaxGroup.create.mockResolvedValue(createdEntity);
    client.salesTaxGroup.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.create(input);

    //assert
    expect(client.salesTaxGroup.create).toBeCalledWith({
      data: {
        ...input,
        isActive: true,
        createdBy: user,
      },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if salesTaxGroupCode exists', async () => {
    //arrange
    const input: SalesTaxGroupInputDto = {
      salesTaxGroupCode: 'SA01',
    };
    const createdEntity: SalesTaxGroup = salesTaxGroups[1];
    client.salesTaxGroup.create.mockResolvedValue(createdEntity);
    client.salesTaxGroup.findFirst.mockResolvedValue(salesTaxGroups[0]);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.salesTaxGroup.findFirst).toBeCalledTimes(1);
    expect(client.salesTaxGroup.create).toBeCalledTimes(0);
  });
});

describe('getById()', () => {
  it('queries and returns SalesTaxGroup', async () => {
    // arrange
    const id = 1;
    client.salesTaxGroup.findFirstOrThrow.mockResolvedValue(salesTaxGroups[0]);
    const output = SalesTaxGroupOutputDto.fromEntity(salesTaxGroups[0]);

    // act
    const result = await service.getById(id);

    // assert
    expect(client.salesTaxGroup.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if SalesTaxGroup does not exist', async () => {
    // arrange
    const id = 1;
    client.salesTaxGroup.findFirstOrThrow.mockImplementation(() => {
      throw new Error('SalesTaxGroup does not exist');
    });

    // act and assert
    await expect(service.getById(id)).rejects.toThrowError(
      'SalesTaxGroup does not exist'
    );
  });
});

describe('getAll()', () => {
  it('queries with defaults when no parameters are passed and returns SalesTaxGroups', async () => {
    // arrange
    client.$transaction.mockResolvedValue([
      salesTaxGroups,
      salesTaxGroups.length,
    ]);
    const { skip, take } = getSkipTake();
    const defaultWhere: Prisma.SalesTaxGroupWhereInput = {
      isActive: true,
      OR: [{ salesTaxGroupCode: { contains: undefined, mode: 'insensitive' } }],
    };
    const output = {
      data: SalesTaxGroupOutputDto.fromEntityArray(salesTaxGroups),
      pagination: {
        totalCount: salesTaxGroups.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    // act
    const result = await service.getAll({});

    // assert
    expect(client.salesTaxGroup.findMany).toHaveBeenCalledTimes(1);
    expect(client.salesTaxGroup.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        id: 'asc',
      },
    });
    expect(client.salesTaxGroup.count).toHaveBeenCalledWith({
      where: defaultWhere,
    });
    expect(result).toStrictEqual(output);
  });

  it('queries with input parameters and returns SalesTaxGroups', async () => {
    // arrange
    const input: SalesTaxGroupPaginationDto = {
      orderBy: 'salesTaxGroupCode',
      orderDirection: 'desc',
      page: 2,
      perPage: 10,
      searchQuery: 'SalesTaxGroup 1',
    };
    const { skip, take } = getSkipTake(input.perPage, input.page);
    client.$transaction.mockResolvedValue([
      salesTaxGroups,
      salesTaxGroups.length,
    ]);

    const defaultWhere: Prisma.SalesTaxGroupWhereInput = {
      isActive: true,
      OR: [
        {
          salesTaxGroupCode: {
            contains: input.searchQuery,
            mode: 'insensitive',
          },
        },
      ],
    };
    const output = {
      data: SalesTaxGroupOutputDto.fromEntityArray(salesTaxGroups),
      pagination: {
        totalCount: salesTaxGroups.length,
        page: input.page,
        perPage: input.perPage,
      },
    };

    // act
    const result = await service.getAll(input);

    // assert
    expect(client.salesTaxGroup.findMany).toHaveBeenCalledTimes(1);
    expect(client.salesTaxGroup.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        salesTaxGroupCode: input.orderDirection,
      },
    });
    expect(client.salesTaxGroup.count).toHaveBeenCalledWith({
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

  it('updates SalesTaxGroup if no other SalesTaxGroup has the same salesTaxGroupCode', async () => {
    //arrange
    const input: SalesTaxGroupInputDto = {
      salesTaxGroupCode: 'SalesTaxGroup 1',
    };
    client.salesTaxGroup.update.mockResolvedValue(salesTaxGroups[0]);
    client.salesTaxGroup.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act
    await service.update(1, input);

    //assert
    expect(client.salesTaxGroup.update).toBeCalledTimes(1);
    expect(client.salesTaxGroup.findFirst).toBeCalledTimes(1);
    expect(client.salesTaxGroup.findFirst).toBeCalledWith({
      where: {
        salesTaxGroupCode: input.salesTaxGroupCode,
        isActive: true,
        id: {
          not: 1,
        },
      },
      select: { id: true },
    });
    expect(client.salesTaxGroup.update).toBeCalledWith({
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

  it('throws Error if another SalesTaxGroup with the same salesTaxGroupCode exists', async () => {
    //arrange
    const input: SalesTaxGroupInputDto = {
      salesTaxGroupCode: 'SalesTaxGroup 1',
    };
    client.salesTaxGroup.update.mockResolvedValue(salesTaxGroups[0]);
    client.salesTaxGroup.findFirst.mockResolvedValue(salesTaxGroups[1]);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.salesTaxGroup.update).toBeCalledTimes(0);
    expect(client.salesTaxGroup.findFirst).toBeCalledTimes(1);
    expect(client.salesTaxGroup.findFirst).toBeCalledWith({
      where: {
        salesTaxGroupCode: input.salesTaxGroupCode,
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
    const updatedEntity: SalesTaxGroup = {
      ...salesTaxGroups[1],
      isActive: false,
    };
    client.salesTaxGroup.update.mockResolvedValue(updatedEntity);

    //act and assert
    await expect(service.delete(id)).resolves.not.toThrow();
    expect(client.salesTaxGroup.update).toBeCalledWith({
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

  it('throws error if SalesTaxGroup does not exist', async () => {
    //arrange
    const id = 15;
    client.salesTaxGroup.update.mockImplementation(() => {
      throw new Error('SalesTaxGroup does not exist');
    });

    //act and assert
    await expect(service.delete(id)).rejects.toThrowError(
      'SalesTaxGroup does not exist'
    );
    expect(client.salesTaxGroup.update).toBeCalledWith({
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
