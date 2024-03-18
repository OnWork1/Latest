// @vitest-environment node
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import client from '~/prisma/__mocks__/client';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';
import { type Product, Prisma, type Brand, type Company } from '@prisma/client';
import getSkipTake from '~/utils/get-skip-take';
import getISODateTime from '~/utils/get-iso-date-time';
import ProductService from '../product.service';
import { type ProductInputDto } from '~/server/dtos/product/product-input.dto';
import ProductOutputDto from '~/server/dtos/product/product-output.dto';
import type ProductPaginationDto from '~/server/dtos/product/product-pagination.dto';

const user = 'testUser';
const service = new ProductService(user);
const pageLimit = 20;

//#region Mock response data
const products: Product[] = [
  {
    id: 1,
    productCode: 'P01',
    productName: 'Product 1',
    companyId: 1,
    brandId: 1,
    businessId: null,
    duration: null,
    createdBy: 'user',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
    isActive: true,
  },
  {
    id: 2,
    productCode: 'P02',
    productName: 'Product 2',
    companyId: 2,
    brandId: 2,
    businessId: null,
    duration: null,
    createdBy: 'user',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
    isActive: true,
  },
];

const brands: Brand[] = [
  {
    brandName: 'brand 1',
    createdBy: 'user',
    id: 1,
    deletedBy: null,
    isActive: true,
    updatedBy: null,
    deletedDate: null,
    updatedDate: null,
    createdDate: new Date(),
  },
  {
    brandName: 'brand 2',
    createdBy: 'user',
    id: 2,
    deletedBy: null,
    isActive: true,
    updatedBy: null,
    deletedDate: null,
    updatedDate: null,
    createdDate: new Date(),
  },
];

const companies: Company[] = [
  {
    id: 1,
    companyCode: 'COMP01',
    companyName: 'Company01',
    baseCurrencyId: 10,
    createdBy: 'user',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
    isActive: true,
  },
  {
    id: 2,
    companyCode: 'COMP02',
    companyName: 'Company02',
    baseCurrencyId: 11,
    createdBy: 'user',
    createdDate: new Date(),
    updatedBy: null,
    updatedDate: null,
    deletedBy: null,
    deletedDate: null,
    isActive: true,
  },
];

const productsWithIncludes = [
  {
    ...products[0],
    Brand: { ...brands[0] },
    Company: { ...companies[0] },
    Business: null,
  },
  {
    ...products[1],
    Brand: { ...brands[1] },
    Company: { ...companies[1] },
    Business: null,
  },
];
//#endregion

vi.mock('~/prisma/client');
mockNuxtImport('useRuntimeConfig', () => {
  return () => {
    return { defaultPageLimit: pageLimit };
  };
});

describe('create()', () => {
  const input: ProductInputDto = {
    productCode: 'P010',
    productName: 'Product 10',
    companyId: 1,
    brandId: 1,
  };
  const createdEntity: Product = products[0];
  it('creates Product if productCode does not exist', async () => {
    //arrange
    const output = new EntitySavedResponseDto(createdEntity.id);
    client.product.create.mockResolvedValue(createdEntity);
    client.product.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.create(input);

    //assert
    expect(client.product.create).toBeCalledWith({
      data: {
        ...input,
        createdBy: user,
      },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if productCode exists', async () => {
    //arrange
    client.product.create.mockResolvedValue(createdEntity);
    client.product.findFirst.mockResolvedValue(products[1]);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.product.findFirst).toBeCalledTimes(1);
    expect(client.product.create).toBeCalledTimes(0);
  });
});

describe('getById()', () => {
  const id = 1;
  it('returns Product with Brand, Company and Business', async () => {
    const foundProduct = productsWithIncludes[0];
    client.product.findFirstOrThrow.mockResolvedValue(foundProduct);
    const output = ProductOutputDto.fromEntity(
      foundProduct,
      foundProduct.Brand,
      foundProduct.Company,
      foundProduct.Business
    );

    // act
    const result = await service.getById(id);

    // assert
    expect(client.product.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
      include: {
        Brand: true,
        Company: true,
        Business: true,
      },
    });
    expect(client.product.findFirstOrThrow).toBeCalledTimes(1);
    expect(result).toStrictEqual(output);
  });

  it('throws error if Product does not exist', async () => {
    // arrange
    client.product.findFirstOrThrow.mockImplementation(() => {
      throw new Error('Product does not exist');
    });

    // act and assert
    await expect(service.getById(id)).rejects.toThrowError(
      'Product does not exist'
    );
    expect(client.product.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
      include: {
        Brand: true,
        Company: true,
        Business: true,
      },
    });
    expect(client.product.findFirstOrThrow).toBeCalledTimes(1);
  });
});

