// @vitest-environment node
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import client from '~/prisma/__mocks__/client';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';

import { Prisma, type User, type Company } from '@prisma/client';

import getSkipTake from '~/utils/get-skip-take';

import getISODateTime from '~/utils/get-iso-date-time';
import UserService from '../user.service';
import type UserInputDto from '~/server/dtos/user/user-input.dto';
import UserOutputDto from '~/server/dtos/user/user-output.dto';
import type UserPaginationDto from '~/server/dtos/user/user-pagination.dto';
import { type UserOrderBy } from '~/server/dtos/user/user-order-by.dto';

const user = 'testUser';
const service = new UserService(user);
const pageLimit = 20;

const company: Company = {
  id: 1,
  companyCode: 'company01',
  companyName: '',
  isActive: false,
  createdBy: '',
  createdDate: new Date(),
  updatedBy: null,
  updatedDate: null,
  deletedBy: null,
  deletedDate: null,
  baseCurrencyId: 0,
};

const users: User[] = [
  {
    id: 1,
    userAccount: 'User01',
    cardCode: 'cardCode01',
    cashCode: 'cashCode01',
    companyId: 1,
    isActive: true,
    createdBy: 'user',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
  },
  {
    id: 2,
    userAccount: 'User02',
    cardCode: 'cardCode02',
    cashCode: 'cashCode02',
    companyId: 1,
    isActive: true,
    createdBy: 'user',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
  },
];

const usersWithCompany = [
  { ...users[0], Company: company },
  { ...users[1], Company: company },
];

vi.mock('~/prisma/client');
mockNuxtImport('useRuntimeConfig', () => {
  return () => {
    return { defaultPageLimit: pageLimit };
  };
});

describe('create()', () => {
  const input: UserInputDto = {
    userAccount: 'User01',
    cardCode: 'cardCode01',
    cashCode: 'cashCode01',
    companyId: 1,
    isActive: true,
  };
  const createdEntity: User = users[0];
  it('creates user if userAccount does not exist', async () => {
    //arrange
    const output = new EntitySavedResponseDto(createdEntity.id);
    client.user.create.mockResolvedValue(createdEntity);
    client.user.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.create(input);

    //assert
    expect(client.user.create).toBeCalledWith({
      data: {
        ...input,
        createdBy: user,
      },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if userAccount exists', async () => {
    //arrange
    client.user.create.mockResolvedValue(createdEntity);
    client.user.findFirst.mockResolvedValue(users[0]);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.user.findFirst).toBeCalledTimes(1);
    expect(client.user.create).toBeCalledTimes(0);
  });
});

describe('getById()', () => {
  const id = 1;
  it('queries and returns user', async () => {
    // arrange

    client.user.findFirstOrThrow.mockResolvedValue(usersWithCompany[0]);
    const output = UserOutputDto.fromEntity(
      usersWithCompany[0],
      usersWithCompany[0].Company
    );

    // act
    const result = await service.getById(id);

    // assert
    expect(client.user.findFirstOrThrow).toBeCalledTimes(1);
    expect(client.user.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
      include: { Company: true },
    });

    expect(result).toStrictEqual(output);
  });

  it('throws error if user does not exist', async () => {
    // arrange
    client.user.findFirstOrThrow.mockImplementation(() => {
      throw new Error('User does not exist');
    });

    // act and assert
    await expect(service.getById(id)).rejects.toThrowError(
      'User does not exist'
    );
    expect(client.user.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
      include: { Company: true },
    });
    expect(client.user.findFirstOrThrow).toBeCalledTimes(1);
  });
});

describe('getByCode()', () => {
  const cardCode = 'cardCode01';
  it('queries and returns user', async () => {
    // arrange
    client.user.findFirst.mockResolvedValue(usersWithCompany[0]);
    const output = UserOutputDto.fromEntity(
      usersWithCompany[0],
      usersWithCompany[0].Company
    );

    // act
    const result = await service.getByCode(cardCode);

    // assert
    expect(client.user.findFirst).toBeCalledTimes(1);
    expect(client.user.findFirst).toHaveBeenCalledWith({
      where: {
        cardCode: { equals: cardCode, mode: 'insensitive' },
        isActive: true,
      },
      include: { Company: true },
    });

    expect(result).toStrictEqual(output);
  });

  it('returns null if user does not exist', async () => {
    // arrange
    client.user.findFirst.mockResolvedValue(null);

    // act and assert
    const result = await service.getByCode(cardCode);
    expect(client.user.findFirst).toHaveBeenCalledWith({
      where: {
        cardCode: { equals: cardCode, mode: 'insensitive' },
        isActive: true,
      },
      include: { Company: true },
    });
    expect(client.user.findFirst).toBeCalledTimes(1);
    expect(result).toBeNull();
  });
});

