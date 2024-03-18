// @vitest-environment node
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import client from '~/prisma/__mocks__/client';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';

import {
  Prisma,
  type Company,
  type Expense,
  type Department,
  type ExpenseCategory,
  type Tax,
  type ReceiptInfo,
} from '@prisma/client';

import getSkipTake from '~/utils/get-skip-take';

import ExpenseService from '../expense.service';
import type ExpenseInputDto from '~/server/dtos/expense/expense-input.dto';
import ExpenseOutputDto from '~/server/dtos/expense/expense-output.dto';
import { type ExpenseOrderBy } from '~/server/dtos/expense/expense-order-by.dto';
import getISODateTime from '~/utils/get-iso-date-time';

const user = 'testUser';
const service = new ExpenseService(user);
const pageLimit = 20;

const expenses: Expense[] = [
  {
    id: 1,
    expenseTitle: 'Expense01',
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
    accountId: 1,
    taxId: null,
    salesTaxGroupId: null,
    expenseType: null,
  },
  {
    id: 2,
    expenseTitle: 'Expense02',
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
    expenseTransactionType: 'MANUAL',
    accountId: 1,
    taxId: null,
    salesTaxGroupId: null,
    expenseType: null,
  },
];

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

const receiptInfo: ReceiptInfo = {
  id: 1,
  fileName: 'file1',
  fileExtension: 'jpg',
  filePath: '',
  isActive: false,
  createdBy: '',
  createdDate: new Date(),
  expenseId: null,
};

const expensesWithIncludes = [
  {
    ...expenses[0],
    Currency: null,
    Department: department,
    ExpenseCategory: expenseCat,
    Company: company,
    Receipt: receiptInfo,
  },
  {
    ...expenses[1],
    Currency: null,
    Department: department,
    ExpenseCategory: expenseCat,
    Tax: tax,
    Company: company,
    Receipt: receiptInfo,
  },
];

vi.mock('~/prisma/client');
mockNuxtImport('useRuntimeConfig', () => {
  return () => {
    return { defaultPageLimit: pageLimit };
  };
});

describe('create()', () => {
  const input: ExpenseInputDto = {
    expenseTitle: 'Expense01',
    expenseDate: '01/01/2024',
    accountId: 0,
    status: 'DRAFT',
  };
  const createdEntity: Expense = expenses[0];
  it('creates expense if expense does not exist', async () => {
    //arrange
    const output = new EntitySavedResponseDto(createdEntity.id);
    client.expense.create.mockResolvedValue(createdEntity);
    client.expense.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.create(input);

    //assert
    expect(client.expense.create).toBeCalledWith({
      data: {
        ...input,
        createdBy: user,
        baseCurrencyAmount: new Prisma.Decimal(0),
        baseCurrencyCode: undefined,
        expenseTransactionType: 'MANUAL',
        isActive: true,
      },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if expense exists', async () => {
    //arrange
    client.expense.create.mockResolvedValue(createdEntity);
    client.expense.findFirst.mockResolvedValue(expenses[0]);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act and assert
    expect(client.expense.findFirst).toBeCalledTimes(0);
    expect(client.expense.create).toBeCalledTimes(0);
  });
});

describe('getById()', () => {
  const id = 1;
  it('queries and returns expense', async () => {
    // arrange

    client.expense.findFirstOrThrow.mockResolvedValue(expenses[0]);
    const output = ExpenseOutputDto.fromEntity(
      expenses[0],
      null,
      {
        departmentName: '',
        departmentCode: '',
        id: 0,
        isActive: false,
        createdBy: '',
        createdDate: new Date(),
        updatedBy: null,
        updatedDate: null,
        deletedBy: null,
        deletedDate: null,
      },
      {
        id: 0,
        expenseName: '',
        expenseCode: '',
        defaultPaymentType: 'CASH',
        disablePaymentType: false,
        isActive: false,
        createdBy: '',
        createdDate: new Date(),
        updatedBy: null,
        updatedDate: null,
        deletedBy: null,
        deletedDate: null,
      },
      {
        id: 0,
        taxCode: '',
        taxRate: new Prisma.Decimal(0.0),
        isActive: false,
        createdBy: '',
        createdDate: new Date(),
        updatedBy: null,
        updatedDate: null,
        deletedBy: null,
        deletedDate: null,
      },
      0,
      null
    );

    // act
    const result = await service.getById(id);

    // assert
    expect(client.expense.findFirstOrThrow).toBeCalledTimes(1);
    expect(client.expense.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
      include: {
        Currency: true,
        BudgetedCurrency: true,
        Department: true,
        ExpenseCategory: true,
        Receipt: true,
        Tax: true,
      },
    });

    expect(result).toStrictEqual(output);
  });

  it('throws error if expense does not exist', async () => {
    // arrange
    client.expense.findFirstOrThrow.mockImplementation(() => {
      throw new Error('Expense does not exist');
    });

    // act and assert
    await expect(service.getById(id)).rejects.toThrowError(
      'Expense does not exist'
    );
    expect(client.expense.findFirstOrThrow).toBeCalledTimes(1);
    expect(client.expense.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
      include: {
        Currency: true,
        BudgetedCurrency: true,
        Department: true,
        ExpenseCategory: true,
        Receipt: true,
        Tax: true,
      },
    });
  });
});

