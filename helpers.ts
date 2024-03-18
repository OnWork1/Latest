import dayjs from 'dayjs';
import { currencies } from '~/utils/currency-list';
import { AccountStatus } from '~/enums/account-status';
import { AppRole } from '~/enums/app-role';
import { type CurrencyDropdown } from '~/interfaces/common/currency-dropdown';

export function convertDateFormat(inputDate: string): string {
  return dayjs(inputDate).format('DD/MM/YYYY');
}

export const getAccountStatuses = (roles: string[]) => {
  const roleFilterMap: Record<string, string[]> = {
    [AppRole.OperationsManager]: [AccountStatus.SUBMITTED],
  };

  const roleFilters: string[] = roles.map((role) => roleFilterMap[role]).flat();
  return accountStatuses.filter(
    (status) => !roleFilters.includes(status.value)
  );
};

export function convertToISOString(date: string | Date): string {
  if (typeof date === 'string') {
    const parts = date.split('/');
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    return new Date(formattedDate).toISOString();
  }
  return new Date(date).toISOString();
}

export function currencyFormatter(amount: number) {
  return (
    new Intl.NumberFormat('en', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount) || 0.0
  );
}

export const getFlagByCurrencyCode = (currencyCode: string): string => {
  return (
    currencies.find(
      (currency: CurrencyDropdown) =>
        currency.currencyCode === currencyCode.toUpperCase()
    )?.flag || ''
  );
};
