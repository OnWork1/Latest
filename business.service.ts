import { PrismaClient, Prisma } from '@prisma/client';
import { type DefaultArgs } from '@prisma/client/runtime/library';
import prisma from '~/prisma/client';
import getISODateTime from '~/utils/get-iso-date-time';
import getSkipTake from '~/utils/get-skip-take';
import type BusinessInputDto from '../dtos/business/business-input.dto';
import { type BusinessOrderBy } from '../dtos/business/business-order-by.dto';
import BusinessOutputDto from '../dtos/business/business-output.dto';
import type BusinessPaginationDto from '../dtos/business/business-pagination.dto';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import { type ServiceBase } from './base/service-interface';

export default class BusinessService
  implements
    ServiceBase<BusinessInputDto, BusinessOutputDto, BusinessPaginationDto>
{
  constructor(private user: string) {}

  async create(business: BusinessInputDto): Promise<EntitySavedResponseDto> {
    const response = await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, business);
      return await tran.business.create({
        data: {
          ...business,
          createdBy: this.user,
        },
      });
    });
    return new EntitySavedResponseDto(response.id);
  }

  async update(id: number, business: BusinessInputDto): Promise<void> {
    await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, business, id);
      await tran.business.update({
        where: {
          id: id,
          isActive: true,
        },
        data: {
          ...business,
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
  }: BusinessPaginationDto): Promise<PaginatedResponseDto<BusinessOutputDto>> {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: BusinessOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const query: Prisma.BusinessWhereInput = {
      isActive: true,
      OR: [
        { businessCode: { contains: searchQuery, mode: 'insensitive' } },
        { businessName: { contains: searchQuery, mode: 'insensitive' } },
      ],
    };

    const [data, count] = await prisma.$transaction([
      prisma.business.findMany({
        where: query,
        skip: skip,
        take: take,
        orderBy: {
          [orderByValue]: direction,
        },
      }),
      prisma.business.count({ where: query }),
    ]);

    return {
      data: BusinessOutputDto.fromEntityArray(data),
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<BusinessOutputDto | null> {
    const business = await prisma.business.findFirstOrThrow({
      where: { id: id, isActive: true },
    });
    return BusinessOutputDto.fromEntity(business);
  }

  async delete(id: number): Promise<void> {
    await prisma.business.update({
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
    business: BusinessInputDto,
    id?: number | undefined
  ): Promise<void> {
    let idCheck = {};
    if (id) {
      idCheck = {
        id: {
          not: id,
        },
      };
    }
    const existing = await tran.business.findFirst({
      where: {
        businessCode: business.businessCode.trim(),
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
