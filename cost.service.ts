import prisma from '~/prisma/client';
import { type ServiceBase } from './base/service-interface';

import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import getISODateTime from '~/utils/get-iso-date-time';
import getSkipTake from '~/utils/get-skip-take';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import type CostInputDto from '../dtos/cost/cost-input.dto';
import CostOutputDto from '../dtos/cost/cost-output.dto';
import type CostPaginationDto from '../dtos/cost/cost-pagination.dto';
import { type CostOrderBy } from '../dtos/cost/cost-order-by.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import BudgetCostOutputDto from '../dtos/budget-cost/budget-cost-output.dto';
import { type DefaultArgs } from '@prisma/client/runtime/library';

export default class CostService
  implements ServiceBase<CostInputDto, CostOutputDto, CostPaginationDto>
{
  constructor(private user: string) {}

  async delete(id: number): Promise<void> {
    await prisma.$transaction(
      async (transaction) => {
        const costType = await transaction.cost.findFirst({
          where: {
            id: id,
            isActive: true,
          },
        });

        await transaction.cost.update({
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

        const otherEntries = await transaction.cost.findMany({
          where: {
            budgetId: costType?.budgetId,
            costType: costType?.costType,
            isActive: true,
          },
          orderBy: {
            sequence: 'asc',
          },
        });

        if (otherEntries) {
          for (let index = 0; index < otherEntries.length; index++) {
            const costEntry = otherEntries[index];
            await transaction.cost.update({
              where: {
                id: costEntry.id,
                isActive: true,
              },
              data: {
                sequence: index + 1,
                updatedBy: this.user,
                updatedDate: getISODateTime(),
              },
            });
          }
        }
      },
      {
        timeout: +process!.env!.TRANSACTION_TIMEOUT!
          ? +process!.env!.TRANSACTION_TIMEOUT!
          : 5000,
      }
    );
  }

  async create(cost: CostInputDto): Promise<EntitySavedResponseDto> {
    const { id } = await prisma.$transaction(async (transaction) => {
      const maxSequence = await transaction.cost.aggregate({
        _max: { sequence: true },
        where: {
          budgetId: cost.budgetId,
          costType: cost.costType,
          isActive: true,
        },
      });

      let nextSequence: number = 1;

      if (maxSequence && maxSequence._max && maxSequence._max.sequence)
        nextSequence = ++maxSequence._max.sequence;

      const { baseCurrencyAmount, baseCurrencyCode } =
        await this.getBaseCurrencyAmount(transaction, cost);

      const createResult = await transaction.cost.create({
        data: {
          ...cost,
          baseCurrencyAmount: baseCurrencyAmount,
          baseCurrencyCode: baseCurrencyCode,
          sequence: nextSequence,
          isActive: true,
          createdBy: this.user,
        },
      });

      return { id: createResult.id };
    });

    return new EntitySavedResponseDto(id);
  }

  async update(id: number, cost: CostInputDto): Promise<void> {
    await prisma.$transaction(async (tran) => {
      const { baseCurrencyAmount, baseCurrencyCode } =
        await this.getBaseCurrencyAmount(tran, cost);

      const exisitingRecord = await tran.cost.findFirst({
        where: {
          id: id,
        },
      });

      let nextSequence: number = 1;

      if (exisitingRecord?.costType == cost.costType) {
        nextSequence = exisitingRecord.sequence;
      } else {
        const maxSequence = await tran.cost.aggregate({
          _max: { sequence: true },
          where: {
            budgetId: cost.budgetId,
            costType: cost.costType,
            isActive: true,
            id: {
              not: id,
            },
          },
        });

        if (maxSequence && maxSequence._max && maxSequence._max.sequence)
          nextSequence = ++maxSequence._max.sequence;
      }

      await tran.cost.update({
        where: {
          id: id,
          isActive: true,
        },
        data: {
          ...cost,
          sequence: nextSequence,
          baseCurrencyAmount: baseCurrencyAmount,
          baseCurrencyCode: baseCurrencyCode,
          updatedBy: this.user,
          updatedDate: getISODateTime(),
        },
      });
    });
  }

  async getAll({
    page,
    perPage,
    searchQuery,
    orderBy,
    orderDirection,
  }: CostPaginationDto): Promise<PaginatedResponseDto<CostOutputDto>> {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: CostOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const searchIds: number[] = [];

    const searchQueryParams = searchQuery?.split(',');

    searchQueryParams?.forEach((element) => {
      const id = +element;
      searchIds.push(id);
    });

    const query: Prisma.CostFindManyArgs = {
      where: {
        isActive: true,
        // OR: [
        //   {
        //     budgetId: { in: searchIds },
        //   },
        // ],
      },
    };

    const [data, count] = await prisma.$transaction([
      prisma.cost.findMany({
        where: query.where,
        include: query.include,
        skip: skip,
        take: take,
        orderBy: {
          [orderByValue]: direction,
        },
      }),
      prisma.cost.count({ where: query.where }),
    ]);
    const costList: CostOutputDto[] = [];
    data.forEach(async (cost) => {
      costList.push(CostOutputDto.fromEntity(cost));
    });

    return {
      data: costList, //CostOutputDto.fromEntityArray(data),
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<CostOutputDto> {
    const cost = await prisma.cost.findFirstOrThrow({
      where: { id: id, isActive: true },
    });
    return CostOutputDto.fromEntity(cost);
  }

  async getByBudgetId(budgetId: number): Promise<BudgetCostOutputDto[]> {
    const cost = await prisma.cost.findMany({
      where: { budgetId: budgetId, isActive: true },
      orderBy: [{ costType: 'asc' }, { sequence: 'asc' }],
    });
    return BudgetCostOutputDto.fromEntityArray(cost);
  }

  private async getBaseCurrencyAmount(
    transaction: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    cost: CostInputDto
  ) {
    const productInfo = await transaction.budget.findFirst({
      where: { id: cost.budgetId },
      select: {
        productId: true,
        currencyId: true,
      },
    });

    const product = await transaction.product.findFirst({
      where: { id: productInfo?.productId },
    });

    const includeBaseCurrency = Prisma.validator<Prisma.CompanyInclude>()({
      BaseCurrency: true,
    });

    const company = await transaction.company.findFirst({
      where: { id: product?.companyId },
      include: includeBaseCurrency,
    });

    const budgetCurrency = await transaction.currency.findFirst({
      where: { id: productInfo?.currencyId ?? 0 },
    });

    let baseCurrencyAmount = new Prisma.Decimal(0.0);

    if (productInfo?.currencyId != company?.baseCurrencyId) {
      baseCurrencyAmount = new Prisma.Decimal(
        cost.costAmount * (budgetCurrency?.currencyRate ?? 1)
      );

      baseCurrencyAmount = new Prisma.Decimal(
        baseCurrencyAmount.toNumber() /
          (company?.BaseCurrency?.currencyRate ?? 1)
      );
    } else {
      baseCurrencyAmount = new Prisma.Decimal(cost.costAmount * 1);
    }
    return {
      baseCurrencyAmount: baseCurrencyAmount,
      baseCurrencyCode: company?.BaseCurrency.currencyCode,
    };
  }

  checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    obj: CostInputDto
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