describe('getAll()', () => {
  it('queries with defaults when no parameters are passed and returns Products', async () => {
    // arrange
    client.$transaction.mockResolvedValue([
      productsWithIncludes,
      productsWithIncludes.length,
    ]);
    const { skip, take } = getSkipTake();
    const defaultWhere: Prisma.ProductWhereInput = {
      isActive: true,
      OR: [{ productCode: { contains: undefined, mode: 'insensitive' } }],
    };
    const output = {
      data: arrayToOutput(productsWithIncludes),
      pagination: {
        totalCount: companies.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    // act
    const result = await service.getAll({});

    // assert
    expect(client.product.findMany).toHaveBeenCalledTimes(1);
    expect(client.product.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      include: {
        Brand: true,
        Company: true,
        Business: true,
      },
      skip: skip,
      take: take,
      orderBy: {
        id: 'asc',
      },
    });
    expect(client.product.count).toHaveBeenCalledWith({ where: defaultWhere });
    expect(result).toStrictEqual(output);
  });

  it('queries with input parameters and returns relevant Products', async () => {
    // arrange
    const input: ProductPaginationDto = {
      orderBy: 'productCode',
      orderDirection: 'desc',
      page: 2,
      perPage: 10,
      searchQuery: 'Product 1',
    };
    client.$transaction.mockResolvedValue([
      productsWithIncludes,
      productsWithIncludes.length,
    ]);
    const { skip, take } = getSkipTake(input.perPage, input.page);
    const defaultWhere: Prisma.ProductWhereInput = {
      isActive: true,
      OR: [
        { productCode: { contains: input.searchQuery, mode: 'insensitive' } },
      ],
    };
    const output = {
      data: arrayToOutput(productsWithIncludes),
      pagination: {
        totalCount: companies.length,
        page: input.page,
        perPage: input.perPage,
      },
    };

    // act
    const result = await service.getAll(input);

    // assert
    expect(client.product.findMany).toHaveBeenCalledTimes(1);
    expect(client.product.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      include: {
        Brand: true,
        Company: true,
        Business: true,
      },
      skip: skip,
      take: take,
      orderBy: {
        productCode: 'desc',
      },
    });
    expect(client.product.count).toHaveBeenCalledWith({ where: defaultWhere });
    expect(result).toStrictEqual(output);
  });
});

describe('update()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    return () => vi.useRealTimers();
  });

  const input: ProductInputDto = {
    productCode: 'P010',
    productName: 'Product 10',
    companyId: 1,
    brandId: 1,
  };

  it('updates Product if no other Product has the same productCode', async () => {
    //arrange
    client.product.update.mockResolvedValue(products[0]);
    client.product.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act
    await service.update(1, input);

    //assert
    expect(client.product.update).toBeCalledTimes(1);
    expect(client.product.findFirst).toBeCalledTimes(1);
    expect(client.product.findFirst).toBeCalledWith({
      where: {
        productCode: input.productCode,
        isActive: true,
        id: {
          not: 1,
        },
      },
      select: { id: true },
    });
    expect(client.product.update).toBeCalledWith({
      where: {
        id: 1,
        isActive: true,
      },
      data: {
        ...input,
        updatedBy: user,
        updatedDate: getISODateTime(),
      },
    });
    await expect(service.update(1, input)).resolves.not.toThrow();
  });

  it('throws Error if another product with the same productCode exists', async () => {
    //arrange
    client.product.update.mockResolvedValue(products[0]);
    client.product.findFirst.mockResolvedValue(products[1]);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.product.update).toBeCalledTimes(0);
    expect(client.product.findFirst).toBeCalledTimes(1);
    expect(client.product.findFirst).toBeCalledWith({
      where: {
        productCode: input.productCode,
        isActive: true,
        id: {
          not: 1,
        },
      },
      select: { id: true },
    });
  });
});

describe('delete()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    return () => vi.useRealTimers();
  });

  it('updates isActive to false', async () => {
    //arrange
    const id = 1;
    const updatedEntity: Product = { ...products[1], isActive: false };
    client.product.update.mockResolvedValue(updatedEntity);

    //act and assert
    await expect(service.delete(id)).resolves.not.toThrow();
    expect(client.product.update).toBeCalledWith({
      where: {
        id: id,
        isActive: true,
      },
      data: {
        isActive: false,
        deletedBy: user,
        deletedDate: getISODateTime(),
      },
    });
  });

  it('throws error if Product does not exist', async () => {
    //arrange
    const id = 15;
    client.product.update.mockImplementation(() => {
      throw new Error('Product does not exist');
    });

    //act and assert
    await expect(service.delete(id)).rejects.toThrowError(
      'Product does not exist'
    );
    expect(client.product.update).toBeCalledWith({
      where: {
        id: id,
        isActive: true,
      },
      data: {
        isActive: false,
        deletedBy: user,
        deletedDate: getISODateTime(),
      },
    });
  });
});

function arrayToOutput(data: any[]) {
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
  return productList;
}
