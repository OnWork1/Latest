import prisma from '~/prisma/client';
import { type ServiceBase } from './base/service-interface';
import getISODateTime from '~/utils/get-iso-date-time';
import getSkipTake from '~/utils/get-skip-take';
import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import { Prisma, PrismaClient, type Tax } from '@prisma/client';
import type TaxInputDto from '../dtos/tax/tax-input.dto';
import TaxOutputDto from '../dtos/tax/tax-output.dto';
import type TaxPaginationDto from '../dtos/tax/tax-pagination.dto';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import { type TaxOrderBy } from '../dtos/tax/tax-order-by.dto';
import { type DefaultArgs } from '@prisma/client/runtime/library';

export default class TaxService
  implements ServiceBase<TaxInputDto, TaxOutputDto, TaxPaginationDto>
{
  constructor(private user: string) {}
  async checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    obj: TaxInputDto,
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
    const existing = await tran.tax.findFirst({
      where: {
        taxCode: obj.taxCode.trim(),
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

  async create(tax: TaxInputDto): Promise<EntitySavedResponseDto> {
    const response = await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, tax);
      return await tran.tax.create({
        data: {
          ...tax,
          createdBy: this.user,
        },
      });
    });
    return new EntitySavedResponseDto(response.id);
  }

  async update(id: number, tax: TaxInputDto): Promise<void> {
    await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, tax, id);
      await tran.tax.update({
        where: {
          id: id,
          isActive: true,
        },
        data: {
          ...tax,
          updatedBy: this.user,
          updatedDate: getISODateTime(),
        },
      });
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.tax.update({
      where: { id: id, isActive: true },
      data: {
        isActive: false,
        deletedBy: this.user,
        deletedDate: getISODateTime(),
      },
    });
  }

  async getAll({
    page,
    perPage,
    searchQuery,
    orderBy,
    orderDirection,
  }: TaxPaginationDto): Promise<PaginatedResponseDto<TaxOutputDto>> {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: TaxOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const query: Prisma.TaxWhereInput = {
      isActive: true,
      taxCode: { contains: searchQuery, mode: 'insensitive' },
    };

    const [data, count] = await prisma.$transaction([
      prisma.tax.findMany({
        where: query,
        skip: skip,
        take: take,
        orderBy: {
          [orderByValue]: direction,
        },
      }),
      prisma.tax.count({ where: query }),
    ]);

    return {
      data: TaxOutputDto.fromEntityArray(data),
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<TaxOutputDto | null> {
    const tax = await prisma.tax.findFirstOrThrow({
      where: { id: id, isActive: true },
    });
    return TaxOutputDto.fromEntity(tax);
  }

  async getByCode(taxCode: string): Promise<TaxOutputDto | null> {
    const tax = await prisma.tax.findFirst({
      where: { taxCode: taxCode, isActive: true },
    });
    return TaxOutputDto.fromEntity(tax);
  }
}
