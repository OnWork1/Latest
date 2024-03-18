// @vitest-environment node
import { Prisma, type Brand } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BrandService from '../../services/brand.service';
import client from '~/prisma/__mocks__/client';
import BrandOutputDto from '../../dtos/brand/brand-output.dto';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type BrandPaginationDto from '~/server/dtos/brand/brand-pagination.dto';
import type BrandInputDto from '~/server/dtos/brand/brand-input.dto';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';
import getISODateTime from '~/utils/get-iso-date-time';
import getSkipTake from '~/utils/get-skip-take';

const user = 'testUser';
const service = new BrandService(user);
const pageLimit = 20;

vi.mock('~/prisma/client');
mockNuxtImport('useRuntimeConfig', () => {
  return () => {
    return { defaultPageLimit: pageLimit };
  };
});

const brands: Brand[] = [
  {
    brandName: 'brand 1',
    createdBy: 'user',
    id: 1,
    deletedBy: null,
    isActive: true,
    updatedBy: null,
    deletedDate: null,
    updatedDate: null,
    createdDate: new Date(),
  },
  {
    brandName: 'brand 2',
    createdBy: 'user',
    id: 2,
    deletedBy: null,
    isActive: true,
    updatedBy: null,
    deletedDate: null,
    updatedDate: null,
    createdDate: new Date(),
  },
  {
    brandName: 'brand 3',
    createdBy: 'user',
    id: 3,
    deletedBy: null,
    isActive: true,
    updatedBy: 'user',
    deletedDate: null,
    updatedDate: new Date(),
    createdDate: new Date(),
  },
];

describe('create()', () => {
  it('creates brand if brandName does not exist', async () => {
    //arrange
    const input: BrandInputDto = { brandName: 'brand 2' };
    const createdBrand: Brand = brands[1];
    const output = new EntitySavedResponseDto(createdBrand.id);
    client.brand.create.mockResolvedValue(createdBrand);
    client.brand.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.create(input);

    //assert
    expect(client.brand.create).toBeCalledWith({
      data: {
        ...input,
        createdBy: user,
      },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if brandName exists', async () => {
    //arrange
    const input: BrandInputDto = { brandName: 'brand 2' };
    const createdBrand: Brand = brands[1];
    client.brand.create.mockResolvedValue(createdBrand);
    client.brand.findFirst.mockResolvedValue(brands[0]);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.brand.findFirst).toBeCalledTimes(1);
    expect(client.brand.create).toBeCalledTimes(0);
  });
});

describe('getById()', () => {
  it('queries and returns brand', async () => {
    // arrange
    const id = 1;
    client.brand.findFirstOrThrow.mockResolvedValue(brands[0]);
    const output = BrandOutputDto.fromEntity(brands[0]);

    // act
    const result = await service.getById(id);

    // assert
    expect(client.brand.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if brand does not exist', async () => {
    // arrange
    const id = 1;
    client.brand.findFirstOrThrow.mockImplementation(() => {
      throw new Error('Brand does not exist');
    });

    // act and assert
    await expect(service.getById(id)).rejects.toThrowError(
      'Brand does not exist'
    );
  });
});

describe('getAll()', () => {
  it('queries with defaults when no parameters are passed and returns brands', async () => {
    // arrange
    client.$transaction.mockResolvedValue([brands, brands.length]);
    const { skip, take } = getSkipTake();
    const defaultWhere: Prisma.BrandWhereInput = {
      isActive: true,
      OR: [{ brandName: { contains: undefined, mode: 'insensitive' } }],
    };
    const output = {
      data: BrandOutputDto.fromEntityArray(brands),
      pagination: {
        totalCount: brands.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    // act
    const result = await service.getAll({});

    // assert
    expect(client.brand.findMany).toHaveBeenCalledTimes(1);
    expect(client.brand.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        id: 'asc',
      },
    });
    expect(client.brand.count).toHaveBeenCalledWith({ where: defaultWhere });
    expect(result).toStrictEqual(output);
  });

  it('queries with input parameters and returns brands', async () => {
    // arrange
    const input: BrandPaginationDto = {
      orderBy: 'brandName',
      orderDirection: 'desc',
      page: 2,
      perPage: 10,
      searchQuery: 'brand 1',
    };
    const { skip, take } = getSkipTake(input.perPage, input.page);
    client.$transaction.mockResolvedValue([brands, brands.length]);

    const defaultWhere: Prisma.BrandWhereInput = {
      isActive: true,
      OR: [{ brandName: { contains: input.searchQuery, mode: 'insensitive' } }],
    };
    const output = {
      data: BrandOutputDto.fromEntityArray(brands),
      pagination: {
        totalCount: brands.length,
        page: input.page,
        perPage: input.perPage,
      },
    };

    // act
    const result = await service.getAll(input);

    // assert
    expect(client.brand.findMany).toHaveBeenCalledTimes(1);
    expect(client.brand.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        brandName: input.orderDirection,
      },
    });
    expect(client.brand.count).toHaveBeenCalledWith({ where: defaultWhere });
    expect(result).toStrictEqual(output);
  });
});

describe('update()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    return () => vi.useRealTimers();
  });

  it('updates brand if no other brand has the same brandName', async () => {
    //arrange
    const input: BrandInputDto = { brandName: 'brand 1' };
    client.brand.update.mockResolvedValue(brands[0]);
    client.brand.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act
    await service.update(1, input);

    //assert
    expect(client.brand.update).toBeCalledTimes(1);
    expect(client.brand.findFirst).toBeCalledTimes(1);
    expect(client.brand.findFirst).toBeCalledWith({
      where: {
        brandName: input.brandName,
        isActive: true,
        id: {
          not: 1,
        },
      },
      select: { id: true },
    });
    expect(client.brand.update).toBeCalledWith({
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

  it('throws Error if another brand with the same brandName exists', async () => {
    //arrange
    const input: BrandInputDto = { brandName: 'brand 1' };
    client.brand.update.mockResolvedValue(brands[0]);
    client.brand.findFirst.mockResolvedValue(brands[1]);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.brand.update).toBeCalledTimes(0);
    expect(client.brand.findFirst).toBeCalledTimes(1);
    expect(client.brand.findFirst).toBeCalledWith({
      where: {
        brandName: input.brandName,
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
    const updatedBrand: Brand = { ...brands[1], isActive: false };
    client.brand.update.mockResolvedValue(updatedBrand);

    //act and assert
    await expect(service.delete(id)).resolves.not.toThrow();
    expect(client.brand.update).toBeCalledWith({
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

  it('throws error if brand does not exist', async () => {
    //arrange
    const id = 15;
    client.brand.update.mockImplementation(() => {
      throw new Error('Brand does not exist');
    });

    //act and assert
    await expect(service.delete(id)).rejects.toThrowError(
      'Brand does not exist'
    );
    expect(client.brand.update).toBeCalledWith({
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
