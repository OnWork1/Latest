import prisma from '~/prisma/client';
import { type ServiceBase } from './base/service-interface';
import getISODateTime from '~/utils/get-iso-date-time';
import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import { type Currency, Prisma, PrismaClient } from '@prisma/client';
import getSkipTake from '~/utils/get-skip-take';
import type CurrencyInputDto from '../dtos/currency/currency-input.dto';
import CurrencyOutputDto from '../dtos/currency/currency-output.dto';
import type CurrencyPaginationDto from '../dtos/currency/currency-pagination.dto';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import { type CurrencyOrderBy } from '../dtos/currency/currency-order-by.dto';
import { type DefaultArgs } from '@prisma/client/runtime/library';

export default class CurrencyService
  implements
    ServiceBase<CurrencyInputDto, CurrencyOutputDto, CurrencyPaginationDto>
{
  constructor(private user: string) {}
  async checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    obj: CurrencyInputDto,
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
    const existing = await tran.currency.findFirst({
      where: {
        currencyCode: obj.currencyCode.trim(),
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

  async create(currency: CurrencyInputDto): Promise<EntitySavedResponseDto> {
    const response = await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, currency);
      return await tran.currency.create({
        data: {
          ...currency,
          createdBy: this.user,
        },
      });
    });
    return new EntitySavedResponseDto(response.id);
  }

  async update(id: number, currency: CurrencyInputDto): Promise<void> {
    await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, currency, id);
      await tran.currency.update({
        where: {
          id: id,
          isActive: true,
        },
        data: {
          ...currency,
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
  }: CurrencyPaginationDto): Promise<PaginatedResponseDto<CurrencyOutputDto>> {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: CurrencyOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const query: Prisma.CurrencyWhereInput = {
      isActive: true,
      OR: [
        { currencyCode: { contains: searchQuery, mode: 'insensitive' } },
        { currencyName: { contains: searchQuery, mode: 'insensitive' } },
      ],
    };

    const [data, count] = await prisma.$transaction([
      prisma.currency.findMany({
        where: query,
        skip: skip,
        take: take,
        orderBy: {
          [orderByValue]: direction,
        },
      }),
      prisma.currency.count({ where: query }),
    ]);

    return {
      data: CurrencyOutputDto.fromEntityArray(data),
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<CurrencyOutputDto | null> {
    const currency = (await prisma.currency.findFirstOrThrow({
      where: { id: id, isActive: true },
    })) as Currency;
    return CurrencyOutputDto.fromEntity(currency);
  }

  async getByCode(currencyCode: string): Promise<Currency | null> {
    const currency = await prisma.currency.findFirst({
      where: {
        currencyCode: { equals: currencyCode, mode: 'insensitive' },
        isActive: true,
      },
    });

    return currency;
  }

  async delete(id: number): Promise<void> {
    await prisma.currency.update({
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
}
