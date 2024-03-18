import prisma from '~/prisma/client';
import type CashDetail from '../dtos/cash/cash-detail-output.dto';
import {
  AccountStatus,
  ExpenseStatus,
  ExpenseType,
  PaymentType,
  Prisma,
} from '@prisma/client';

export default class CashService {
  constructor(private user: string) {}

  async getBalance(): Promise<CashDetail[]> {
    const result: CashDetail[] = [];
    await prisma.$transaction(async (tran) => {
      const leaderId = await tran.user.findFirst({
        where: {
          userAccount: this.user,
        },
        select: {
          id: true,
        },
      });

      if (!leaderId) {
        throw new Prisma.PrismaClientKnownRequestError('User Not found', {
          code: 'X404',
          clientVersion: '',
        });
      }

      const currencies = await tran.currency.findMany({
        where: { isActive: true },
      });

      //All expense lines (copied from budget & manual entries)
      let currencyWhereClause = Prisma.validator<Prisma.ExpenseWhereInput>()({
        isActive: true,
        Account: {
          leaderUserId: leaderId.id,
          isActive: true,
          accountStatus: {
            notIn: [AccountStatus.APPROVED],
          },
        },
      });

      const allLeaderCurrencies = await tran.expense.groupBy({
        by: ['currencyId'],
        where: currencyWhereClause,
      });

      //Actual expenses which are confirmed
      let whereClause = Prisma.validator<Prisma.ExpenseWhereInput>()({
        isActive: true,
        status: ExpenseStatus.CONFIRMED,
        paymentType: PaymentType.CASH,
        expenseType: ExpenseType.EXPENSE,
        Account: {
          leaderUserId: leaderId.id,
          isActive: true,
          accountStatus: {
            notIn: [AccountStatus.APPROVED],
          },
        },
      });

      const expenses = await tran.expense.groupBy({
        by: ['currencyId'],
        where: whereClause,

        _sum: {
          amount: true,
        },
      });

      //Wthdrawals
      const withdrawalsWhereClause =
        Prisma.validator<Prisma.ExpenseWhereInput>()({
          isActive: true,
          status: ExpenseStatus.CONFIRMED,
          expenseType: ExpenseType.WITHDRAWAL,
          //Payment type can be CASH or CARD for withdrawals: LAA-138
          //paymentType: PaymentType.CASH,
          Account: {
            leaderUserId: leaderId.id,
            isActive: true,
            accountStatus: {
              notIn: [AccountStatus.APPROVED],
            },
          },
        });

      const withdrawals = await tran.expense.groupBy({
        by: ['currencyId'],
        where: withdrawalsWhereClause,

        _sum: {
          amount: true,
        },
      });

      allLeaderCurrencies.forEach((leaderCurrency) => {
        const currency = currencies.find(
          (f) => f.id == leaderCurrency.currencyId
        );

        if (currency) {
          const cashDetail: CashDetail = {
            currencyCode: currency.currencyCode,
            availableBalance: new Prisma.Decimal(0),
          };

          const actualExpense = expenses.find(
            (f) => f.currencyId == leaderCurrency.currencyId
          );

          cashDetail.availableBalance = Prisma.Decimal.sub(
            cashDetail.availableBalance,
            actualExpense?._sum.amount ?? new Prisma.Decimal(0)
          );

          const withdrawal = withdrawals.find(
            (f) => f.currencyId == leaderCurrency.currencyId
          );

          cashDetail.availableBalance = Prisma.Decimal.add(
            cashDetail.availableBalance,
            withdrawal?._sum.amount ?? new Prisma.Decimal(0)
          );

          result.push(cashDetail);
        }
      });
    });

    return result;
  }
}
