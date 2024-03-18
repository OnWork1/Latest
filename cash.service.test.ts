// @vitest-environment node
import { type Currency, Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import client from '~/prisma/__mocks__/client';
import type CashDetail from '~/server/dtos/cash/cash-detail-output.dto';
import CashService from '../cash.service';

const user = 'testUser';
const service = new CashService(user);

vi.mock('~/prisma/client');

describe('getBalance()', () => {
  it('throws an error if leaderId cannot be found', async () => {
    // arrange
    client.user.findFirst.mockResolvedValue(null);
    client.$transaction.mockImplementation((callback) => callback(client));

    // act and assert
    await expect(service.getBalance()).rejects.toThrowError('User Not found');
    expect(client.user.findFirst).toBeCalledTimes(1);
  });

  it('returns cash balance', async () => {
    // arrange
    const userQueryResult = {
      id: 2,
    };

    const currencies: Currency[] = [
      {
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
      },
      {
        id: 2,
        currencyCode: 'CUR02',
        currencyName: 'Currency 2',
        currencyRate: 30,
        createdBy: 'user',
        createdDate: new Date(),
        updatedBy: null,
        updatedDate: null,
        deletedBy: null,
        deletedDate: null,
        isActive: true,
      },
    ];

    const currencyIds = [{ currencyId: 1 }, { currencyId: 2 }];

    const expensesByCurrencyIdWithSum = [
      { currencyId: 1, _sum: { amount: 10 } },
      { currencyId: 2, _sum: { amount: 60 } },
    ];
    const withdrawalsByCurrencyIdWithSum = [
      { currencyId: 1, _sum: { amount: 50 } },
      { currencyId: 2, _sum: { amount: 10 } },
    ];

    //@ts-ignore https://github.com/prisma/prisma/discussions/13817
    client.user.findFirst.mockResolvedValue(userQueryResult);

    client.currency.findMany.mockResolvedValue(currencies);

    client.expense.groupBy
      //@ts-expect-error https://github.com/prisma/prisma/issues/20146
      .mockResolvedValueOnce(currencyIds)
      .mockResolvedValueOnce(expensesByCurrencyIdWithSum)
      .mockResolvedValueOnce(withdrawalsByCurrencyIdWithSum);

    client.$transaction.mockImplementation((callback) => callback(client));

    const output: CashDetail[] = [
      { currencyCode: 'CUR01', availableBalance: new Prisma.Decimal(40) },
      { currencyCode: 'CUR02', availableBalance: new Prisma.Decimal(-50) },
    ];

    const result = await service.getBalance();
    expect(client.user.findFirst).toBeCalledTimes(1);
    expect(client.currency.findMany).toBeCalledTimes(1);
    expect(client.expense.groupBy).toBeCalledTimes(3);
    expect(result).toStrictEqual(output);
  });
});
