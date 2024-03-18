import prisma from '~/prisma/client';
import ExcelJS from 'exceljs';
import { ExpenseType, PaymentType, Prisma } from '@prisma/client';
import type AccountExportInputDto from '../dtos/export/account-export-input.dto';
import { Stream } from 'stream';
import type AccountExportOutputDto from '../dtos/export/account-export-output.dto';

interface D365ExpenseLine {
  journalBatchNumber: string;
  lineNumber: number;
  accountType: string;
  accountDisplayValue: string;
  transDate: string;
  currencyCode: string;
  debitAmount: string;
  creditAmount: string;
  description: string;
  text: string;
  documentDate: string;
  igDateOfService: string;
  invoice: string;
  document: number;
  igBookingId: string;
  salesTaxGroup: string;
  itemSalesTaxGroup: string;
  offsetAccountType: string;
  offsetAccountDisplayValue: string;
  journalName: string;
  voucher: number;
}

export type AccountWithIncludes = Prisma.PromiseReturnType<typeof getAccount>;
type ExpenseWithIncludes = AccountWithIncludes['Expense'][number];

async function getAccount(accountId: number) {
  const account = await prisma.account.findFirstOrThrow({
    where: { id: accountId, isActive: true },
    include: {
      Product: { include: { Business: true, Company: true } },
      Leader: true,
      Expense: {
        include: {
          Department: true,
          ExpenseCategory: true,
          Tax: true,
          SalesTaxGroup: true,
          Currency: true,
        },
      },
    },
  });
  return account;
}

export default class AccountExportService {
  constructor(private user: string) {}

  async getD365AccountExport({
    id,
    documentDate,
    transactionDate,
  }: AccountExportInputDto): Promise<AccountExportOutputDto> {
    const account = await getAccount(id);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = this.user;

    const sheet = this.createD365AccountExportWorksheet(workbook);
    let index = 0;

    for (const expense of account.Expense) {
      index = index + 1;

      let row: D365ExpenseLine = {
        journalBatchNumber: '',
        lineNumber: index,
        accountType: 'Ledger',
        accountDisplayValue: this.createAccountDisplayValue(account, expense),
        transDate: transactionDate.toLocaleDateString('en-US'),
        currencyCode: expense.Currency?.currencyCode ?? '',
        debitAmount: expense.amount
          ? expense.amount.abs().toFixed(2, Prisma.Decimal.ROUND_DOWN)
          : '0.00',
        creditAmount: '0.00',
        description: expense.expenseTitle,
        text: expense.expenseTitle,
        documentDate: documentDate.toLocaleDateString('en-US'),
        igDateOfService: account.departureDate.toLocaleDateString('en-US'),
        invoice: expense.invoiceNumber ?? '',
        document: 1,
        igBookingId: '',
        salesTaxGroup: expense.Tax?.taxCode ?? '',
        itemSalesTaxGroup: expense.SalesTaxGroup?.salesTaxGroupCode ?? '',
        offsetAccountType: 'BANK',
        offsetAccountDisplayValue: this.createOffsetAccountDisplayValue(
          account,
          expense
        ),
        journalName: 'GENJRN',
        voucher: index,
      };

      this.addRow(sheet, row);
      if (expense.expenseType === ExpenseType.WITHDRAWAL) {
        row.creditAmount = row.debitAmount;
        row.debitAmount = '0.00';
        this.addRow(sheet, row);
      }
    }

    const fileName = `${account.tripCode}.csv`;
    const stream = new Stream.PassThrough();
    await workbook.csv.write(stream);
    return { fileName: fileName, stream: stream };
  }

  private createD365AccountExportWorksheet(
    workbook: ExcelJS.Workbook
  ): ExcelJS.Worksheet {
    const sheet = workbook.addWorksheet('Sheet 1');
    sheet.columns = [
      { header: 'JOURNALBATCHNUMBER', key: 'journalBatchNumber' },
      { header: 'LINENUMBER', key: 'lineNumber' },
      { header: 'ACCOUNTTYPE', key: 'accountType' },
      { header: 'ACCOUNTDISPLAYVALUE', key: 'accountDisplayValue' },
      { header: 'TRANSDATE', key: 'transDate' },
      { header: 'CURRENCYCODE', key: 'currencyCode' },
      { header: 'DEBITAMOUNT', key: 'debitAmount' },
      { header: 'CREDITAMOUNT', key: 'creditAmount' },
      { header: 'DESCRIPTION', key: 'description' },
      { header: 'TEXT', key: 'text' },
      { header: 'DOCUMENTDATE', key: 'documentDate' },
      { header: 'IG_DATEOFSERVICE', key: 'igDateOfService' },
      { header: 'INVOICE', key: 'invoice' },
      { header: 'DOCUMENT', key: 'document' },
      { header: 'IG_BOOKINGID', key: 'igBookingId' },
      { header: 'SALESTAXGROUP', key: 'salesTaxGroup' },
      { header: 'ITEMSALESTAXGROUP', key: 'itemSalesTaxGroup' },
      { header: 'OFFSETACCOUNTTYPE', key: 'offsetAccountType' },
      { header: 'OFFSETACCOUNTDISPLAYVALUE', key: 'offsetAccountDisplayValue' },
      { header: 'JOURNALNAME', key: 'journalName' },
      { header: 'VOUCHER', key: 'voucher' },
    ];
    return sheet;
  }

  private createAccountDisplayValue(
    account: AccountWithIncludes,
    expense: ExpenseWithIncludes
  ): string {
    let expenseCode = '';
    let businessCode = '';
    let departmentCode = '';
    let productCode = '';

    if (expense.ExpenseCategory) {
      expenseCode = expense.ExpenseCategory.expenseCode;
    }

    if (account.Product.Business) {
      businessCode = account.Product.Business.businessCode;
    }

    if (expense.Department) {
      departmentCode = expense.Department.departmentCode;
    }

    if (expense.expenseType === ExpenseType.WITHDRAWAL) {
      productCode = '';
    } else {
      productCode = account.Product.productCode;
    }

    let displayValue = `${expenseCode}-${businessCode}-${departmentCode}---${productCode}----`;
    return displayValue;
  }

  private createOffsetAccountDisplayValue(
    account: AccountWithIncludes,
    expense: ExpenseWithIncludes
  ): string {
    if (expense.paymentType === PaymentType.CARD) {
      return `${account.Product.Company.companyCode}.${account.Leader?.cardCode ?? ''}`;
    } else if (expense.paymentType === PaymentType.CASH) {
      return `${account.Product.Company.companyCode}.${account.Leader?.cashCode ?? ''}`;
    } else {
      return `${account.Product.Company.companyCode}.`;
    }
  }

  private addRow(sheet: ExcelJS.Worksheet, row: D365ExpenseLine) {
    sheet.addRow({
      journalBatchNumber: row.journalBatchNumber,
      lineNumber: row.lineNumber,
      accountType: row.accountType,
      accountDisplayValue: row.accountDisplayValue,
      transDate: row.transDate,
      currencyCode: row.currencyCode,
      debitAmount: row.debitAmount,
      creditAmount: row.creditAmount,
      description: row.description,
      text: row.text,
      documentDate: row.documentDate,
      igDateOfService: row.igDateOfService,
      invoice: row.invoice,
      document: row.document,
      igBookingId: row.igBookingId,
      salesTaxGroup: row.salesTaxGroup,
      itemSalesTaxGroup: row.itemSalesTaxGroup,
      offsetAccountType: row.offsetAccountType,
      offsetAccountDisplayValue: row.offsetAccountDisplayValue,
      journalName: row.journalName,
      voucher: row.voucher,
    });
  }
}
