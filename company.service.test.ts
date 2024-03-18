// @vitest-environment node
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import client from '~/prisma/__mocks__/client';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';
import { type Company, Prisma, type Currency } from '@prisma/client';
import getSkipTake from '~/utils/get-skip-take';
import getISODateTime from '~/utils/get-iso-date-time';
import CompanyService from '../company.service';
import type CompanyInputDto from '~/server/dtos/company/company-input.dto';
import CompanyOutputDto from '~/server/dtos/company/company-output.dto';
import type CompanyPaginationDto from '~/server/dtos/company/company-pagination.dto';

const user = 'testUser';
const service = new CompanyService(user);
const pageLimit = 20;

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

const currency: Currency = {
  id: 1,
  currencyCode: 'CUR01',
  currencyName: 'Currency 1',
  currencyRate: 21,
  createdBy: 'user',
  createdDate: new Date(),
  updatedBy: null,
  updatedDate: null,
  deletedBy: null,
  deletedDate: null,
  isActive: true,
};

const companiesWithCurrency = [
  {
    ...companies[0],
    BaseCurrency: currency,
  },
  {
    ...companies[1],
    BaseCurrency: currency,
  },
];

vi.mock('~/prisma/client');
mockNuxtImport('useRuntimeConfig', () => {
  return () => {
    return { defaultPageLimit: pageLimit };
  };
});

describe('create()', () => {
  const input: CompanyInputDto = {
    companyCode: 'COMP01',
    companyName: 'Company 1',
    baseCurrencyId: 1,
  };
  const createdEntity: Company = companies[0];
  it('creates Company if companyCode does not exist', async () => {
    //arrange
    const output = new EntitySavedResponseDto(createdEntity.id);
    client.company.create.mockResolvedValue(createdEntity);
    client.company.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act
    const result = await service.create(input);

    //assert
    expect(client.company.create).toBeCalledWith({
      data: {
        ...input,
        createdBy: user,
      },
    });
    expect(result).toStrictEqual(output);
  });

  it('throws error if companyCode exists', async () => {
    //arrange
    client.company.create.mockResolvedValue(createdEntity);
    client.company.findFirst.mockResolvedValue(companies[0]);
    client.$transaction.mockImplementation((callback) => callback(client));

    //act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.company.findFirst).toBeCalledTimes(1);
    expect(client.company.create).toBeCalledTimes(0);
  });
});

describe('getById()', () => {
  const id = 1;
  it('queries and returns Company with companyCode', async () => {
    // arrange
    // const includeCurrency = Prisma.validator<Prisma.CompanyDefaultArgs>()({
    //     include:{BaseCurrency:true}
    //   });

    // type CompanyWithCurrencies = Prisma.CompanyGetPayload<typeof includeCurrency>
    const companyWithCurrency = {
      ...companies[0],
      BaseCurrency: currency,
    };
    client.company.findFirstOrThrow.mockResolvedValue(companyWithCurrency);
    const output = CompanyOutputDto.fromEntity(companies[0], currency);

    // act
    const result = await service.getById(id);

    // assert
    expect(client.company.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
      include: { BaseCurrency: true },
    });
    expect(client.company.findFirstOrThrow).toBeCalledTimes(1);
    expect(result).toStrictEqual(output);
  });

  it('throws error if Company does not exist', async () => {
    // arrange
    client.company.findFirstOrThrow.mockImplementation(() => {
      throw new Error('Company does not exist');
    });

    // act and assert
    await expect(service.getById(id)).rejects.toThrowError(
      'Company does not exist'
    );
    expect(client.company.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: id, isActive: true },
      include: { BaseCurrency: true },
    });
    expect(client.company.findFirstOrThrow).toBeCalledTimes(1);
  });
});