describe('getAll()', () => {
  it('queries with defaults when no parameters are passed and returns expenses', async () => {
    // arrange
    client.$transaction.mockResolvedValue([
      expensesWithIncludes,
      expensesWithIncludes.length,
    ]);
    const { skip, take } = getSkipTake();

    const defaultWhere: Prisma.ExpenseFindManyArgs = {
      where: {
        isActive: true,
        accountId: +expensesWithIncludes[0].accountId,
      },
    };

    const output = {
      data: arrayToOutput(expensesWithIncludes),
      pagination: {
        totalCount: expensesWithIncludes.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    const orderByValue: ExpenseOrderBy = 'id';
    const direction: Prisma.SortOrder = 'asc';

    // act
    const result = await service.getAll({
      accountId: expensesWithIncludes[0].accountId.toString(),
    });

    // assert
    expect(client.expense.findMany).toHaveBeenCalledTimes(1);
    expect(client.expense.findMany).toHaveBeenCalledWith({
      where: defaultWhere.where,
      skip: skip,
      take: take,
      orderBy: {
        [orderByValue]: direction,
      },
      include: {
        Currency: true,
        BudgetedCurrency: true,
        Department: true,
        ExpenseCategory: true,
        Receipt: true,
        Tax: true,
      },
    });
    expect(client.expense.count).toHaveBeenCalledWith({
      where: defaultWhere.where,
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

  const input: ExpenseInputDto = {
    expenseTitle: 'Expense01_updated',
    expenseDate: '',
    accountId: 0,
    status: 'DRAFT',
  };

  it('updates expense by expense id', async () => {
    //arrange
    client.expense.update.mockResolvedValue(expenses[0]);
    client.expense.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act
    await service.update(1, input);

    //assert
    expect(client.expense.update).toBeCalledTimes(1);

    expect(client.expense.update).toBeCalledWith({
      where: {
        id: 1,
        isActive: true,
      },
      data: {
        ...input,
        baseCurrencyAmount: new Prisma.Decimal(0),
        baseCurrencyCode: undefined,
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
    const updatedEntity: Expense = { ...expenses[1], isActive: false };
    client.expense.update.mockResolvedValue(updatedEntity);

    //act and assert
    await expect(service.delete(id)).resolves.not.toThrow();
    expect(client.expense.update).toBeCalledWith({
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

  it('throws error if expense does not exist', async () => {
    //arrange
    const id = 15;
    client.expense.update.mockImplementation(() => {
      throw new Error('expense does not exist');
    });

    //act and assert
    await expect(service.delete(id)).rejects.toThrowError(
      'expense does not exist'
    );
    expect(client.expense.update).toBeCalledWith({
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

function arrayToOutput(expenses: any[]) {
  const expenseOutputList: ExpenseOutputDto[] = [];
  expenses.forEach((expense) => {
    expenseOutputList.push(
      ExpenseOutputDto.fromEntity(
        expense,
        expense.Currency,
        expense.Department,
        expense.ExpenseCategory,
        expense.Tax,
        0,
        expense.Currency
      )
    );
  });
  return expenseOutputList;
}
