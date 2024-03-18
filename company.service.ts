import prisma from '~/prisma/client';
import { type ServiceBase } from './base/service-interface';
import getISODateTime from '~/utils/get-iso-date-time';
import getSkipTake from '~/utils/get-skip-take';
import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import type CompanyInputDto from '../dtos/company/company-input.dto';
import CompanyOutputDto from '../dtos/company/company-output.dto';
import type CompanyPaginationDto from '../dtos/company/company-pagination.dto';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import { type CompanyOrderBy } from '../dtos/company/company-order-by.dto';
import { type DefaultArgs } from '@prisma/client/runtime/library';

export default class CompanyService
  implements
    ServiceBase<CompanyInputDto, CompanyOutputDto, CompanyPaginationDto>
{
  constructor(private user: string) {}

  async checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    obj: CompanyInputDto,
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
    const existing = await tran.company.findFirst({
      where: {
        companyCode: obj.companyCode.trim(),
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

  async create(company: CompanyInputDto): Promise<EntitySavedResponseDto> {
    const response = await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, company);
      return await tran.company.create({
        data: {
          ...company,
          createdBy: this.user,
        },
      });
    });
    return new EntitySavedResponseDto(response.id);
  }

  async update(id: number, company: CompanyInputDto): Promise<void> {
    await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, company, id);
      await tran.company.update({
        where: {
          id: id,
          isActive: true,
        },
        data: {
          ...company,
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
  }: CompanyPaginationDto): Promise<PaginatedResponseDto<CompanyOutputDto>> {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: CompanyOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const includeCurrency = Prisma.validator<Prisma.CompanyInclude>()({
      BaseCurrency: true,
    });

    const query: Prisma.CompanyWhereInput = {
      isActive: true,
      OR: [
        { companyCode: { contains: searchQuery, mode: 'insensitive' } },
        { companyName: { contains: searchQuery, mode: 'insensitive' } },
      ],
    };

    const [data, count] = await prisma.$transaction([
      prisma.company.findMany({
        where: query,
        include: includeCurrency,
        skip: skip,
        take: take,
        orderBy: {
          [orderByValue]: direction,
        },
      }),
      prisma.company.count({ where: query }),
    ]);

    const companyList: CompanyOutputDto[] = [];
    data.forEach((company) => {
      companyList.push(
        CompanyOutputDto.fromEntity(company, company.BaseCurrency)
      );
    });

    return {
      data: companyList,
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<CompanyOutputDto> {
    const company = await prisma.company.findFirstOrThrow({
      where: { id: id, isActive: true },
      include: { BaseCurrency: true },
    });
    return CompanyOutputDto.fromEntity(company, company.BaseCurrency);
  }

  async delete(id: number): Promise<void> {
    await prisma.company.update({
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
