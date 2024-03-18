import prisma from '~/prisma/client';
import { type ServiceBase } from './base/service-interface';
import { Prisma, PrismaClient } from '@prisma/client';
import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import getISODateTime from '~/utils/get-iso-date-time';
import getSkipTake from '~/utils/get-skip-take';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import BrandOutputDto from '../dtos/brand/brand-output.dto';
import type BrandInputDto from '../dtos/brand/brand-input.dto';
import { type BrandOrderBy } from '../dtos/brand/brand-order-by.dto';
import type BrandPaginationDto from '../dtos/brand/brand-pagination.dto';
import { type DefaultArgs } from '@prisma/client/runtime/library';

export default class BrandService
  implements ServiceBase<BrandInputDto, BrandOutputDto, BrandPaginationDto>
{
  constructor(private user: string) {}

  async delete(id: number): Promise<void> {
    await prisma.brand.update({
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

  async create(brand: BrandInputDto): Promise<EntitySavedResponseDto> {
    const response = await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, brand);

      const newEntry = await tran.brand.create({
        data: {
          ...brand,
          createdBy: this.user,
        },
      });

      return newEntry;
    });

    return new EntitySavedResponseDto(response.id);
  }

  async checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    brand: BrandInputDto,
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

    const existing = await tran.brand.findFirst({
      where: {
        brandName: brand.brandName.trim(),
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

  async update(id: number, brand: BrandInputDto): Promise<void> {
    await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, brand, id);
      await tran.brand.update({
        where: {
          id: id,
          isActive: true,
        },
        data: {
          ...brand,
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
  }: BrandPaginationDto): Promise<PaginatedResponseDto<BrandOutputDto>> {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: BrandOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const query: Prisma.BrandWhereInput = {
      isActive: true,
      OR: [{ brandName: { contains: searchQuery, mode: 'insensitive' } }],
    };

    const [data, count] = await prisma.$transaction([
      prisma.brand.findMany({
        where: query,
        skip: skip,
        take: take,
        orderBy: {
          [orderByValue]: direction,
        },
      }),
      prisma.brand.count({ where: query }),
    ]);

    return {
      data: BrandOutputDto.fromEntityArray(data),
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<BrandOutputDto> {
    const brand = await prisma.brand.findFirstOrThrow({
      where: { id: id, isActive: true },
    });
    return BrandOutputDto.fromEntity(brand);
  }
}
