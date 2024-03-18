import prisma from '~/prisma/client';
import { type ServiceBase } from './base/service-interface';
import {
  type Currency,
  type Department,
  Prisma,
  type Product,
  CostType,
  type Tax,
  PrismaClient,
  ExpenseStatus,
} from '@prisma/client';

import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import getISODateTime from '~/utils/get-iso-date-time';
import getSkipTake from '~/utils/get-skip-take';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';

import BudgetOutputDto from '../dtos/budget/budget-output.dto';
import type BudgetPaginationDto from '../dtos/budget/budget-pagination.dto';
import type BudgetInputDto from '../dtos/budget/budget-input.dto';
import { type BudgetOrderBy } from '../dtos/budget/budget-order-by.dto';
import AccountBudgetOutputDto from '../dtos/account-budget/account-budget-output.dto';
import type ProductBudgetInputDto from '../dtos/product-budget/product-budget-input.dto';
import type AccountBudgetInputDto from '../dtos/account-budget/account-budget-input.dto';
import { type DefaultArgs } from '@prisma/client/runtime/library';

export default class BudgetService
  implements ServiceBase<BudgetInputDto, BudgetOutputDto, BudgetPaginationDto>
{
  constructor(private user: string) {}

  async delete(id: number): Promise<void> {
    await prisma.budget.update({
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

  async create(budget: BudgetInputDto): Promise<EntitySavedResponseDto> {
    const response = await prisma.budget.create({
      data: {
        ...budget,
        isActive: true,
        version: 1,
        createdBy: this.user,
      },
    });
    return new EntitySavedResponseDto(response.id);
  }

  async update(id: number, budget: BudgetInputDto): Promise<void> {
    await prisma.budget.update({
      where: {
        id: id,
        isActive: true,
      },
      data: {
        ...budget,
        updatedBy: this.user,
        updatedDate: getISODateTime(),
      },
    });
  }

  async getAll({
    page,
    perPage,
    searchQuery,
    orderBy,
    orderDirection,
  }: BudgetPaginationDto): Promise<PaginatedResponseDto<BudgetOutputDto>> {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: BudgetOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const query: Prisma.BudgetFindManyArgs = {
      where: {
        isActive: true,
        OR: [{ expenseTitle: { contains: searchQuery, mode: 'insensitive' } }],
      },
    };

    const [data, count] = await prisma.$transaction([
      prisma.budget.findMany({
        where: query.where,
        include: {
          Tax: true,
          Currency: true,
          Department: true,
          Product: true,
          Costs: true,
          ExpenseCategory: true,
          SalesTaxGroup: true,
        },
        skip: skip,
        take: take,
        orderBy: {
          [orderByValue]: direction,
        },
      }),
      prisma.budget.count({ where: query.where }),
    ]);
    const budgetList: BudgetOutputDto[] = [];
    const budgetIds: number[] = [];

    data.forEach((b) => budgetIds.push(b.id));

    const leaderCostsList = await prisma.cost.groupBy({
      by: ['budgetId'],
      where: {
        budgetId: { in: budgetIds },
        isActive: true,
        costType: CostType.LEADER,
      },
      _sum: { costAmount: true },
      _count: { id: true },
    });
    const passengerCostsList = await prisma.cost.groupBy({
      by: ['budgetId'],
      where: {
        budgetId: { in: budgetIds },
        isActive: true,
        costType: CostType.LEADER,
      },
      _sum: { costAmount: true },
      _count: { id: true },
    });

    for (let index = 0; index < data.length; index++) {
      const budget = data[index];

      let leaderCount: number = 0;
      let leaderCostAmount = new Prisma.Decimal(0);

      let passengerCount: number = 0;
      let passengerCostAmount = new Prisma.Decimal(0);

      if (leaderCostsList) {
        const leaderCost = leaderCostsList.find(
          (c) => c.budgetId === budget.id
        );

        if (leaderCost) {
          leaderCount = leaderCost._count.id;
          if (leaderCost._sum.costAmount)
            leaderCostAmount = leaderCost._sum.costAmount;
        }
      }

      if (passengerCostsList) {
        const passengerCost = passengerCostsList.find(
          (c) => c.budgetId === budget.id
        );
        if (passengerCost) {
          passengerCount = passengerCost._count.id;
          if (passengerCost._sum.costAmount)
            passengerCostAmount = passengerCost._sum.costAmount;
        }
      }

      budgetList.push(
        BudgetOutputDto.fromEntity(
          budget,
          budget.Currency as Currency,
          budget.Tax as Tax,
          budget.Department as Department,
          budget.Product as Product,
          passengerCount,
          leaderCount,
          Prisma.Decimal.add(leaderCostAmount, passengerCostAmount),
          budget.ExpenseCategory,
          budget.SalesTaxGroup!
        )
      );
    }

    return await {
      data: budgetList,
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<BudgetOutputDto> {
    const budget = await prisma.budget.findFirstOrThrow({
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

    const leaderCosts = await prisma.cost.aggregate({
      where: {
        budgetId: budget.id,
        isActive: true,
        costType: CostType.LEADER,
      },
      _sum: { costAmount: true },
      _count: { id: true },
    });
    const passengerCosts = await prisma.cost.aggregate({
      where: {
        budgetId: budget.id,
        isActive: true,
        costType: CostType.LEADER,
      },
      _sum: { costAmount: true },
      _count: { id: true },
    });

    return BudgetOutputDto.fromEntity(
      budget,
      budget.Currency as Currency,
      budget.Tax as Tax,
      budget.Department as Department,
      budget.Product as Product,
      passengerCosts ? passengerCosts._count.id : 0,
      leaderCosts ? leaderCosts._count.id : 0,
      Prisma.Decimal.add(
        leaderCosts ? leaderCosts._sum!.costAmount! : new Prisma.Decimal(0),
        passengerCosts
          ? passengerCosts._sum!.costAmount!
          : new Prisma.Decimal(0)
      ),
      budget.ExpenseCategory,
      budget.SalesTaxGroup!
    );
  }

  async getByProductId(
    productId: number,
    {
      page,
      perPage,
      orderBy,
      orderDirection,
      searchQuery,
    }: ProductBudgetInputDto
  ): Promise<PaginatedResponseDto<BudgetOutputDto>> {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: BudgetOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const query: Prisma.BudgetFindManyArgs = {
      where: {
        isActive: true,

        OR: [
          {
            expenseTitle: { contains: searchQuery, mode: 'insensitive' },
            productId: +productId,
          },
        ],
      },
    };

    const [data, count] = await prisma.$transaction([
      prisma.budget.findMany({
        where: query.where, //{ productId: productId, isActive: true },
        include: {
          Currency: true,
          Department: true,
          Tax: true,
          Product: true,
          ExpenseCategory: true,
          SalesTaxGroup: true,
        },
        skip: skip,
        take: +take,
        orderBy: {
          [orderByValue]: direction,
        },
      }),
      prisma.budget.count({ where: query.where }),
    ]);

    const budgetList: BudgetOutputDto[] = [];
    const budgetIds: number[] = [];

    data.forEach((b) => budgetIds.push(b.id));

    const leaderCostsList = await prisma.cost.groupBy({
      by: ['budgetId'],
      where: {
        budgetId: { in: budgetIds },
        isActive: true,
        costType: CostType.LEADER,
      },
      _sum: { costAmount: true },
      _count: { id: true },
    });
    const passengerCostsList = await prisma.cost.groupBy({
      by: ['budgetId'],
      where: {
        budgetId: { in: budgetIds },
        isActive: true,
        costType: CostType.LEADER,
      },
      _sum: { costAmount: true },
      _count: { id: true },
    });

    for (let index = 0; index < data.length; index++) {
      const budget = data[index];

      let leaderCount: number = 0;
      let leaderCostAmount = new Prisma.Decimal(0);

      let passengerCount: number = 0;
      let passengerCostAmount = new Prisma.Decimal(0);

      if (leaderCostsList) {
        const leaderCost = leaderCostsList.find(
          (c) => c.budgetId === budget.id
        );

        if (leaderCost) {
          leaderCount = leaderCost._count.id;
          if (leaderCost._sum.costAmount)
            leaderCostAmount = leaderCost._sum.costAmount;
        }
      }

      if (passengerCostsList) {
        const passengerCost = passengerCostsList.find(
          (c) => c.budgetId === budget.id
        );
        if (passengerCost) {
          passengerCount = passengerCost._count.id;
          if (passengerCost._sum.costAmount)
            passengerCostAmount = passengerCost._sum.costAmount;
        }
      }

      budgetList.push(
        BudgetOutputDto.fromEntity(
          budget,
          budget.Currency as Currency,
          budget.Tax as Tax,
          budget.Department as Department,
          budget.Product as Product,
          passengerCount,
          leaderCount,
          Prisma.Decimal.add(leaderCostAmount, passengerCostAmount),
          budget.ExpenseCategory,
          budget.SalesTaxGroup!
        )
      );
    }

    return {
      data: budgetList,
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getByAccountId({
    accountId,
    page,
    perPage,
  }: AccountBudgetInputDto): Promise<
    PaginatedResponseDto<AccountBudgetOutputDto>
  > {
    const budgetDetails: AccountBudgetOutputDto[] = [];
    const { take } = getSkipTake(perPage, page);

    const [data, count] = await prisma.$transaction([
      prisma.expense.findMany({
        where: { accountId: +accountId, isActive: true },
        include: {
          Currency: true,
          Department: true,
          ExpenseCategory: true,
          Tax: true,
          BudgetedCurrency: true,
        },
      }),
      prisma.expense.count({
        where: { accountId: +accountId, isActive: true },
      }),
    ]);

    const expenseIds: number[] = [];

    data.map((expense) => expenseIds.push(expense.id));

    const receiptCounts = await prisma.receiptInfo.groupBy({
      by: ['expenseId'],
      where: { expenseId: { in: expenseIds }, isActive: true },
      _count: { id: true },
    });

    data.forEach((element) => {
      if (element.status == ExpenseStatus.DRAFT) {
        element.amount = new Prisma.Decimal(0.0);
        element.baseCurrencyAmount = new Prisma.Decimal(0.0);
      }

      let receiptcount: number = 0;
      if (receiptCounts) {
        const counts = receiptCounts.find((r) => r.expenseId == element.id);
        if (counts) receiptcount = counts?._count.id;
      }

      budgetDetails.push(
        AccountBudgetOutputDto.fromEntity(
          element,
          element.Currency!,
          element.Department!,
          element.ExpenseCategory!,
          element.Tax!,
          element.BudgetedCurrency!,
          receiptcount
        )
      );
    });

    return {
      data: budgetDetails,
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    obj: BudgetInputDto,
    id?: number
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
