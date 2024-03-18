// @vitest-environment node
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import client from '~/prisma/__mocks__/client';
import {
  Prisma,
  type Account,
  type Product,
  type User,
  type Currency,
  AccountStatus,
  type Budget,
  type Cost,
  type Expense,
} from '@prisma/client';

import getISODateTime from '~/utils/get-iso-date-time';
import AccountService from '../account.service';
import AccountOutputDto from '~/server/dtos/account/account-output.dto';
import type AccountInputDto from '~/server/dtos/account/account-input.dto';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';

const user = 'testUser';
const roles: string[] = [
  'Admin',
  'FinanceManager',
  'OperationsManager',
  'Leader',
];
const service = new AccountService(user, roles);
const pageLimit = 20;

const accounts: Account[] = [
  {
    id: 1,
    tripCode: 'TR01',
    departureDate: new Date(),
    noOfPassengers: 0,
    noOfLeaders: 0,
    reviewerNotes: null,
    accountStatus: 'DRAFT',
    productId: 0,
    isActive: false,
    createdBy: '',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
    leaderUserId: null,
  },
  {
    id: 2,
    tripCode: 'TR02',
    departureDate: new Date(),
    noOfPassengers: 0,
    noOfLeaders: 0,
    reviewerNotes: null,
    accountStatus: 'DRAFT',
    productId: 0,
    isActive: false,
    createdBy: '',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
    leaderUserId: null,
  },
];

const product: Product = {
  id: 1,
  productCode: 'P01',
  brandId: 0,
  companyId: 0,
  isActive: false,
  createdBy: '',
  createdDate: new Date(),
  updatedBy: null,
  updatedDate: null,
  deletedBy: null,
  deletedDate: null,
  duration: null,
  productName: '',
  businessId: null,
};

const leaderUser: User = {
  id: 1,
  userAccount: 'U01',
  cardCode: null,
  cashCode: null,
  isActive: false,
  companyId: 0,
  createdBy: '',
  createdDate: new Date(),
  updatedBy: null,
  updatedDate: null,
  deletedBy: null,
  deletedDate: null,
};

const currency: Currency = {
  id: 0,
  currencyCode: '',
  currencyName: '',
  currencyRate: 0,
  isActive: false,
  createdBy: '',
  createdDate: new Date(),
  updatedBy: null,
  updatedDate: null,
  deletedBy: null,
  deletedDate: null,
};

const accountsWithIncludes = [
  {
    ...accounts[0],
    Currency: currency,
    Product: product,
    Leader: leaderUser,
  },
  {
    ...accounts[1],
    Currency: currency,
    Product: product,
    Leader: leaderUser,
  },
];

vi.mock('~/prisma/client');
mockNuxtImport('useRuntimeConfig', () => {
  return () => {
    return { defaultPageLimit: pageLimit };
  };
});

