import { maxFileUploadSize } from '~/utils/constants';
import { describe, test, expect } from 'vitest';
import type { PaymentType } from '~/interfaces/common/payment-types';
import type { CostType } from '~/interfaces/common/cost-types';

describe('constants', () => {
  test('maxFileUploadSize', () => {
    expect(maxFileUploadSize).toBe(26214400);
  });

  test('defaultPaginationValues', () => {
    const expectedValues = {
      page: 1,
      perPage: 5,
      totalCount: 0,
      searchString: '',
    };
    expect(defaultPaginationValues).toEqual(expectedValues);
  });

  test('paymentTypes', () => {
    const expectedPaymentTypes: PaymentType[] = [
      { paymentType: 'Cash', value: 'CASH' },
      { paymentType: 'Card', value: 'CARD' },
    ];
    expect(paymentTypes).toEqual(expectedPaymentTypes);
  });

  test('costType', () => {
    const expectedCostTypes: CostType[] = [
      { costTypeText: 'Passenger', value: 'PERSON' },
      { costTypeText: 'Leader', value: 'LEADER' },
    ];
    expect(costType).toEqual(expectedCostTypes);
  });
});
