import prisma from '~/prisma/client';
import { type ServiceBase } from './base/service-interface';
import getISODateTime from '~/utils/get-iso-date-time';
import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import { type ExpenseCategory, Prisma, PrismaClient } from '@prisma/client';
import getSkipTake from '~/utils/get-skip-take';
import type ExpenseCategoryInputDto from '../dtos/expense-category/expense-category-input.dto';
import ExpenseCategoryOutputDto from '../dtos/expense-category/expense-category-output.dto';
import type ExpenseCategoryPaginationDto from '../dtos/expense-category/expense-category-pagination.dto';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import { type ExpenseCategoryOrderBy } from '../dtos/expense-category/expense-category-order-by.dto';
import { type DefaultArgs } from '@prisma/client/runtime/library';

export class ExpenseCategoryService
  implements
    ServiceBase<
      ExpenseCategoryInputDto,
      ExpenseCategoryOutputDto,
      ExpenseCategoryPaginationDto
    >
{
  constructor(private user: string) {}
  async checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    obj: ExpenseCategoryInputDto,
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
    const existing = await tran.expenseCategory.findFirst({
      where: {
        expenseCode: obj.expenseCode.trim(),
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
    expenseCategory: ExpenseCategoryInputDto
  ): Promise<EntitySavedResponseDto> {
    const response = await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, expenseCategory);
      return await tran.expenseCategory.create({
        data: {
          ...expenseCategory,
          createdBy: this.user,
        },
      });
    });
    return new EntitySavedResponseDto(response.id);
  }

  async update(
    id: number,
    expenseCategory: ExpenseCategoryInputDto
  ): Promise<void> {
    await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, expenseCategory, id);
      await tran.expenseCategory.update({
        where: {
          id: id,
          isActive: true,
        },
        data: {
          ...expenseCategory,
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
  }: ExpenseCategoryPaginationDto): Promise<
    PaginatedResponseDto<ExpenseCategoryOutputDto>
  > {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: ExpenseCategoryOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const query: Prisma.ExpenseCategoryWhereInput = {
      isActive: true,
      OR: [
        { expenseCode: { contains: searchQuery, mode: 'insensitive' } },
        { expenseName: { contains: searchQuery, mode: 'insensitive' } },
      ],
    };

    const [data, count] = await prisma.$transaction([
      prisma.expenseCategory.findMany({
        where: query,
        skip: skip,
        take: take,
        orderBy: {
          [orderByValue]: direction,
        },
      }),
      prisma.expenseCategory.count({ where: query }),
    ]);

    return {
      data: ExpenseCategoryOutputDto.fromEntityArray(data),
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<ExpenseCategoryOutputDto> {
    const expenseCategory = await prisma.expenseCategory.findFirstOrThrow({
      where: { id: id, isActive: true },
    });
    return ExpenseCategoryOutputDto.fromEntity(expenseCategory);
  }

  async getByCode(expenseCode: string): Promise<ExpenseCategory | null> {
    const expense = await prisma.expenseCategory.findFirst({
      where: { expenseCode: expenseCode, isActive: true },
    });
    return expense;
  }

  async delete(id: number): Promise<void> {
    await prisma.expenseCategory.update({
      where: { id: id, isActive: true },
      data: {
        isActive: false,
        deletedBy: this.user,
        deletedDate: getISODateTime(),
      },
    });
  }
}