describe('getAll()', () => {
  it('queries with defaults when no parameters are passed and returns Companies', async () => {
    // arrange
    client.$transaction.mockResolvedValue([
      companiesWithCurrency,
      companiesWithCurrency.length,
    ]);
    const { skip, take } = getSkipTake();
    const defaultWhere: Prisma.CompanyWhereInput = {
      isActive: true,
      OR: [
        { companyCode: { contains: undefined, mode: 'insensitive' } },
        { companyName: { contains: undefined, mode: 'insensitive' } },
      ],
    };
    const output = {
      data: arrayToOutput(companiesWithCurrency),
      pagination: {
        totalCount: companies.length,
        page: 1,
        perPage: pageLimit,
      },
    };

    // act
    const result = await service.getAll({});

    // assert
    expect(client.company.findMany).toHaveBeenCalledTimes(1);
    expect(client.company.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      include: { BaseCurrency: true },
      skip: skip,
      take: take,
      orderBy: {
        id: 'asc',
      },
    });
    expect(client.company.count).toHaveBeenCalledWith({ where: defaultWhere });
    expect(result).toStrictEqual(output);
  });

  it('queries with input parameters and returns relevant Companies', async () => {
    // arrange
    const input: CompanyPaginationDto = {
      orderBy: 'companyCode',
      orderDirection: 'desc',
      page: 2,
      perPage: 10,
      searchQuery: 'Company 1',
    };
    client.$transaction.mockResolvedValue([
      companiesWithCurrency,
      companiesWithCurrency.length,
    ]);
    const { skip, take } = getSkipTake(input.perPage, input.page);
    const defaultWhere: Prisma.CompanyWhereInput = {
      isActive: true,
      OR: [
        { companyCode: { contains: input.searchQuery, mode: 'insensitive' } },
        { companyName: { contains: input.searchQuery, mode: 'insensitive' } },
      ],
    };
    const output = {
      data: arrayToOutput(companiesWithCurrency),
      pagination: {
        totalCount: companies.length,
        page: input.page,
        perPage: input.perPage,
      },
    };

    // act
    const result = await service.getAll(input);

    // assert
    expect(client.company.findMany).toHaveBeenCalledTimes(1);
    expect(client.company.findMany).toHaveBeenCalledWith({
      where: defaultWhere,
      include: { BaseCurrency: true },
      skip: skip,
      take: take,
      orderBy: {
        companyCode: 'desc',
      },
    });
    expect(client.company.count).toHaveBeenCalledWith({ where: defaultWhere });
    expect(result).toStrictEqual(output);
  });
});

describe('update()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    return () => vi.useRealTimers();
  });

  const input: CompanyInputDto = {
    companyCode: 'COMP01',
    companyName: 'Company 1',
    baseCurrencyId: 1,
  };

  it('updates Company if no other Company has the same companyCode', async () => {
    //arrange
    client.company.update.mockResolvedValue(companies[0]);
    client.company.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act
    await service.update(1, input);

    //assert
    expect(client.company.update).toBeCalledTimes(1);
    expect(client.company.findFirst).toBeCalledTimes(1);
    expect(client.company.findFirst).toBeCalledWith({
      where: {
        companyCode: input.companyCode,
        isActive: true,
        id: {
          not: 1,
        },
      },
      select: { id: true },
    });
    expect(client.company.update).toBeCalledWith({
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

  it('throws Error if another Company with the same companyCode exists', async () => {
    //arrange
    client.company.update.mockResolvedValue(companies[0]);
    client.company.findFirst.mockResolvedValue(companies[1]);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act and assert
    await expect(service.update(1, input)).rejects.toThrowError(
      Prisma.PrismaClientKnownRequestError
    );
    expect(client.company.update).toBeCalledTimes(0);
    expect(client.company.findFirst).toBeCalledTimes(1);
    expect(client.company.findFirst).toBeCalledWith({
      where: {
        companyCode: input.companyCode,
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
    const updatedEntity: Company = { ...companies[1], isActive: false };
    client.company.update.mockResolvedValue(updatedEntity);

    //act and assert
    await expect(service.delete(id)).resolves.not.toThrow();
    expect(client.company.update).toBeCalledWith({
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

  it('throws error if Company does not exist', async () => {
    //arrange
    const id = 15;
    client.company.update.mockImplementation(() => {
      throw new Error('Company does not exist');
    });

    //act and assert
    await expect(service.delete(id)).rejects.toThrowError(
      'Company does not exist'
    );
    expect(client.company.update).toBeCalledWith({
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

function arrayToOutput(companiesWithCurrency: any[]) {
  const companyList: CompanyOutputDto[] = [];
  companiesWithCurrency.forEach((company) => {
    companyList.push(
      CompanyOutputDto.fromEntity(company, company.BaseCurrency)
    );
  });
  return companyList;
}
