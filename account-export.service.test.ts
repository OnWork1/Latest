// @vitest-environment node
import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import client from '~/prisma/__mocks__/client';
import AccountExportService, {
  type AccountWithIncludes,
} from '../account-export.service';

const user = 'testUser';
const service = new AccountExportService(user);
vi.mock('~/prisma/client');

const accountWithIncludes: AccountWithIncludes = {
  id: 1001,
  accountStatus: 'APPROVED',
  leaderUserId: 1,
  noOfLeaders: 10,
  noOfPassengers: 2,
  reviewerNotes: '',
  productId: 12,
  tripCode: 'TP02JSK',
  departureDate: new Date(),
  deletedBy: null,
  isActive: true,
  updatedBy: 'user',
  deletedDate: null,
  updatedDate: new Date(),
  createdDate: new Date(),
  createdBy: 'user',
  Leader: {
    id: 1,
    userAccount: 'testuser@intrepid.com',
    companyId: 12,
    isActive: true,
    updatedBy: 'user',
    deletedDate: null,
    updatedDate: new Date(),
    createdDate: new Date(),
    createdBy: 'user',
    deletedBy: null,
    cardCode: null,
    cashCode: null,
  },
  Product: {
    id: 10,
    brandId: 1,
    productCode: 'P001',
    productName: 'Product 1',
    isActive: true,
    updatedBy: 'user',
    deletedDate: null,
    updatedDate: new Date(),
    createdDate: new Date(),
    createdBy: 'user',
    deletedBy: null,
    businessId: 1,
    Business: {
      id: 1,
      businessCode: 'BA01',
      businessName: 'Business 1',
      isActive: true,
      updatedBy: 'user',
      deletedDate: null,
      updatedDate: new Date(),
      createdDate: new Date(),
      createdBy: 'user',
      deletedBy: null,
    },
    companyId: 1,
    Company: {
      id: 1,
      companyCode: 'CO01',
      companyName: 'Company 1',
      baseCurrencyId: 1,
      isActive: true,
      updatedBy: 'user',
      deletedDate: null,
      updatedDate: new Date(),
      createdDate: new Date(),
      createdBy: 'user',
      deletedBy: null,
    },
    duration: 10,
  },
  Expense: [
    {
      id: 110,
      accountId: 1001,
      expenseTitle: 'Activity 1',
      expenseDate: new Date(),
      expenseCategoryId: 1,
      expenseTransactionType: 'AUTO',
      expenseType: 'EXPENSE',
      amount: new Prisma.Decimal(1000),
      currencyId: 1,
      baseCurrencyAmount: new Prisma.Decimal(1000),
      baseCurrencyCode: 'LKR',
      budgetedCurrencyId: 1,
      budgetedBaseCurrencyLeaderCost: new Prisma.Decimal(200),
      budgetedBaseCurrencyPassengerCost: new Prisma.Decimal(800),
      budgetedLeaderCost: new Prisma.Decimal(200),
      budgetedPassengerCost: new Prisma.Decimal(800),
      budgetedNoOfLeaders: 1,
      budgetedNoOfPax: 1,
      comment: null,
      noOfLeaders: 1,
      noOfPassengers: 1,
      paymentType: 'CARD',
      departmentId: 1,
      invoiceNumber: null,
      status: 'DRAFT',
      salesTaxGroupId: 1,
      taxId: 1,
      isActive: true,
      updatedBy: 'user',
      deletedDate: null,
      updatedDate: new Date(),
      createdDate: new Date(),
      createdBy: 'user',
      deletedBy: null,
      Currency: {
        id: 1,
        currencyCode: 'LKR',
        currencyName: 'Sri Lankan Rupee',
        currencyRate: 320,
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
      Department: {
        id: 1,
        departmentCode: 'DP01',
        departmentName: 'Department 1',
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
      ExpenseCategory: {
        id: 1,
        expenseCode: 'EXP01',
        expenseName: 'Expense 1',
        defaultPaymentType: 'CARD',
        disablePaymentType: false,
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
      SalesTaxGroup: {
        id: 1,
        salesTaxGroupCode: 'STGC01',
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
      Tax: {
        id: 1,
        taxCode: 'tx01',
        taxRate: new Prisma.Decimal(20),
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
    },
    {
      id: 111,
      accountId: 1001,
      expenseTitle: 'Activity 2',
      expenseDate: new Date(),
      expenseCategoryId: 2,
      expenseTransactionType: 'AUTO',
      expenseType: 'WITHDRAWAL',
      amount: new Prisma.Decimal(1000),
      currencyId: 1,
      baseCurrencyAmount: new Prisma.Decimal(1000),
      baseCurrencyCode: 'LKR',
      budgetedCurrencyId: 1,
      budgetedBaseCurrencyLeaderCost: new Prisma.Decimal(200),
      budgetedBaseCurrencyPassengerCost: new Prisma.Decimal(800),
      budgetedLeaderCost: new Prisma.Decimal(200),
      budgetedPassengerCost: new Prisma.Decimal(800),
      budgetedNoOfLeaders: 1,
      budgetedNoOfPax: 1,
      comment: null,
      noOfLeaders: 1,
      noOfPassengers: 1,
      paymentType: 'CASH',
      departmentId: 1,
      invoiceNumber: null,
      status: 'DRAFT',
      salesTaxGroupId: 1,
      taxId: 1,
      isActive: true,
      updatedBy: 'user',
      deletedDate: null,
      updatedDate: new Date(),
      createdDate: new Date(),
      createdBy: 'user',
      deletedBy: null,
      Currency: {
        id: 1,
        currencyCode: 'LKR',
        currencyName: 'Sri Lankan Rupee',
        currencyRate: 320,
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
      Department: {
        id: 1,
        departmentCode: 'DP01',
        departmentName: 'Department 1',
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
      ExpenseCategory: {
        id: 2,
        expenseCode: 'EXP02',
        expenseName: 'Expense 2',
        defaultPaymentType: 'CASH',
        disablePaymentType: false,
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
      SalesTaxGroup: {
        id: 1,
        salesTaxGroupCode: 'STGC01',
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
      Tax: {
        id: 1,
        taxCode: 'tx01',
        taxRate: new Prisma.Decimal(20),
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
    },
    {
      id: 113,
      accountId: 1001,
      expenseTitle: 'Activity 3',
      expenseDate: new Date(),
      expenseCategoryId: 2,
      expenseTransactionType: 'AUTO',
      expenseType: 'EXPENSE',
      amount: null,
      currencyId: 1,
      baseCurrencyAmount: new Prisma.Decimal(1000),
      baseCurrencyCode: 'LKR',
      budgetedCurrencyId: 1,
      budgetedBaseCurrencyLeaderCost: new Prisma.Decimal(200),
      budgetedBaseCurrencyPassengerCost: new Prisma.Decimal(800),
      budgetedLeaderCost: new Prisma.Decimal(200),
      budgetedPassengerCost: new Prisma.Decimal(800),
      budgetedNoOfLeaders: 1,
      budgetedNoOfPax: 1,
      comment: null,
      noOfLeaders: 1,
      noOfPassengers: 1,
      paymentType: null,
      departmentId: 1,
      invoiceNumber: null,
      status: 'DRAFT',
      salesTaxGroupId: 1,
      taxId: 1,
      isActive: true,
      updatedBy: 'user',
      deletedDate: null,
      updatedDate: new Date(),
      createdDate: new Date(),
      createdBy: 'user',
      deletedBy: null,
      Currency: {
        id: 1,
        currencyCode: 'LKR',
        currencyName: 'Sri Lankan Rupee',
        currencyRate: 320,
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
      Department: {
        id: 1,
        departmentCode: 'DP01',
        departmentName: 'Department 1',
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
      ExpenseCategory: {
        id: 1,
        expenseCode: 'EXP01',
        expenseName: 'Expense 1',
        defaultPaymentType: 'CARD',
        disablePaymentType: false,
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
      SalesTaxGroup: {
        id: 1,
        salesTaxGroupCode: 'STGC01',
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
      Tax: {
        id: 1,
        taxCode: 'tx01',
        taxRate: new Prisma.Decimal(20),
        isActive: true,
        updatedBy: 'user',
        deletedDate: null,
        updatedDate: new Date(),
        createdDate: new Date(),
        createdBy: 'user',
        deletedBy: null,
      },
    },
  ],
};

describe('getD365AccountExport()', () => {
  it('returns stream', async () => {
    //Arrange
    client.account.findFirstOrThrow.mockResolvedValue(accountWithIncludes);

    const result = await service.getD365AccountExport({
      id: 1,
      documentDate: new Date(),
      transactionDate: new Date(),
    });
    expect(result.fileName).toBe('TP02JSK.csv');
  });

  it('throws an error when account does not exist', async () => {
    //Arrange
    client.account.findFirstOrThrow.mockImplementation(() => {
      throw new Error('Account does not exist');
    });

    await expect(
      service.getD365AccountExport({
        id: 1,
        documentDate: new Date(),
        transactionDate: new Date(),
      })
    ).rejects.toThrowError('Account does not exist');
  });
});
