import { type ServiceBase } from './base/service-interface';
import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import getISODateTime from '~/utils/get-iso-date-time';
import getSkipTake from '~/utils/get-skip-take';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import {
  AccountStatus,
  CostType,
  Prisma,
  type User,
  ExpenseStatus,
  PrismaClient,
  ExpenseTransactionType,
  ExpenseType,
} from '@prisma/client';
import type AccountInputDto from '../dtos/account/account-input.dto';
import AccountOutputDto from '../dtos/account/account-output.dto';
import type AccountPaginationDto from '../dtos/account/account-pagination.dto';
import { type AccountOrderBy } from '../dtos/account/account-order-by.dto';

import prisma from '~/prisma/client';
import type ExpenseInputDto from '../dtos/expense/expense-input.dto';
import { type DefaultArgs } from '@prisma/client/runtime/library';
import { AppRole } from '~/enums/app-role';

export default class AccountService
  implements
    ServiceBase<AccountInputDto, AccountOutputDto, AccountPaginationDto>
{
  constructor(
    private user: string,
    private roles?: string[]
  ) {}

  async delete(id: number): Promise<void> {
    await prisma.account.update({
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

  async create(account: AccountInputDto): Promise<EntitySavedResponseDto> {
    //All accounts created must be saved as DRAFT : https://peakadventuretravel.atlassian.net/browse/LAA-34
    account.accountStatus = AccountStatus.DRAFT;

    //check if the lederid is set. This will be 0 or not set when leader app is initiating the account
    //When the leader is initiating the account then the leader owns the account.
    //Else the Ops Manager or Finance Manager will set the leader from admin panel
    if (
      (account.leaderUserId && account.leaderUserId <= 0) ||
      account.leaderUserId === undefined
    ) {
      const leader = await prisma.user.findFirst({
        where: {
          userAccount: { equals: this.user, mode: 'insensitive' },
          isActive: true,
        },
      });

      if (leader) {
        account.leaderUserId = leader.id;
      }
    }

    const { response } = await prisma.$transaction(
      async (transaction) => {
        await this.checkUniquenessAndThrow(transaction, account);

        const createdAccount = await transaction.account.create({
          data: {
            ...account,
            isActive: true,
            createdBy: this.user,
          },
        });

        const budgets = await transaction.budget.findMany({
          where: { productId: account.productId, isActive: true },
        });

        for (let index = 0; index < budgets.length; index++) {
          const budget = budgets[index];

          const expenseDate = new Date(account.departureDate!);
          //LAA-145 fix
          expenseDate.setDate(expenseDate.getDate() + +budget!.dayNumber! - 1);

          let amount: Prisma.Decimal = new Prisma.Decimal(0.0);
          let baseCurrencyAmount: Prisma.Decimal = new Prisma.Decimal(0.0);
          let budgetedLeaderCost: Prisma.Decimal = new Prisma.Decimal(0.0);
          let budgetedPassengerCost: Prisma.Decimal = new Prisma.Decimal(0.0);
          let budgetedBaseCurrencyLeaderCost: Prisma.Decimal =
            new Prisma.Decimal(0.0);
          let budgetedBaseCurrencyPassengerCost: Prisma.Decimal =
            new Prisma.Decimal(0.0);
          let baseCurrencyCode: string | null = '';

          //ignore id column since it will be auto populated
          const expense: ExpenseInputDto = {
            expenseTitle: budget.expenseTitle,
            noOfPassengers: account.noOfPassengers,
            noOfLeaders: account.noOfLeaders,
            expenseCategoryId: budget.expenseCategoryId,
            paymentType: budget.paymentType!,
            departmentId: budget.departmentId!,
            status: ExpenseStatus.DRAFT,
            accountId: createdAccount.id,
            taxId: budget.taxId!,
            expenseDate: expenseDate.toISOString(),
            currencyId: budget.currencyId!,
            salesTaxGroupId: budget.salesTaxGroupId!,
          };

          const costs = await transaction.cost.findMany({
            where: { budgetId: budget.id, isActive: true },
          });

          for (let idx = 0; idx < costs.length; idx++) {
            const cost = costs[idx];

            if (
              account.noOfLeaders == cost.sequence &&
              cost.costType == CostType.LEADER
            ) {
              budgetedLeaderCost = cost.costAmount ?? new Prisma.Decimal(0);
              budgetedBaseCurrencyLeaderCost =
                cost.baseCurrencyAmount ?? new Prisma.Decimal(0);
              amount = Prisma.Decimal.add(budgetedLeaderCost, amount);
              baseCurrencyAmount = Prisma.Decimal.add(
                budgetedBaseCurrencyLeaderCost,
                baseCurrencyAmount
              );
            }

            if (
              account.noOfPassengers == cost.sequence &&
              cost.costType == CostType.PERSON
            ) {
              budgetedPassengerCost = cost.costAmount ?? new Prisma.Decimal(0);
              budgetedBaseCurrencyPassengerCost =
                cost.baseCurrencyAmount ?? new Prisma.Decimal(0);
              amount = Prisma.Decimal.add(budgetedPassengerCost, amount);
              baseCurrencyAmount = Prisma.Decimal.add(
                budgetedPassengerCost,
                baseCurrencyAmount
              );
            }

            baseCurrencyCode = cost.baseCurrencyCode;
          }

          const newExpenseLine = await transaction.expense.create({
            data: {
              ...expense,
              isActive: true,
              expenseTransactionType: ExpenseTransactionType.AUTO,
              createdBy: this.user,
              budgetedCurrencyId: budget.currencyId,
              amount,
              budgetedPassengerCost,
              budgetedLeaderCost,
              budgetedBaseCurrencyLeaderCost,
              budgetedBaseCurrencyPassengerCost,
              baseCurrencyCode,
              baseCurrencyAmount,
            },
          });

          console.debug('created expense line ' + newExpenseLine.id);
        }

        return { response: createdAccount };
      },
      {
        timeout: +process!.env!.TRANSACTION_TIMEOUT!
          ? +process!.env!.TRANSACTION_TIMEOUT!
          : 5000,
      }
    );

    return new EntitySavedResponseDto(response.id);
  }

  async update(id: number, account: AccountInputDto): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      await this.checkUniquenessAndThrow(transaction, account, id);

      if (account.accountStatus !== AccountStatus.DRAFT) {
        const expenseSummary = await transaction.expense.aggregate({
          where: { accountId: id, isActive: true },
          _sum: {
            baseCurrencyAmount: true,
            budgetedBaseCurrencyLeaderCost: true,
            budgetedBaseCurrencyPassengerCost: true,
          },
        });

        if (expenseSummary) {
          const expenses =
            expenseSummary._sum.baseCurrencyAmount?.toNumber() ?? 0;
          const budget = Prisma.Decimal.add(
            expenseSummary._sum.budgetedBaseCurrencyLeaderCost ?? 0,
            expenseSummary._sum.budgetedBaseCurrencyPassengerCost ?? 0
          ).toNumber();

          if (expenses <= budget) {
            account.accountStatus = AccountStatus.APPROVED; // Should allow only to update status when its not in draft mode
          }
        }

        await transaction.account.update({
          where: {
            id: id,
            isActive: true,
          },
          data: {
            accountStatus: account.accountStatus,
            updatedBy: this.user,
            updatedDate: getISODateTime(),
          },
        });
      } else {
        await transaction.account.update({
          where: {
            id: id,
            isActive: true,
          },
          data: {
            ...account,
            updatedBy: this.user,
            updatedDate: getISODateTime(),
          },
        });
      }
    });
  }

  async getAll({
    page,
    perPage,
    searchQuery,
    orderBy,
    orderDirection,
  }: AccountPaginationDto): Promise<PaginatedResponseDto<AccountOutputDto>> {
    const { skip, take } = getSkipTake(perPage, page);
    let orderByValue: AccountOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';
    const whereClause: Prisma.AccountWhereInput = {};

    const leader = (await prisma.user.findFirst({
      where: {
        userAccount: { equals: this.user, mode: 'insensitive' },
        isActive: true,
      },
    })) as unknown as User;

    if (!leader)
      throw new Prisma.PrismaClientKnownRequestError('User Not found', {
        code: 'X404',
        clientVersion: '',
      });

    if (
      this.roles?.includes(AppRole.OperationsManager) ||
      this.roles?.includes(AppRole.FinanceManager) ||
      this.roles?.includes(AppRole.Admin)
    ) {
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
          leaderUserId: leader ? leader.id : 0,
        },
        {
          createdBy: leader.userAccount,
        },
      ];
    } else if (this.roles?.includes(AppRole.Leader)) {
      if (leader) {
        whereClause.accountStatus = {
          in: [
            AccountStatus.DRAFT,
            AccountStatus.REJECTED,
            AccountStatus.SUBMITTED,
            AccountStatus.APPROVED,
          ],
        };
        whereClause.leaderUserId = leader.id;
        orderByValue = 'updatedDate';
        orderDirection = 'desc';
      } else {
        throw new Prisma.PrismaClientKnownRequestError('Leader Not found', {
          code: 'X404',
          clientVersion: '',
        });
      }
    }

    //Below condition has been added to filter accounts based on user's company - LAA-30
    //Commented out below check based on the discussion we had. - LAA-224
    // if (!this.roles?.includes(AppRole.Admin))
    //   whereClause.Product = { companyId: leader.companyId };

    whereClause.isActive = true;
    whereClause.tripCode = { contains: searchQuery, mode: 'insensitive' };

    const includesProductAndLeader = Prisma.validator<Prisma.AccountInclude>()({
      Product: true,
      Leader: true,
    });

    const { data, count } = await prisma.$transaction(
      async (tran) => {
        const data = await tran.account.findMany({
          where: whereClause,
          include: includesProductAndLeader,
          skip: skip,
          take: take,
          orderBy: {
            [orderByValue]: direction,
          },
        });

        const count = await tran.account.count({ where: whereClause });

        return { data: data, count: count };
      },
      {
        timeout: +process!.env!.TRANSACTION_TIMEOUT!
          ? +process!.env!.TRANSACTION_TIMEOUT!
          : 5000,
      }
    );

    const accountsList: AccountOutputDto[] = [];

    const accountIds: number[] = [];

    data.forEach((account) => accountIds.push(account.id));

    const budgets = await prisma.expense.groupBy({
      by: ['accountId'],
      where: {
        accountId: {
          in: accountIds,
        },
      },
      _sum: {
        budgetedBaseCurrencyLeaderCost: true,
        budgetedBaseCurrencyPassengerCost: true,
      },
    });

    //LAA-92
    const expenses = await prisma.expense.groupBy({
      by: ['accountId'],
      where: {
        accountId: {
          in: accountIds,
        },
        status: ExpenseStatus.CONFIRMED,
        expenseType: ExpenseType.EXPENSE,
      },
      _sum: {
        baseCurrencyAmount: true,
      },
    });

    const companyIds: number[] = [];

    data.forEach((account) => companyIds.push(account.Product.companyId));

    const baseCurrencies = await prisma.company.findMany({
      where: { id: { in: companyIds }, isActive: true },
      include: {
        BaseCurrency: true,
      },
    });

    for (let index = 0; index < data.length; index++) {
      const account = data[index];
      let totalBudget: Prisma.Decimal = new Prisma.Decimal(0.0);
      let totalExpenses: Prisma.Decimal = new Prisma.Decimal(0.0);

      //assumption. there will be only one account budget per account
      const budget = budgets.find((b) => b.accountId === account.id);

      const expenses_actuals = expenses.find((e) => e.accountId === account.id);

      const baseCurrency = baseCurrencies.find(
        (c) => c.id === account.Product.companyId
      );

      if (budget) {
        account.noOfLeaders = account.noOfLeaders!;
        account.noOfPassengers = account.noOfPassengers!;
        totalBudget = Prisma.Decimal.add(
          budget._sum?.budgetedBaseCurrencyLeaderCost
            ? budget._sum.budgetedBaseCurrencyLeaderCost
            : new Prisma.Decimal(0.0),
          budget._sum?.budgetedBaseCurrencyPassengerCost
            ? budget._sum.budgetedBaseCurrencyPassengerCost
            : new Prisma.Decimal(0.0)
        );

        if (expenses_actuals)
          totalExpenses = expenses_actuals._sum.baseCurrencyAmount
            ? expenses_actuals._sum.baseCurrencyAmount
            : new Prisma.Decimal(0.0);
      }

      accountsList.push(
        AccountOutputDto.fromEntity(
          account,
          account.Product,
          totalBudget,
          totalExpenses,
          account.Leader,
          baseCurrency ? baseCurrency.BaseCurrency : null
        )
      );
    }

    return {
      data: accountsList,
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<AccountOutputDto> {
    const account = await prisma.account.findFirstOrThrow({
      where: { id: id, isActive: true },
      include: { Product: true, Leader: true },
    });

    const baseCurrency = await prisma.company.findFirst({
      where: { id: account.Product.companyId },
      include: {
        BaseCurrency: true,
      },
    });

    const expenses = await prisma.expense.aggregate({
      where: { accountId: id },
      _sum: {
        budgetedBaseCurrencyLeaderCost: true,
        budgetedBaseCurrencyPassengerCost: true,
        // baseCurrencyAmount: true,
      },
    });

    //LAA-92
    const expenses_actuals = await prisma.expense.aggregate({
      where: {
        accountId: id,
        status: ExpenseStatus.CONFIRMED,
        expenseType: ExpenseType.EXPENSE,
        isActive: true,
      },
      _sum: {
        baseCurrencyAmount: true,
      },
    });

    let totalBudget: Prisma.Decimal = new Prisma.Decimal(0.0);
    let totalExpenses: Prisma.Decimal = new Prisma.Decimal(0.0);

    if (expenses) {
      // account.noOfLeaders = account.noOfLeaders!;
      // account.noOfPassengers = account.noOfPassengers!;
      totalBudget = Prisma.Decimal.add(
        expenses._sum.budgetedBaseCurrencyLeaderCost ?? 0,
        expenses._sum.budgetedBaseCurrencyPassengerCost ?? 0
      );
      totalExpenses = expenses_actuals._sum.baseCurrencyAmount!;
    }

    return AccountOutputDto.fromEntity(
      account,
      account.Product,
      totalBudget,
      totalExpenses,
      account.Leader!,
      baseCurrency ? baseCurrency.BaseCurrency : null
    );
  }

  async checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    obj: AccountInputDto,
    id?: number
  ): Promise<void> {
    let idCheck = {};

    if (id) {
      idCheck = {
        id: {
          not: id,
        },
      };
    }

    const existing = await tran.account.findFirst({
      where: {
        tripCode: obj.tripCode.trim(),
        isActive: true,
        ...idCheck,
      },
      select: { id: true },
    });

    if (existing) {
      throw new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        clientVersion: '',
      });
    }
  }
}
