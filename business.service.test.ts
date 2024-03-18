// @vitest-environment node
import { Prisma, type Business } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import client from '~/prisma/__mocks__/client';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';
import getISODateTime from '~/utils/get-iso-date-time';
import getSkipTake from '~/utils/get-skip-take';
import BusinessService from '../business.service';
import type BusinessInputDto from '~/server/dtos/business/business-input.dto';
import BusinessOutputDto from '~/server/dtos/business/business-output.dto';
import type BusinessPaginationDto from '~/server/dtos/business/business-pagination.dto';

const user = 'testUser';
const service = new BusinessService(user);
const pageLimit = 20;

vi.mock('~/prisma/client');
mockNuxtImport('useRuntimeConfig', () => {
  return () => {
    return { defaultPageLimit: pageLimit };
  };
});

const businesses: Business[] = [
  {
    businessCode: 'BC01',
    businessName: 'Business 1',
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
    businessCode: 'BC02',
    businessName: 'Business 2',
    createdBy: 'user',
    id: 2,
    deletedBy: null,
    isActive: true,
    updatedBy: null,
    deletedDate: null,
    updatedDate: null,
    createdDate: new Date(),
  },
];

describe('create()', () => {
  it('creates business if businessCode does not exist', async () => {
    //arrange
    const input: BusinessInputDto = { businessCode: 'business 2' };
    const createdEntity: Business = businesses[1];
    const output = new EntitySavedResponseDto(createdEntity.id);
    client.business.create.mockResolvedValue(createdEntity);
    client.business.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.create(input);

    //assert
    expect(client.business.create).toBeCalledWith({
      data: {
        ...input,
        createdBy: user,
      },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if businessCode exists', async () => {
    //arrange
    const input: BusinessInputDto = {
      businessCode: 'BC02',
      businessName: 'Business 2',
    };
    const createdEntity: Business = businesses[1];
    client.business.create.mockResolvedValue(createdEntity);
    client.business.findFirst.mockResolvedValue(businesses[0]);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.business.findFirst).toBeCalledTimes(1);
    expect(client.business.create).toBeCalledTimes(0);
  });
});

describe('getById()', () => {
  it('queries and returns business', async () => {
    // arrange
    const id = 1;
    client.business.findFirstOrThrow.mockResolvedValue(businesses[0]);
    const output = BusinessOutputDto.fromEntity(businesses[0]);

    // act
    const result = await service.getById(id);

    // assert
    expect(client.business.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if business does not exist', async () => {
    // arrange
    const id = 1;
    client.business.findFirstOrThrow.mockImplementation(() => {
      throw new Error('Business does not exist');
    });

    // act and assert
    await expect(service.getById(id)).rejects.toThrowError(
      'Business does not exist'
    );
  });
});

describe('getAll()', () => {
  it('queries with defaults when no parameters are passed and returns Businesses', async () => {
    // arrange
    client.$transaction.mockResolvedValue([businesses, businesses.length]);
    const { skip, take } = getSkipTake();
    const defaultWhere: Prisma.BusinessWhereInput = {
      isActive: true,
      OR: [
        { businessCode: { contains: undefined, mode: 'insensitive' } },
        { businessName: { contains: undefined, mode: 'insensitive' } },
      ],
    };
    const output = {
      data: BusinessOutputDto.fromEntityArray(businesses),
      pagination: {
        totalCount: businesses.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    // act
    const result = await service.getAll({});

    // assert
    expect(client.business.findMany).toHaveBeenCalledTimes(1);
    expect(client.business.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        id: 'asc',
      },
    });
    expect(client.business.count).toHaveBeenCalledWith({ where: defaultWhere });
    expect(result).toStrictEqual(output);
  });

  it('queries with input parameters and returns Businesses', async () => {
    // arrange
    const input: BusinessPaginationDto = {
      orderBy: 'businessCode',
      orderDirection: 'desc',
      page: 2,
      perPage: 10,
      searchQuery: 'business 1',
    };
    const { skip, take } = getSkipTake(input.perPage, input.page);
    client.$transaction.mockResolvedValue([businesses, businesses.length]);

    const defaultWhere: Prisma.BusinessWhereInput = {
      isActive: true,
      OR: [
        { businessCode: { contains: input.searchQuery, mode: 'insensitive' } },
        { businessName: { contains: input.searchQuery, mode: 'insensitive' } },
      ],
    };
    const output = {
      data: BusinessOutputDto.fromEntityArray(businesses),
      pagination: {
        totalCount: businesses.length,
        page: input.page,
        perPage: input.perPage,
      },
    };

    // act
    const result = await service.getAll(input);

    // assert
    expect(client.business.findMany).toHaveBeenCalledTimes(1);
    expect(client.business.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        businessCode: input.orderDirection,
      },
    });
    expect(client.business.count).toHaveBeenCalledWith({ where: defaultWhere });
    expect(result).toStrictEqual(output);
  });
});

describe('update()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    return () => vi.useRealTimers();
  });

  it('updates business if no other business has the same businessCode', async () => {
    //arrange
    const input: BusinessInputDto = { businessCode: 'business 1' };
    client.business.update.mockResolvedValue(businesses[0]);
    client.business.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act
    await service.update(1, input);

    //assert
    expect(client.business.update).toBeCalledTimes(1);
    expect(client.business.findFirst).toBeCalledTimes(1);
    expect(client.business.findFirst).toBeCalledWith({
      where: {
        businessCode: input.businessCode,
        isActive: true,
        id: {
          not: 1,
        },
      },
      select: { id: true },
    });
    expect(client.business.update).toBeCalledWith({
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

  it('throws Error if another business with the same businessCode exists', async () => {
    //arrange
    const input: BusinessInputDto = { businessCode: 'business 1' };
    client.business.update.mockResolvedValue(businesses[0]);
    client.business.findFirst.mockResolvedValue(businesses[1]);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.business.update).toBeCalledTimes(0);
    expect(client.business.findFirst).toBeCalledTimes(1);
    expect(client.business.findFirst).toBeCalledWith({
      where: {
        businessCode: input.businessCode,
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
    const updatedEntity: Business = { ...businesses[1], isActive: false };
    client.business.update.mockResolvedValue(updatedEntity);

    //act and assert
    await expect(service.delete(id)).resolves.not.toThrow();
    expect(client.business.update).toBeCalledWith({
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

  it('throws error if business does not exist', async () => {
    //arrange
    const id = 15;
    client.business.update.mockImplementation(() => {
      throw new Error('Business does not exist');
    });

    //act and assert
    await expect(service.delete(id)).rejects.toThrowError(
      'Business does not exist'
    );
    expect(client.business.update).toBeCalledWith({
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
