// @vitest-environment node
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import client from '~/prisma/__mocks__/client';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';

import {
  Prisma,
  type Department,
  type ExpenseCategory,
  type Tax,
  type Budget,
  type Currency,
  type Product,
  type SalesTaxGroup,
  type Expense,
} from '@prisma/client';

import getSkipTake from '~/utils/get-skip-take';

import getISODateTime from '~/utils/get-iso-date-time';
import BudgetService from '../budget.service';
import type BudgetInputDto from '~/server/dtos/budget/budget-input.dto';
import BudgetOutputDto from '~/server/dtos/budget/budget-output.dto';
import { type BudgetOrderBy } from '~/server/dtos/budget/budget-order-by.dto';
import AccountBudgetOutputDto from '~/server/dtos/account-budget/account-budget-output.dto';

const user = 'testUser';
const service = new BudgetService(user);
const pageLimit = 20;

const budgets: Budget[] = [
  {
    id: 1,
    dayNumber: null,
    expenseTitle: '',
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
  {
    id: 2,
    dayNumber: null,
    expenseTitle: '',
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

const currency: Currency = {
  id: 1,
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

const department: Department = {
  id: 0,
  departmentName: 'DEPT01',
  departmentCode: 'DEPT01',
  isActive: false,
  createdBy: '',
  createdDate: new Date(),
  updatedBy: null,
  updatedDate: null,
  deletedBy: null,
  deletedDate: null,
};

const expenseCat: ExpenseCategory = {
  id: 0,
  expenseName: 'EX01',
  expenseCode: 'EX01',
  defaultPaymentType: 'CASH',
  disablePaymentType: false,
  isActive: false,
  createdBy: '',
  createdDate: new Date(),
  updatedBy: null,
  updatedDate: null,
  deletedBy: null,
  deletedDate: null,
};

const tax: Tax = {
  id: 0,
  taxCode: 'TAX01',
  taxRate: new Prisma.Decimal(0.0),
  isActive: false,
  createdBy: '',
  createdDate: new Date(),
  updatedBy: null,
  updatedDate: null,
  deletedBy: null,
  deletedDate: null,
};

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

const salesTaxGroup: SalesTaxGroup = {
  id: 0,
  salesTaxGroupCode: '',
  isActive: false,
  createdBy: '',
  createdDate: new Date(),
  updatedBy: null,
  updatedDate: null,
  deletedBy: null,
  deletedDate: null,
};

const budgetsWithIncludes = [
  {
    ...budgets[0],
    Currency: currency,
    Department: department,
    ExpenseCategory: expenseCat,
    Tax: tax,
    Product: product,
    SalesTaxGroup: salesTaxGroup,
  },
  {
    ...budgets[1],
    Currency: currency,
    Department: department,
    ExpenseCategory: expenseCat,
    Tax: tax,
    Product: product,
    SalesTaxGroup: salesTaxGroup,
  },
];

const expenseList = [
  {
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
  },
  {
    id: 2,
    expenseTitle: 'EX02',
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
  },
];

const expensesWithIncludes = [
  {
    ...expenseList[0],
    Currency: currency,
    Department: department,
    ExpenseCategory: expenseCat,
    Tax: tax,
    Product: product,
    SalesTaxGroup: salesTaxGroup,
  },
  {
    ...expenseList[1],
    Currency: currency,
    Department: department,
    ExpenseCategory: expenseCat,
    Tax: tax,
    Product: product,
    SalesTaxGroup: salesTaxGroup,
  },
];

vi.mock('~/prisma/client');
mockNuxtImport('useRuntimeConfig', () => {
  return () => {
    return { defaultPageLimit: pageLimit };
  };
});

describe('create()', () => {
  const input: BudgetInputDto = {
    expenseTitle: 'EX01',
    expenseCategoryId: 1,
    productId: 1,
  };
  const createdEntity: Budget = budgets[0];
  it('creates budget', async () => {
    //arrange
    const output = new EntitySavedResponseDto(createdEntity.id);
    client.budget.create.mockResolvedValue(createdEntity);
    client.budget.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.create(input);

    //assert
    expect(client.budget.create).toBeCalledWith({
      data: {
        ...input,
        createdBy: user,
        version: 1,
        isActive: true,
      },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if budget exists', async () => {
    //arrange
    client.budget.create.mockResolvedValue(createdEntity);
    client.budget.findFirst.mockResolvedValue(budgets[0]);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act and assert
    expect(client.budget.findFirst).toBeCalledTimes(0);
    expect(client.budget.create).toBeCalledTimes(0);
  });
});

describe('getById()', () => {
  const id = 1;
  it('queries and returns a budget', async () => {
    // arrange

    client.budget.findFirstOrThrow.mockResolvedValue(budgetsWithIncludes[0]);
    const output = BudgetOutputDto.fromEntity(
      budgetsWithIncludes[0],
      currency,
      tax,
      department,
      product,
      0,
      0,
      new Prisma.Decimal(0),
      expenseCat,
      salesTaxGroup
    );

    // act
    const result = await service.getById(id);

    // assert
    expect(client.budget.findFirstOrThrow).toBeCalledTimes(1);
    expect(client.budget.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
      include: {
        Tax: true,
        Currency: true,
        Department: true,
        Product: true,
        ExpenseCategory: true,
        SalesTaxGroup: true,
      },
    });

    expect(result).toStrictEqual(output);
  });

  it('throws error if budget does not exist', async () => {
    // arrange
    client.budget.findFirstOrThrow.mockImplementation(() => {
      throw new Error('Budget does not exist');
    });

    // act and assert
    await expect(service.getById(id)).rejects.toThrowError(
      'Budget does not exist'
    );
    expect(client.budget.findFirstOrThrow).toBeCalledTimes(1);
    expect(client.budget.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
      include: {
        Tax: true,
        Currency: true,
        Department: true,
        Product: true,
        ExpenseCategory: true,
        SalesTaxGroup: true,
      },
    });
  });
});

describe('getAll()', () => {
  it('queries with defaults when no parameters are passed and returns budgets', async () => {
    // arrange
    client.$transaction.mockResolvedValue([
      budgetsWithIncludes,
      budgetsWithIncludes.length,
    ]);
    const { skip, take } = getSkipTake();

    const defaultWhere: Prisma.BudgetFindManyArgs = {
      where: {
        isActive: true,
        OR: [{ expenseTitle: { contains: undefined, mode: 'insensitive' } }],
      },
    };

    const output = {
      data: arrayToOutput(budgetsWithIncludes),
      pagination: {
        totalCount: budgetsWithIncludes.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    const orderByValue: BudgetOrderBy = 'id';
    const direction: Prisma.SortOrder = 'asc';

    // act
    const result = await service.getAll({});

    // assert
    expect(client.budget.findMany).toHaveBeenCalledTimes(1);

    expect(client.budget.findMany).toHaveBeenCalledWith({
      where: defaultWhere.where,
      skip: skip,
      take: take,
      orderBy: {
        [orderByValue]: direction,
      },
      include: {
        Tax: true,
        Currency: true,
        Department: true,
        Product: true,
        Costs: true,
        ExpenseCategory: true,
        SalesTaxGroup: true,
      },
    });
    expect(client.budget.count).toHaveBeenCalledWith({
      where: defaultWhere.where,
    });
    expect(result).toStrictEqual(output);
  });
});

describe('getByProductId()', () => {
  it('queries when productId is passed and returns budgets', async () => {
    // arrange
    client.$transaction.mockResolvedValue([
      budgetsWithIncludes,
      budgetsWithIncludes.length,
    ]);
    const { skip, take } = getSkipTake();

    const defaultWhere: Prisma.BudgetFindManyArgs = {
      where: {
        isActive: true,

        OR: [
          {
            expenseTitle: { contains: '', mode: 'insensitive' },
            productId: 0,
          },
        ],
      },
    };

    const output = {
      data: arrayToOutput(budgetsWithIncludes),
      pagination: {
        totalCount: budgetsWithIncludes.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    const orderByValue: BudgetOrderBy = 'id';
    const direction: Prisma.SortOrder = 'asc';

    // act
    const result = await service.getByProductId(
      +budgetsWithIncludes[0].productId,
      {
        page: 1,
        productId: budgetsWithIncludes[0].productId.toString(),
        orderBy: 'id',
        orderDirection: 'asc',
        searchQuery: '',
      }
    );

    // assert
    expect(client.budget.findMany).toHaveBeenCalledTimes(1);

    expect(client.budget.findMany).toHaveBeenCalledWith({
      where: defaultWhere.where,
      skip: skip,
      take: take,
      orderBy: {
        [orderByValue]: direction,
      },
      include: {
        Tax: true,
        Currency: true,
        Department: true,
        Product: true,
        ExpenseCategory: true,
        SalesTaxGroup: true,
      },
    });
    expect(client.budget.count).toHaveBeenCalledWith({
      where: defaultWhere.where,
    });
    expect(result).toStrictEqual(output);
  });
});

describe('getByAccountId()', () => {
  it('queries when accountId is passed and returns budgets', async () => {
    // arrange
    client.$transaction.mockResolvedValue([
      expensesWithIncludes,
      expensesWithIncludes.length,
    ]);

    const output = {
      data: arrayToAccountBudgtetOutput(expensesWithIncludes),
      pagination: {
        totalCount: expensesWithIncludes.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    // act
    const result = await service.getByAccountId({
      page: 1,
      perPage: 20,
      accountId: '1',
      productId: '1',
    });

    // assert
    expect(client.expense.findMany).toHaveBeenCalledTimes(1);

    expect(client.expense.findMany).toHaveBeenCalledWith({
      where: { accountId: 1, isActive: true },

      include: {
        Currency: true,
        Department: true,
        ExpenseCategory: true,
        Tax: true,
        BudgetedCurrency: true,
      },
    });
    expect(client.expense.count).toHaveBeenCalledWith({
      where: { accountId: 1, isActive: true },
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

  const input: BudgetInputDto = {
    expenseTitle: 'EX01',
    expenseCategoryId: 1,
    productId: 1,
  };

  it('updates budget by budget id', async () => {
    //arrange
    client.budget.update.mockResolvedValue(budgets[0]);
    client.budget.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act
    await service.update(1, input);

    //assert
    expect(client.budget.update).toBeCalledTimes(1);

    expect(client.budget.update).toBeCalledWith({
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
    const updatedEntity: Budget = { ...budgets[1], isActive: false };
    client.budget.update.mockResolvedValue(updatedEntity);

    //act and assert
    await expect(service.delete(id)).resolves.not.toThrow();
    expect(client.budget.update).toBeCalledWith({
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

  it('throws error if budget does not exist', async () => {
    //arrange
    const id = 15;
    client.budget.update.mockImplementation(() => {
      throw new Error('budget does not exist');
    });

    //act and assert
    await expect(service.delete(id)).rejects.toThrowError(
      'budget does not exist'
    );
    expect(client.budget.update).toBeCalledWith({
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

function arrayToOutput(budgets: any[]) {
  const budgetOutputList: BudgetOutputDto[] = [];
  budgets.forEach((budget) => {
    budgetOutputList.push(
      BudgetOutputDto.fromEntity(
        budget,
        budget.Currency,
        budget.Tax,
        budget.Department,
        budget.Product,
        0,
        0,
        new Prisma.Decimal(0.0),
        budget.ExpenseCategory,
        budget.SalesTaxGroup
      )
    );
  });
  return budgetOutputList;
}

function arrayToAccountBudgtetOutput(expense: any[]) {
  const budgetOutputList: AccountBudgetOutputDto[] = [];
  expense.forEach((expense) => {
    budgetOutputList.push(
      AccountBudgetOutputDto.fromEntity(
        expense,
        expense.Currency,
        expense.Department,
        expense.ExpenseCategory,
        expense.Tax,
        expense.BudgetedCurrency,
        0
      )
    );
  });
  return budgetOutputList;
}
