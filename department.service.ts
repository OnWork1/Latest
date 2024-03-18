import prisma from '~/prisma/client';
import { type ServiceBase } from './base/service-interface';
import getISODateTime from '~/utils/get-iso-date-time';
import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import getSkipTake from '~/utils/get-skip-take';
import { type Department, Prisma, PrismaClient } from '@prisma/client';
import type DepartmentInputDto from '../dtos/department/department-input.dto';
import DepartmentOutputDto from '../dtos/department/department-output.dto';
import type DepartmentPaginationDto from '../dtos/department/department-pagination.dto';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import { type DepartmentOrderBy } from '../dtos/department/department-order-by.dto';
import { type DefaultArgs } from '@prisma/client/runtime/library';

export default class DepartmentService
  implements
    ServiceBase<
      DepartmentInputDto,
      DepartmentOutputDto,
      DepartmentPaginationDto
    >
{
  constructor(private user: string) {}

  async checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    obj: DepartmentInputDto,
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
    const existing = await tran.department.findFirst({
      where: {
        departmentCode: obj.departmentCode.trim(),
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

  async create(
    department: DepartmentInputDto
  ): Promise<EntitySavedResponseDto> {
    const response = await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, department);
      return await tran.department.create({
        data: {
          ...department,
          createdBy: this.user,
        },
      });
    });
    return new EntitySavedResponseDto(response.id);
  }

  async update(id: number, department: DepartmentInputDto): Promise<void> {
    const response = await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, department, id);
      await tran.department.update({
        where: {
          id: id,
          isActive: true,
        },
        data: {
          ...department,
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
  }: DepartmentPaginationDto): Promise<
    PaginatedResponseDto<DepartmentOutputDto>
  > {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: DepartmentOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const query: Prisma.DepartmentWhereInput = {
      isActive: true,
      OR: [
        { departmentCode: { contains: searchQuery, mode: 'insensitive' } },
        { departmentName: { contains: searchQuery, mode: 'insensitive' } },
      ],
    };

    const [data, count] = await prisma.$transaction([
      prisma.department.findMany({
        where: query,
        skip: skip,
        take: take,
        orderBy: {
          [orderByValue]: direction,
        },
      }),
      prisma.department.count({ where: query }),
    ]);

    return {
      data: DepartmentOutputDto.fromEntityArray(data),
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<DepartmentOutputDto | null> {
    const department = await prisma.department.findFirstOrThrow({
      where: { id: id, isActive: true },
    });
    return DepartmentOutputDto.fromEntity(department);
  }

  async getByCode(departmentCode: string): Promise<DepartmentOutputDto | null> {
    const department = await prisma.department.findFirst({
      where: { departmentCode: departmentCode, isActive: true },
    });
    return DepartmentOutputDto.fromEntity(department);
  }

  async delete(id: number): Promise<void> {
    await prisma.department.update({
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
