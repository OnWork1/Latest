import { PrismaClient, Prisma, type SalesTaxGroup } from '@prisma/client';
import { type DefaultArgs } from '@prisma/client/runtime/library';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import type SalesTaxGroupInputDto from '../dtos/sales-tax-group/sales-tax-group-input.dto';
import SalesTaxGroupOutputDto from '../dtos/sales-tax-group/sales-tax-group-output.dto';
import { type ServiceBase } from './base/service-interface';
import prisma from '~/prisma/client';
import getISODateTime from '~/utils/get-iso-date-time';
import type SalesTaxGroupPaginationDto from '../dtos/sales-tax-group/sales-tax-group-pagination.dto';
import getSkipTake from '~/utils/get-skip-take';
import { type SalesTaxGroupOrderBy } from '../dtos/sales-tax-group/sales-tax-group-order-by.dto';

export default class SalesTaxGroupService
  implements
    ServiceBase<
      SalesTaxGroupInputDto,
      SalesTaxGroupOutputDto,
      SalesTaxGroupPaginationDto
    >
{
  constructor(private user: string) {}

  async create(
    salesTaxGroup: SalesTaxGroupInputDto
  ): Promise<EntitySavedResponseDto> {
    const response = await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, salesTaxGroup);

      const newEntry = await tran.salesTaxGroup.create({
        data: {
          ...salesTaxGroup,
          isActive: true,
          createdBy: this.user,
        },
      });

      return newEntry;
    });

    return new EntitySavedResponseDto(response.id);
  }
  async update(
    id: number,
    salesTaxGroup: SalesTaxGroupInputDto
  ): Promise<void> {
    await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, salesTaxGroup, id);
      await tran.salesTaxGroup.update({
        where: {
          id: id,
          isActive: true,
        },
        data: {
          ...salesTaxGroup,
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
  }: SalesTaxGroupPaginationDto): Promise<
    PaginatedResponseDto<SalesTaxGroupOutputDto>
  > {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: SalesTaxGroupOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const query: Prisma.SalesTaxGroupFindManyArgs = {
      where: {
        isActive: true,
        OR: [
          { salesTaxGroupCode: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
    };

    const [data, count] = await prisma.$transaction([
      prisma.salesTaxGroup.findMany({
        where: query.where,
        skip: skip,
        take: take,
        orderBy: {
          [orderByValue]: direction,
        },
      }),
      prisma.salesTaxGroup.count({ where: query.where }),
    ]);

    return {
      data: SalesTaxGroupOutputDto.fromEntityArray(data),
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<SalesTaxGroupOutputDto | null> {
    const salesTaxGroup = (await prisma.salesTaxGroup.findFirstOrThrow({
      where: { id: id, isActive: true },
    })) as SalesTaxGroup;
    return SalesTaxGroupOutputDto.fromEntity(salesTaxGroup);
  }

  async getByCode(taxGroup: string): Promise<SalesTaxGroupOutputDto | null> {
    const tax = (await prisma.salesTaxGroup.findFirst({
      where: { salesTaxGroupCode: taxGroup, isActive: true },
    })) as SalesTaxGroup;
    return SalesTaxGroupOutputDto.fromEntity(tax);
  }

  async delete(id: number): Promise<void> {
    await prisma.salesTaxGroup.update({
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

  async checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    brand: SalesTaxGroupInputDto,
    id?: number
  ) {
    let idCheck = {};
    if (id) {
      idCheck = {
        id: {
          not: id,
        },
      };
    }

    const existing = await tran.salesTaxGroup.findFirst({
      where: {
        salesTaxGroupCode: brand.salesTaxGroupCode.trim(),
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