describe('getAll()', () => {
  it('queries with defaults when no parameters are passed and returns users', async () => {
    // arrange
    client.$transaction.mockResolvedValue([
      usersWithCompany,
      usersWithCompany.length,
    ]);
    const { skip, take } = getSkipTake();

    const defaultWhere: Prisma.UserFindManyArgs = {
      where: {
        isActive: true,
        OR: [
          { userAccount: { contains: undefined, mode: 'insensitive' } },
          { cardCode: { contains: undefined, mode: 'insensitive' } },
          { cashCode: { contains: undefined, mode: 'insensitive' } },
        ],
      },
    };

    const output = {
      data: arrayToOutput(usersWithCompany),
      pagination: {
        totalCount: usersWithCompany.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    const orderByValue: UserOrderBy = 'id';
    const direction: Prisma.SortOrder = 'asc';

    // act
    const result = await service.getAll({});

    // assert
    expect(client.user.findMany).toHaveBeenCalledTimes(1);
    expect(client.user.findMany).toHaveBeenCalledWith({
      where: defaultWhere.where,
      skip: skip,
      take: take,
      orderBy: {
        [orderByValue]: direction,
      },
      include: { Company: true },
    });
    expect(client.user.count).toHaveBeenCalledWith({
      where: defaultWhere.where,
    });
    expect(result).toStrictEqual(output);
  });

  it('queries with input parameters and returns relevant users', async () => {
    // arrange
    const input: UserPaginationDto = {
      orderBy: 'id',
      orderDirection: 'asc',
      page: 2,
      perPage: 10,
      searchQuery: 'User01',
    };
    client.$transaction.mockResolvedValue([
      usersWithCompany,
      usersWithCompany.length,
    ]);
    const { skip, take } = getSkipTake(input.perPage, input.page);
    const defaultWhere: Prisma.UserWhereInput = {
      isActive: true,
      OR: [
        { userAccount: { contains: input.searchQuery, mode: 'insensitive' } },
        { cardCode: { contains: input.searchQuery, mode: 'insensitive' } },
        { cashCode: { contains: input.searchQuery, mode: 'insensitive' } },
      ],
    };

    const output = {
      data: arrayToOutput(usersWithCompany),
      pagination: {
        totalCount: users.length,
        page: input.page,
        perPage: input.perPage,
      },
    };

    const orderByValue: UserOrderBy = 'id';
    const direction: Prisma.SortOrder = 'asc';

    // act
    const result = await service.getAll(input);

    // assert
    expect(client.user.findMany).toHaveBeenCalledTimes(1);
    expect(client.user.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      skip: skip,
      take: take,
      orderBy: {
        [orderByValue]: direction,
      },
      include: { Company: true },
    });
    expect(client.user.count).toHaveBeenCalledWith({ where: defaultWhere });
    expect(result).toStrictEqual(output);
  });
});

describe('update()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    return () => vi.useRealTimers();
  });

  const input: UserInputDto = {
    userAccount: 'User01_updated',
    cashCode: 'cashCode01',
    cardCode: 'cardCode01',
    companyId: 1,
  };

  it('updates tax if no other tax has the same taxCode', async () => {
    //arrange
    client.user.update.mockResolvedValue(users[0]);
    client.user.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act
    await service.update(1, input);

    //assert
    expect(client.user.update).toBeCalledTimes(1);
    expect(client.user.findFirst).toBeCalledTimes(1);
    expect(client.user.findFirst).toBeCalledWith({
      where: {
        userAccount: input.userAccount,
        isActive: true,
        id: {
          not: 1,
        },
      },
      select: { id: true },
    });
    expect(client.user.update).toBeCalledWith({
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

  it('throws Error if another user with the same userAccount exists', async () => {
    //arrange
    client.user.update.mockResolvedValue(users[0]);
    client.user.findFirst.mockResolvedValue(users[1]);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.user.update).toBeCalledTimes(0);
    expect(client.user.findFirst).toBeCalledTimes(1);
    expect(client.user.findFirst).toBeCalledWith({
      where: {
        userAccount: input.userAccount,
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
    const updatedEntity: User = { ...users[1], isActive: false };
    client.user.update.mockResolvedValue(updatedEntity);

    //act and assert
    await expect(service.delete(id)).resolves.not.toThrow();
    expect(client.user.update).toBeCalledWith({
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

  it('throws error if user does not exist', async () => {
    //arrange
    const id = 15;
    client.user.update.mockImplementation(() => {
      throw new Error('User does not exist');
    });

    //act and assert
    await expect(service.delete(id)).rejects.toThrowError(
      'User does not exist'
    );
    expect(client.user.update).toBeCalledWith({
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

function arrayToOutput(usersWithCompany: any[]) {
  const userOutputList: UserOutputDto[] = [];
  usersWithCompany.forEach((user) => {
    userOutputList.push(UserOutputDto.fromEntity(user, user.Company));
  });
  return userOutputList;
}
