// @vitest-environment node
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { vi, describe, it, expect } from 'vitest';

import client from '~/prisma/__mocks__/client';

import {
  type Currency,
  type Budget,
  type Tax,
  type Department,
  type SalesTaxGroup,
  type ExpenseCategory,
} from '@prisma/client';

import BudgetUploadService from '../budget-upload.service';
import BudgetUploadDto from '~/server/dtos/budget-upload/budget-upload-input.dto';

import { Decimal } from '@prisma/client/runtime/library';

const user = 'testUser';
const service = new BudgetUploadService(user);
const pageLimit = 20;

vi.mock('~/prisma/client');
mockNuxtImport('useRuntimeConfig', () => {
  return () => {
    return { defaultPageLimit: pageLimit };
  };
});

describe('process()', () => {
  const input: BudgetUploadDto[] = [
    {
      RowNumber: 1,
      ProductId: 1,
      DayNumber: '1',
      ExpenseTitle: 'EX01',
      ExpenseCode: 'EX01',
      CurrencyCode: 'USD',
      PaymentType: 'CARD',
      SalesTaxCode: 'VAT',
      SalesTaxGroup: 'VATG01',
      DepartmentCode: 'DEPT01',
      PassengerCost_1: '10',
      PassengerCost_2: '',
      PassengerCost_3: '',
      PassengerCost_4: '',
      PassengerCost_5: '',
      PassengerCost_6: '',
      PassengerCost_7: '',
      PassengerCost_8: '',
      PassengerCost_9: '',
      PassengerCost_10: '',
      PassengerCost_11: '',
      PassengerCost_12: '',
      PassengerCost_13: '',
      PassengerCost_14: '',
      PassengerCost_15: '',
      PassengerCost_16: '',
      LeaderCost_1: '10',
      LeaderCost_2: '',
      LeaderCost_3: '',
      LeaderCost_4: '',
      LeaderCost_5: '',
    },
  ];

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

  const createdEntity = {
    ...budgets[0],
    Product: {
      id: 1,
      productCode: 'P01',
      brandId: 1,
      companyId: 1,
      isActive: false,
      createdBy: '',
      createdDate: undefined,
      updatedBy: null,
      updatedDate: null,
      deletedBy: null,
      deletedDate: null,
      duration: null,
      productName: '',
      businessId: null,
    },
  };

  const currency: Currency = {
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
  };

  const tax: Tax = {
    id: 1,
    taxCode: 'VAT',
    taxRate: new Decimal(0),
    isActive: false,
    createdBy: '',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
  };

  const department: Department = {
    id: 1,
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

  const salesTaxGroup: SalesTaxGroup = {
    id: 1,
    salesTaxGroupCode: 'VATG01',
    isActive: false,
    createdBy: '',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
  };

  const expenseCategory: ExpenseCategory = {
    id: 1,
    expenseName: 'EX01',
    expenseCode: 'EX01',
    defaultPaymentType: 'CARD',
    disablePaymentType: false,
    isActive: false,
    createdBy: '',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
  };

  it('creates budget', async () => {
    //arrange
    const output = {
      id: 1,
      expenseTitle: '',
      expenseCode: null,
      dayNumber: null,
      currencyCode: 'USD',
      paymentType: null,
      taxCode: 'VAT',
      salesTaxGroupCode: 'VATG01',
      departmentCode: 'DEPT01',
      productCode: 'P01',
      isSuccess: true,
      errorMessage: '',
      rowNumber: 1,
    };
    client.currency.findFirst.mockResolvedValue(currency);
    client.tax.findFirst.mockResolvedValue(tax);
    client.department.findFirst.mockResolvedValue(department);
    client.salesTaxGroup.findFirst.mockResolvedValue(salesTaxGroup);
    client.expenseCategory.findFirst.mockResolvedValue(expenseCategory);

    client.budget.create.mockResolvedValue(createdEntity);
    // client.budget.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.process(input);

    expect(result.results[0]).toEqual(output);
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