describe('create()', () => {
  const input: AccountInputDto = {
    tripCode: 'TR01',
    noOfPassengers: 0,
    productId: 0,
    noOfLeaders: 0,
    accountStatus: 'DRAFT',
    departureDate: new Date().toISOString(),
  };
  const createdEntity: Account = accounts[0];

  const leaderResult: User = {
    id: 1,
    userAccount: user,
    cardCode: null,
    cashCode: null,
    isActive: false,
    companyId: 0,
    createdBy: '',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
  };
  const budgets: Budget[] = [
    {
      id: 1,
      dayNumber: null,
      expenseTitle: 'EX01',
      paymentType: null,
      isActive: false,
      version: 0,
      productId: 0,
      createdBy: '',
      createdDate: new Date(),
      updatedBy: null,
      updatedDate: null,
      deletedBy: null,
      deletedDate: null,
      expenseCode: null,
      expenseCategoryId: 0,
      taxId: null,
      departmentId: null,
      currencyId: null,
      salesTaxGroupId: null,
    },
  ];

  const costs: Cost[] = [
    {
      id: 1,
      costType: 'PERSON',
      sequence: 0,
      costAmount: null,
      baseCurrencyAmount: null,
      baseCurrencyCode: null,
      isActive: false,
      createdBy: '',
      createdDate: new Date(),
      updatedBy: null,
      updatedDate: null,
      deletedBy: null,
      deletedDate: null,
      budgetId: 0,
    },
  ];

  const expense: Expense = {
    id: 1,
    expenseTitle: 'EX01',
    expenseDate: new Date(),
    noOfPassengers: null,
    noOfLeaders: null,
    currencyId: null,
    budgetedCurrencyId: null,
    expenseCategoryId: null,
    paymentType: null,
    comment: null,
    invoiceNumber: null,
    budgetedNoOfPax: null,
    budgetedNoOfLeaders: null,
    budgetedLeaderCost: null,
    budgetedPassengerCost: null,
    budgetedBaseCurrencyLeaderCost: null,
    budgetedBaseCurrencyPassengerCost: null,
    baseCurrencyCode: null,
    amount: null,
    baseCurrencyAmount: null,
    departmentId: null,
    status: 'DRAFT',
    isActive: false,
    createdBy: '',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
    expenseTransactionType: 'AUTO',
    accountId: 0,
    taxId: null,
    salesTaxGroupId: null,
    expenseType: null,
  };

  it('creates expense if expense does not exist', async () => {
    //arrange
    const output = new EntitySavedResponseDto(createdEntity.id);

    client.user.findFirst.mockResolvedValue(leaderResult);
    client.account.create.mockResolvedValue(createdEntity);
    client.budget.findMany.mockResolvedValue(budgets);
    client.cost.findMany.mockResolvedValue(costs);

    client.expense.create.mockResolvedValue(expense);

    client.account.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.create(input);

    //assert
    expect(client.account.create).toBeCalledWith({
      data: {
        ...input,
        createdBy: user,

        isActive: true,
      },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if expense exists', async () => {
    //arrange
    client.account.create.mockResolvedValue(createdEntity);
    client.account.findFirst.mockResolvedValue(accounts[0]);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act and assert
    expect(client.account.findFirst).toBeCalledTimes(0);
    expect(client.account.create).toBeCalledTimes(0);
  });
});

describe('getById()', () => {
  const id = 1;
  it('queries and returns account', async () => {
    // arrange

    client.account.findFirstOrThrow.mockResolvedValue(accountsWithIncludes[0]);
    const output = AccountOutputDto.fromEntity(
      accountsWithIncludes[0],
      accountsWithIncludes[0].Product,
      new Prisma.Decimal(0.0),
      new Prisma.Decimal(0.0),
      accountsWithIncludes[0].Leader,
      accountsWithIncludes[0].Currency
    );

    // act
    const result = await service.getById(id);

    // assert
    expect(client.account.findFirstOrThrow).toBeCalledTimes(1);
    expect(client.account.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
      include: {
        Product: true,
        Leader: true,
      },
    });

    expect(result).toStrictEqual(output);
  });
});

describe('getAll()', () => {
  it('throws an error if leader cannot be found', async () => {
    // arrange
    client.user.findFirst.mockResolvedValueOnce(null);
    client.$transaction.mockImplementationOnce((callback) => callback(client));

    // act and assert
    await expect(service.getAll({})).rejects.toThrowError('User Not found');
    expect(client.user.findFirst).toBeCalledTimes(1);
  });

  it('queries with defaults when no parameters are passed and returns accounts', async () => {
    // arrange

    const leaderResult: User = {
      id: 1,
      userAccount: user,
      cardCode: null,
      cashCode: null,
      isActive: false,
      companyId: 0,
      createdBy: '',
      createdDate: new Date(),
      updatedBy: null,
      updatedDate: null,
      deletedBy: null,
      deletedDate: null,
    };

    const whereClause: Prisma.AccountWhereInput = {};

    whereClause.OR = [
      {
        accountStatus: {
          in: [
            AccountStatus.SUBMITTED,
            AccountStatus.REJECTED,
            AccountStatus.APPROVED,
          ],
        },
      },

      {
        accountStatus: AccountStatus.DRAFT,
        leaderUserId: 1,
      },
      {
        createdBy: user,
      },
    ];

    whereClause.isActive = true;
    whereClause.tripCode = { contains: undefined, mode: 'insensitive' };

    const output = {
      data: arrayToOutput(accountsWithIncludes),
      pagination: {
        totalCount: accountsWithIncludes.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    // const orderByValue: AccountOrderBy = 'id';
    // const direction: Prisma.SortOrder = 'asc';

    // //@ts-ignore https://github.com/prisma/prisma/discussions/13817
    client.user.findFirst.mockResolvedValueOnce(leaderResult);

    const budgetSummary = [
      {
        accountId: 1,
        _sum: {
          budgetedBaseCurrencyLeaderCost: 0,
          budgetedBaseCurrencyPassengerCost: 0,
        },
      },
      {
        accountId: 2,
        _sum: {
          budgetedBaseCurrencyLeaderCost: 0,
          budgetedBaseCurrencyPassengerCost: 0,
        },
      },
    ];

    const expenseSummary = [
      {
        accountId: 1,
        _sum: {
          baseCurrencyAmount: 0,
        },
      },
      {
        accountId: 2,
        _sum: {
          baseCurrencyAmount: 0,
        },
      },
    ];

    const companies = [
      {
        id: 1,
        companyCode: 'COMP01',
        companyName: '',
        isActive: false,
        createdBy: '',
        createdDate: new Date(),
        updatedBy: null,
        updatedDate: null,
        deletedBy: null,
        deletedDate: null,
        baseCurrencyId: 0,
        BaseCurrency: {
          id: 1,
          currencyCode: 'USD',
          currencyName: '',
          currencyRate: 0,
          isActive: false,
          createdBy: '',
          createdDate: new Date(),
          updatedBy: null,
          updatedDate: null,
          deletedBy: null,
          deletedDate: null,
        },
      },
    ];

    // act
    client.$transaction.mockResolvedValueOnce({
      data: accountsWithIncludes,
      count: accountsWithIncludes.length,
    });
    client.$transaction.mockImplementationOnce((callback) => callback(client));

    client.expense.groupBy
      //@ts-expect-error https://github.com/prisma/prisma/issues/20146
      //.mockResolvedValueOnce(accountIds)
      .mockResolvedValueOnce(budgetSummary)
      .mockResolvedValueOnce(expenseSummary);

    client.company.findMany.mockResolvedValueOnce(companies);

    // assert

    const result = await service.getAll({});

    expect(client.user.findFirst).toBeCalledTimes(1);

    expect(client.$transaction).toHaveReturnedWith({
      data: accountsWithIncludes,
      count: accountsWithIncludes.length,
    });

    expect(client.company.findMany).toBeCalledTimes(1);

    expect(client.expense.groupBy).toBeCalledTimes(2);

    expect(result).toStrictEqual(output);
  });
});

describe('update()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    return () => vi.useRealTimers();
  });

  const input: AccountInputDto = {
    tripCode: 'TR01',
    noOfPassengers: 0,
    productId: 0,
    noOfLeaders: 0,
    accountStatus: 'DRAFT',
    departureDate: new Date().toISOString(),
  };

  it('updates account by account id', async () => {
    //arrange
    client.account.update.mockResolvedValueOnce(accounts[0]);
    client.account.findFirst.mockResolvedValueOnce(null);
    client.$transaction.mockImplementationOnce((callback) => callback(client));

    // act
    await service.update(1, input);

    //assert
    expect(client.account.update).toBeCalledTimes(1);

    expect(client.account.update).toBeCalledWith({
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
    const updatedEntity: Account = { ...accounts[1], isActive: false };
    client.account.update.mockResolvedValue(updatedEntity);

    //act and assert
    await expect(service.delete(id)).resolves.not.toThrow();
    expect(client.account.update).toBeCalledWith({
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

  it('throws error if account does not exist', async () => {
    //arrange
    const id = 15;
    client.account.update.mockImplementation(() => {
      throw new Error('account does not exist');
    });

    //act and assert
    await expect(service.delete(id)).rejects.toThrowError(
      'account does not exist'
    );
    expect(client.account.update).toBeCalledWith({
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

function arrayToOutput(accounts: any[]) {
  const accountOutputList: AccountOutputDto[] = [];
  accounts.forEach((account) => {
    accountOutputList.push(
      AccountOutputDto.fromEntity(
        account,
        account.Product,
        new Prisma.Decimal(0.0),
        new Prisma.Decimal(0.0),
        account.Leader,
        account.Currency
      )
    );
  });
  return accountOutputList;
}
