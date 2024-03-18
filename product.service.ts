import prisma from '~/prisma/client';
import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import { type ServiceBase } from './base/service-interface';
import getISODateTime from '~/utils/get-iso-date-time';
import { Prisma, PrismaClient } from '@prisma/client';
import getSkipTake from '~/utils/get-skip-take';
import { type ProductInputDto } from '../dtos/product/product-input.dto';
import ProductOutputDto from '../dtos/product/product-output.dto';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import type ProductPaginationDto from '../dtos/product/product-pagination.dto';
import { type ProductOrderBy } from '../dtos/product/product-order-by.dto';
import { type DefaultArgs } from '@prisma/client/runtime/library';

export default class ProductService
  implements
    ServiceBase<ProductInputDto, ProductOutputDto, ProductPaginationDto>
{
  constructor(private user: string) {}

  async checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    obj: ProductInputDto,
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
    const existing = await tran.product.findFirst({
      where: {
        productCode: obj.productCode.trim(),
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

  async create(product: ProductInputDto): Promise<EntitySavedResponseDto> {
    const response = await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, product);
      return await tran.product.create({
        data: {
          ...product,
          createdBy: this.user,
        },
      });
    });
    return new EntitySavedResponseDto(response.id);
  }

  async update(id: number, product: ProductInputDto): Promise<void> {
    await prisma.$transaction(async (tran) => {
      await this.checkUniquenessAndThrow(tran, product, id);
      await tran.product.update({
        where: {
          id: id,
          isActive: true,
        },
        data: {
          productCode: product.productCode,
          brandId: product.brandId,
          companyId: product.companyId,
          duration: product.duration,
          productName: product.productName,
          businessId: product.businessId,
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
  }: ProductPaginationDto): Promise<PaginatedResponseDto<ProductOutputDto>> {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: ProductOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const query: Prisma.ProductWhereInput = {
      isActive: true,
      OR: [{ productCode: { contains: searchQuery, mode: 'insensitive' } }],
    };

    const includeBrandsAndCompanies = Prisma.validator<Prisma.ProductInclude>()(
      {
        Brand: true,
        Company: true,
        Business: true,
      }
    );

    const [data, count] = await prisma.$transaction([
      prisma.product.findMany({
        where: query,
        include: includeBrandsAndCompanies,
        skip: skip,
        take: take,
        orderBy: {
          [orderByValue]: direction,
        },
      }),
      prisma.product.count({ where: query }),
    ]);

    const productList: ProductOutputDto[] = [];
    data.forEach(async (product) => {
      productList.push(
        ProductOutputDto.fromEntity(
          product,
          product.Brand,
          product.Company,
          product.Business
        )
      );
    });

    return {
      data: productList,
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<ProductOutputDto> {
    const product = await prisma.product.findFirstOrThrow({
      where: { id: id, isActive: true },
      include: {
        Brand: true,
        Company: true,
        Business: true,
      },
    });
    return ProductOutputDto.fromEntity(
      product,
      product.Brand,
      product.Company,
      product.Business
    );
  }

  async delete(id: number): Promise<void> {
    await prisma.product.update({
      where: { id: id, isActive: true },
      data: {
        isActive: false,
        deletedBy: this.user,
        deletedDate: getISODateTime(),
      },
    });
  }
}
