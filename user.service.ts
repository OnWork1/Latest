import { Prisma, PrismaClient } from '@prisma/client';
import { type DefaultArgs } from '@prisma/client/runtime/library';
import prisma from '~/prisma/client';
import getISODateTime from '~/utils/get-iso-date-time';
import getSkipTake from '~/utils/get-skip-take';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import type UserInputDto from '../dtos/user/user-input.dto';
import { type UserOrderBy } from '../dtos/user/user-order-by.dto';
import UserOutputDto from '../dtos/user/user-output.dto';
import type UserPaginationDto from '../dtos/user/user-pagination.dto';
import { type ServiceBase } from './base/service-interface';

export default class UserService
  implements ServiceBase<UserInputDto, UserOutputDto, UserPaginationDto>
{
  constructor(private user: string) {}

  async checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    obj: UserInputDto,
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
    const existing = await tran.user.findFirst({
      where: {
        userAccount: obj.userAccount.trim(),
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

  async create(user: UserInputDto): Promise<EntitySavedResponseDto> {
    const response = await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, user);
      return await tran.user.create({
        data: {
          ...user,
          isActive: true,
          createdBy: this.user,
        },
      });
    });
    return new EntitySavedResponseDto(response.id);
  }

  async update(id: number, user: UserInputDto): Promise<void> {
    await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, user, id);
      await tran.user.update({
        where: {
          id: id,
          isActive: true,
        },
        data: {
          ...user,
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
  }: UserPaginationDto): Promise<PaginatedResponseDto<UserOutputDto>> {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: UserOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const query: Prisma.UserFindManyArgs = {
      where: {
        isActive: true,
        OR: [
          { userAccount: { contains: searchQuery, mode: 'insensitive' } },
          { cardCode: { contains: searchQuery, mode: 'insensitive' } },
          { cashCode: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
    };

    const [data, count] = await prisma.$transaction([
      prisma.user.findMany({
        where: query.where,
        skip: skip,
        take: take,
        orderBy: {
          [orderByValue]: direction,
        },
        include: { Company: true },
      }),
      prisma.user.count({ where: query.where }),
    ]);

    const results: UserOutputDto[] = [];

    data.forEach((user) => {
      results.push(UserOutputDto.fromEntity(user, user.Company));
    });

    // if (data) {
    //   for (const userIdx in data) {
    //     if (Object.prototype.hasOwnProperty.call(data, userIdx)) {
    //       const user = data[userIdx];

    //       const userObj: UserOutputDto = {
    //         id: user.id,
    //         userAccount: user.userAccount,
    //         cardCode: user.cardCode ?? '',
    //         cashCode: user.cashCode ?? '',
    //         isActive: user.isActive,
    //         companyId: user.companyId,
    //         companyCode: user.Company.companyCode,
    //       };

    //       results.push(userObj);
    //     }
    //   }
    // }

    return {
      data: results,
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<UserOutputDto | null> {
    const user = await prisma.user.findFirstOrThrow({
      where: { id: id, isActive: true },
      include: { Company: true },
    });
    return UserOutputDto.fromEntity(user, user.Company);
  }

  async getByCode(cardCode: string): Promise<UserOutputDto | null> {
    const user = await prisma.user.findFirst({
      where: {
        cardCode: { equals: cardCode, mode: 'insensitive' },
        isActive: true,
      },
      include: { Company: true },
    });

    if (user) return UserOutputDto.fromEntity(user!, user!.Company);
    else return null;
  }

  async delete(id: number): Promise<void> {
    await prisma.user.update({
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
