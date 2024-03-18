import prisma from '~/prisma/client';
import { type ServiceBase } from './base/service-interface';
import {
  ExpenseTransactionType,
  ExpenseType,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import type ExpenseInputDto from '../dtos/expense/expense-input.dto';
import ExpenseOutputDto from '../dtos/expense/expense-output.dto';
import type ExpensePaginationDto from '../dtos/expense/expense-pagination.dto';
import getISODateTime from '~/utils/get-iso-date-time';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import getSkipTake from '~/utils/get-skip-take';
import { type ExpenseOrderBy } from '../dtos/expense/expense-order-by.dto';
import type ReceiptInputDto from '../dtos/receipt/receipt-input.dto';
import { v4 as uuidv4 } from 'uuid';
import S3FileService from './s3file.service';
import HttpStatus from '../common/http-status.enums';
import { type DefaultArgs } from '@prisma/client/runtime/library';

export default class ExpenseService
  implements
    ServiceBase<ExpenseInputDto, ExpenseOutputDto, ExpensePaginationDto>
{
  constructor(private user: string) {}
  checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    obj: ExpenseInputDto
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async delete(id: number): Promise<void> {
    await prisma.expense.update({
      where: {
        id: id,
        isActive: true,
      },
      data: {
        isActive: false,
        deletedBy: this.user,
        deletedDate: getISODateTime(),
      },
    });
  }

  async create(expense: ExpenseInputDto) {
    const { expenseId } = await prisma.$transaction(async (transaction) => {
      const productInfo = await transaction.account.findFirst({
        where: { id: expense.accountId },
        select: {
          productId: true,
        },
      });

      const product = await transaction.product.findFirst({
        where: { id: productInfo?.productId },
        select: { companyId: true },
      });

      const includeBaseCurrency = Prisma.validator<Prisma.CompanyInclude>()({
        BaseCurrency: true,
      });

      const company = await transaction.company.findFirst({
        where: { id: product?.companyId },
        include: includeBaseCurrency,
      });

      const expenseCurrency = await transaction.currency.findFirst({
        where: { id: expense?.currencyId! },
      });

      let baseCurrencyAmount = new Prisma.Decimal(0.0);

      if (expense?.currencyId != company?.baseCurrencyId) {
        baseCurrencyAmount = new Prisma.Decimal(
          (expense.amount ?? 0) * (expenseCurrency?.currencyRate ?? 1)
        );

        baseCurrencyAmount = new Prisma.Decimal(
          baseCurrencyAmount.toNumber() /
            (company?.BaseCurrency?.currencyRate ?? 1)
        );
      } else {
        baseCurrencyAmount = new Prisma.Decimal((expense.amount ?? 0) * 1);
      }

      const response = await transaction.expense.create({
        data: {
          ...expense,
          baseCurrencyAmount: baseCurrencyAmount,
          baseCurrencyCode: company?.BaseCurrency.currencyCode,
          isActive: true,
          expenseTransactionType: ExpenseTransactionType.MANUAL,
          createdBy: this.user,
        },
      });

      return { expenseId: response.id };
    });

    return new EntitySavedResponseDto(expenseId);
  }

  async createWithReceipts(
    expense: ExpenseInputDto,
    receipts: ReceiptInputDto[]
  ): Promise<EntitySavedResponseDto> {
    const { expenseId } = await prisma.$transaction(
      async (transaction) => {
        const productInfo = await transaction.account.findFirst({
          where: { id: expense.accountId },
          select: {
            productId: true,
          },
        });

        const product = await transaction.product.findFirst({
          where: { id: productInfo?.productId },
          select: { companyId: true },
        });

        const includeBaseCurrency = Prisma.validator<Prisma.CompanyInclude>()({
          BaseCurrency: true,
        });

        const company = await transaction.company.findFirst({
          where: { id: product?.companyId },
          include: includeBaseCurrency,
        });

        const expenseCurrency = await transaction.currency.findFirst({
          where: { id: expense?.currencyId! },
        });

        let baseCurrencyAmount = new Prisma.Decimal(0.0);

        if (expense?.currencyId != company?.baseCurrencyId) {
          baseCurrencyAmount = new Prisma.Decimal(
            (expense.amount ?? 0) * (expenseCurrency?.currencyRate ?? 1)
          );

          baseCurrencyAmount = new Prisma.Decimal(
            baseCurrencyAmount.toNumber() /
              (company?.BaseCurrency?.currencyRate ?? 1)
          );
        } else {
          baseCurrencyAmount = new Prisma.Decimal((expense.amount ?? 0) * 1);
        }

        const response = await transaction.expense.create({
          data: {
            ...expense,
            baseCurrencyAmount: baseCurrencyAmount,
            baseCurrencyCode: company?.BaseCurrency.currencyCode,
            expenseTransactionType: ExpenseTransactionType.MANUAL,
            isActive: true,
            createdBy: this.user,
          },
        });

        for (let index = 0; index < receipts.length; index++) {
          const receipt = receipts[index];

          const uuid = uuidv4();
          receipt.filePath = uuid;

          const s3Service = new S3FileService(this.user);

          const fileUploadResponse = await s3Service.upload(receipt);

          if (fileUploadResponse == HttpStatus.OK) {
            await transaction.receiptInfo.create({
              data: {
                fileName: receipt.fileName,
                filePath: receipt.filePath!,
                fileExtension: receipt.fileExtension,
                expenseId: response.id,
                isActive: true,
                createdBy: this.user,
              },
            });
          } else {
            throw new Error(`File upload failed`);
          }
        }

        return { expenseId: response.id };
      },
      {
        timeout: +process!.env!.TRANSACTION_TIMEOUT!
          ? +process!.env!.TRANSACTION_TIMEOUT!
          : 5000,
      }
    );

    return new EntitySavedResponseDto(expenseId);
  }

  async update(id: number, expense: ExpenseInputDto): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      const { baseCurrencyAmount, company } = await calculateBaseCurrencyAmount(
        transaction,
        expense
      );
      await transaction.expense.update({
        where: {
          id: id,
          isActive: true,
        },
        data: {
          ...expense,
          baseCurrencyAmount: baseCurrencyAmount,
          baseCurrencyCode: company?.BaseCurrency.currencyCode,
          updatedBy: this.user,
          updatedDate: getISODateTime(),
        },
      });
    });
  }

  async updateWithReceipts(
    id: number,
    expense: ExpenseInputDto,
    receipts: ReceiptInputDto[]
  ): Promise<EntitySavedResponseDto> {
    if (expense.currencyId === 0) expense.currencyId = null;
    await prisma.$transaction(
      async (transaction) => {
        const { baseCurrencyAmount, company } =
          await calculateBaseCurrencyAmount(transaction, expense);

        await prisma.expense.update({
          where: {
            id: id,
            isActive: true,
          },
          data: {
            ...expense,
            baseCurrencyAmount: baseCurrencyAmount,
            baseCurrencyCode: company?.BaseCurrency.currencyCode,
            updatedBy: this.user,
            updatedDate: getISODateTime(),
          },
        });

        for (let index = 0; index < receipts.length; index++) {
          const receipt = receipts[index];

          const uuid = uuidv4();
          receipt.filePath = uuid;

          const s3Service = new S3FileService(this.user);

          const fileUploadResponse = await s3Service.upload(receipt);

          if (fileUploadResponse == HttpStatus.OK) {
            await transaction.receiptInfo.create({
              data: {
                fileName: receipt.fileName,
                filePath: receipt.filePath!,
                fileExtension: receipt.fileExtension,
                expenseId: id,
                isActive: true,
                createdBy: this.user,
              },
            });
          } else {
            throw new Error(`File upload failed`);
          }
        }
      },
      {
        timeout: +process!.env!.TRANSACTION_TIMEOUT!
          ? +process!.env!.TRANSACTION_TIMEOUT!
          : 5000,
      }
    );

    return new EntitySavedResponseDto(id);
  }
  async getAll({
    page,
    perPage,
    orderBy,
    orderDirection,
    accountId,
  }: ExpensePaginationDto): Promise<PaginatedResponseDto<ExpenseOutputDto>> {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: ExpenseOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';
    const results: ExpenseOutputDto[] = [];

    const query: Prisma.ExpenseFindManyArgs = {
      where: {
        isActive: true,
        accountId: +accountId,
      },
    };

    const [data, count] = await prisma.$transaction([
      prisma.expense.findMany({
        where: query.where,
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
      }),
      prisma.expense.count({ where: query.where }),
    ]);

    for (let index = 0; index < data.length; index++) {
      const expenseLine = data[index];

      const receiptCount = await prisma.receiptInfo.aggregate({
        where: { expenseId: expenseLine.id, isActive: true },
        _count: { id: true },
      });

      results.push(
        ExpenseOutputDto.fromEntity(
          expenseLine,
          expenseLine.Currency,
          expenseLine.Department!,
          expenseLine.ExpenseCategory!,
          expenseLine.Tax!,
          receiptCount ? receiptCount._count.id : 0,
          expenseLine.BudgetedCurrency
        )
      );
    }

    return {
      data: results,
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<ExpenseOutputDto> {
    const expense = await prisma.expense.findFirstOrThrow({
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
    return ExpenseOutputDto.fromEntity(
      expense,
      expense.Currency,
      expense.Department!,
      expense.ExpenseCategory!,
      expense.Tax!,
      0,
      expense.BudgetedCurrency
    );
  }
}
async function calculateBaseCurrencyAmount(
  transaction: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  expense: ExpenseInputDto
) {
  const productInfo = await transaction.account.findFirst({
    where: { id: expense.accountId },
    select: {
      productId: true,
    },
  });

  const product = await transaction.product.findFirst({
    where: { id: productInfo?.productId },
    select: { companyId: true },
  });

  const includeBaseCurrency = Prisma.validator<Prisma.CompanyInclude>()({
    BaseCurrency: true,
  });

  const company = await transaction.company.findFirst({
    where: { id: product?.companyId },
    include: includeBaseCurrency,
  });

  let baseCurrencyAmount = new Prisma.Decimal(0.0);

  if (expense?.currencyId != company?.baseCurrencyId) {
    let currencyRate = 1;
    if (expense?.currencyId) {
      const expenseCurrency = await transaction.currency.findFirst({
        where: { id: expense?.currencyId },
      });

      currencyRate = expenseCurrency?.currencyRate ?? 1;
    }

    baseCurrencyAmount = new Prisma.Decimal(
      (expense.amount ?? 0) * currencyRate
    );

    baseCurrencyAmount = new Prisma.Decimal(
      baseCurrencyAmount.toNumber() / (company?.BaseCurrency?.currencyRate ?? 1)
    );
  } else {
    baseCurrencyAmount = new Prisma.Decimal((expense.amount ?? 0) * 1);
  }
  return { baseCurrencyAmount, company };
}
